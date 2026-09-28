"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireOperator } from "@/lib/admin/auth";
import { adminPassword, isAdminConfigured } from "@/lib/admin/config";
import {
  checkLoginAllowed,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/lib/admin/rate-limit";
import {
  createSessionToken,
  isOperator,
  passwordMatches,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/admin/session";
import { getDb } from "@/lib/db/client";
import { quotes, settings } from "@/lib/db/schema";
import {
  clampPackingPct,
  computeQuote,
  DEFAULT_PRICING_SETTINGS,
  HEAVY_MATERIALS,
  ITEM_FLAGS,
  type PricingSettings,
} from "@/lib/quote-engine";
import { loadPricingSettings } from "@/lib/admin/data";

/**
 * Every mutation the panel can perform.
 *
 * All of them re-check the session for themselves. `proxy.ts` covers Server
 * Function POSTs today because they post to the page's own `/admin/...` path,
 * but the Next docs are explicit that a matcher edit can silently drop that
 * coverage, so the check lives here too.
 *
 * The price a quote is stored with is always recomputed on the server from
 * the saved settings. The browser's live figure is a preview; it never
 * becomes the number of record.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

// --- Login / logout --------------------------------------------------------

/**
 * Backoff key. Behind Vercel the client IP is the first hop in
 * `x-forwarded-for`; falling back to a constant means an unknown client
 * shares one bucket, which for a two-person tool is the safe direction.
 */
async function backoffKey(): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || store.get("x-real-ip") || "unknown";
}

const GENERIC_LOGIN_ERROR = "That did not work. Check the name and password.";

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const expected = adminPassword();
  if (!expected) {
    return { ok: false, error: "ADMIN_PASSWORD is not configured on this deployment." };
  }

  const key = await backoffKey();
  const gate = checkLoginAllowed(key);
  if (!gate.allowed) {
    return {
      ok: false,
      error: `Too many attempts. Try again in ${gate.retryAfterSeconds}s.`,
    };
  }

  const name = formData.get("name");
  const password = formData.get("password");

  // One generic message for every failure mode, so a wrong password and an
  // unknown name are indistinguishable from outside.
  if (!isOperator(name) || typeof password !== "string" || !passwordMatches(password, expected)) {
    const next = recordLoginFailure(key);
    return {
      ok: false,
      error: next.allowed
        ? GENERIC_LOGIN_ERROR
        : `${GENERIC_LOGIN_ERROR} Locked for ${next.retryAfterSeconds}s.`,
    };
  }

  recordLoginSuccess(key);

  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    createSessionToken({ name, issuedAt: Date.now() }, expected),
    SESSION_COOKIE_OPTIONS,
  );

  const requested = formData.get("next");
  // Only ever redirect inside the panel — never to an absolute URL a crafted
  // link could supply. `typedRoutes` cannot check a string parsed out of form
  // data, so the regex above is what stands in for that guarantee.
  const destination =
    typeof requested === "string" &&
    /^\/admin(?:\/|$)/.test(requested) &&
    !requested.startsWith("//")
      ? (requested as Route)
      : "/admin";

  redirect(destination);
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// --- Quotes ----------------------------------------------------------------

const itemLineSchema = z.object({
  catalogId: z.number().int().nullable(),
  custom: z.boolean(),
  label: z.string().trim().min(1).max(120),
  qty: z.number().int().min(1).max(999),
  cubicFeetEach: z.number().min(0).max(5000),
  surchargeCents: z.number().int().min(0).max(10_000_00).nullable(),
  flags: z.array(z.enum(ITEM_FLAGS)).max(ITEM_FLAGS.length),
});

const quotePayloadSchema = z.object({
  id: z.number().int().positive().nullable(),
  customerName: z.string().trim().max(120).default(""),
  customerPhone: z.string().trim().max(40).default(""),
  customerArea: z.string().trim().max(120).default(""),
  items: z.array(itemLineSchema).max(200),
  packingPct: z.number().min(0).max(100),
  labor: z.object({
    stairsFlights: z.number().int().min(0).max(50),
    carryDistance: z.enum(["standard", "long"]),
    disassembly: z.number().int().min(0).max(50),
  }),
  heavyMode: z.boolean(),
  heavy: z
    .object({
      materialType: z.enum(HEAVY_MATERIALS),
      estWeightKg: z.number().min(0).max(100_000),
    })
    .nullable(),
  discount: z
    .object({
      type: z.enum(["percent", "amount"]),
      value: z.number().min(0),
      reason: z.string().trim().max(200).default(""),
    })
    .nullable(),
  status: z.enum(["draft", "sent", "won", "lost"]),
  notes: z.string().trim().max(4000).default(""),
});

export type QuotePayload = z.infer<typeof quotePayloadSchema>;

export interface SaveQuoteResult extends ActionResult {
  id?: number;
}

export async function saveQuoteAction(raw: unknown): Promise<SaveQuoteResult> {
  const operator = await requireOperator();
  if (!isAdminConfigured()) {
    return { ok: false, error: "The database is not configured on this deployment." };
  }

  const parsed = quotePayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: `That quote did not validate: ${parsed.error.issues[0]?.message}` };
  }
  const payload = parsed.data;

  const db = getDb();
  if (!db) return { ok: false, error: "The database is not reachable." };

  // Recompute server-side from the stored settings. The client's number was
  // a preview; this is the one that gets written.
  const pricing = await loadPricingSettings();
  const packingPct = clampPackingPct(payload.packingPct);
  const computed = computeQuote(
    {
      items: payload.items.map((line) => ({
        catalogId: line.catalogId,
        label: line.label,
        qty: line.qty,
        cubicFeetEach: line.cubicFeetEach,
        surchargeCents: line.surchargeCents,
        flags: line.flags,
      })),
      packingPct,
      labor: payload.labor,
      heavyMode: payload.heavyMode,
      heavy: payload.heavy,
      discount: payload.discount,
    },
    pricing,
  );

  const row = {
    createdBy: operator,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    customerArea: payload.customerArea,
    itemLines: payload.items,
    packingPct,
    labor: payload.labor,
    heavyMode: payload.heavyMode,
    heavy: payload.heavy,
    computed,
    discount: payload.discount,
    finalLowCents: computed.lowCents,
    finalHighCents: computed.highCents,
    status: payload.status,
    notes: payload.notes,
  };

  let id = payload.id ?? undefined;

  if (id) {
    // `created_by` is the audit field for who raised the quote, so an edit
    // must not overwrite it.
    const { createdBy: _ignored, ...editable } = row;
    void _ignored;
    await db.update(quotes).set(editable).where(eq(quotes.id, id));
  } else {
    const [inserted] = await db.insert(quotes).values(row).returning({ id: quotes.id });
    id = inserted?.id;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/quotes");
  if (id) revalidatePath(`/admin/quotes/${id}`);

  return { ok: true, id };
}

const statusSchema = z.enum(["draft", "sent", "won", "lost"]);

export async function updateQuoteStatusAction(
  quoteId: number,
  status: string,
): Promise<ActionResult> {
  await requireOperator();

  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Unknown status." };
  if (!Number.isInteger(quoteId)) return { ok: false, error: "Unknown quote." };

  const db = getDb();
  if (!db) return { ok: false, error: "The database is not reachable." };

  await db.update(quotes).set({ status: parsed.data }).where(eq(quotes.id, quoteId));

  revalidatePath("/admin");
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${quoteId}`);
  return { ok: true };
}

export async function updateQuoteNotesAction(
  quoteId: number,
  notes: string,
): Promise<ActionResult> {
  await requireOperator();
  if (!Number.isInteger(quoteId)) return { ok: false, error: "Unknown quote." };

  const db = getDb();
  if (!db) return { ok: false, error: "The database is not reachable." };

  await db
    .update(quotes)
    .set({ notes: notes.slice(0, 4000) })
    .where(eq(quotes.id, quoteId));

  revalidatePath(`/admin/quotes/${quoteId}`);
  return { ok: true };
}

// --- Settings --------------------------------------------------------------

// A record keyed by the flag enum, so adding a flag to the engine makes this
// form field required rather than silently optional.
const surchargeSchema = z.record(
  z.enum(ITEM_FLAGS),
  z.coerce.number().int().min(0).max(1_000_00),
);

const pricingSchema = z.object({
  truckCapacityFt3: z.coerce.number().min(1).max(5000),
  minJobCents: z.coerce.number().int().min(0).max(1_000_00),
  ratePerYd3Cents: z.coerce.number().int().min(0).max(1_000_00),
  packingPct: z.coerce.number().min(10).max(30),
  rangeSpreadPct: z.coerce.number().min(0).max(50),
  surchargeCents: surchargeSchema,
  laborCents: z.object({
    stairsPerFlight: z.coerce.number().int().min(0).max(100_00),
    longCarry: z.coerce.number().int().min(0).max(100_00),
    disassembly: z.coerce.number().int().min(0).max(100_00),
  }),
  heavyRatePerTonneCents: z.coerce.number().int().min(0).max(1_000_00),
  tippingFeePerTonneCents: z.coerce.number().int().min(0).max(1_000_00),
  laborRatePerHourCents: z.coerce.number().int().min(0).max(1_000_00),
  fuelFlatCents: z.coerce.number().int().min(0).max(1_000_00),
  avgDensityKgPerYd3: z.coerce.number().min(1).max(2000),
});

function numberField(formData: FormData, name: string): number {
  return Number(formData.get(name) ?? Number.NaN);
}

export async function saveSettingsAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const operator = await requireOperator();

  const db = getDb();
  if (!db) return { ok: false, error: "The database is not reachable." };

  const candidate = {
    truckCapacityFt3: numberField(formData, "truckCapacityFt3"),
    minJobCents: numberField(formData, "minJobCents"),
    ratePerYd3Cents: numberField(formData, "ratePerYd3Cents"),
    packingPct: numberField(formData, "packingPct"),
    rangeSpreadPct: numberField(formData, "rangeSpreadPct"),
    surchargeCents: Object.fromEntries(
      ITEM_FLAGS.map((flag) => [flag, numberField(formData, `surcharge_${flag}`)]),
    ),
    laborCents: {
      stairsPerFlight: numberField(formData, "labor_stairsPerFlight"),
      longCarry: numberField(formData, "labor_longCarry"),
      disassembly: numberField(formData, "labor_disassembly"),
    },
    heavyRatePerTonneCents: numberField(formData, "heavyRatePerTonneCents"),
    tippingFeePerTonneCents: numberField(formData, "tippingFeePerTonneCents"),
    laborRatePerHourCents: numberField(formData, "laborRatePerHourCents"),
    fuelFlatCents: numberField(formData, "fuelFlatCents"),
    avgDensityKgPerYd3: numberField(formData, "avgDensityKgPerYd3"),
  };

  const parsed = pricingSchema.safeParse(candidate);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue?.path.join(".") ?? "A field"}: ${issue?.message}` };
  }

  // Saving Settings by hand is exactly the signal the placeholder capacity has
  // been checked against the real truck, so this is where the banner clears.
  const pricing: PricingSettings = {
    ...DEFAULT_PRICING_SETTINGS,
    ...parsed.data,
    truckCapacityVerified: true,
  };

  await db
    .insert(settings)
    .values({ id: 1, pricing, updatedBy: operator, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settings.id,
      set: { pricing, updatedBy: operator, updatedAt: new Date() },
    });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/quotes/new");
  return { ok: true };
}
