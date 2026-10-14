"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { requireOperator } from "@/lib/admin/auth";
import { getMigratedDb } from "@/lib/db/migrations";
import {
  activityLog,
  aiActions,
  invoices,
  INVOICE_STATUSES,
  payments,
  PAYMENT_METHODS,
  quotes,
  settings,
} from "@/lib/db/schema";
import type { InvoiceLineRow } from "@/lib/db/schema";
import { computeInvoiceTotals, invoiceLinesFromQuote, invoiceNumber } from "@/lib/admin/billing";
import { loadBillingSettings } from "@/lib/admin/billing-data";
import { DEFAULT_BILLING_SETTINGS } from "@/content/billing";

/**
 * Billing mutations.
 *
 * Every action re-checks the session with `requireOperator()`, matching the CRM
 * actions and the security test. No action here ever moves real money or
 * contacts a customer on its own: payments are hand-recorded facts, and
 * "send to customer" only drops a row into the Control approval queue.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const DB_UNREACHABLE = "The database is not reachable.";

function revalidateBilling(extra: string[] = []): void {
  for (const path of ["/admin", "/admin/billing", ...extra]) revalidatePath(path);
}

function dollarsToCents(value: number): number {
  return Math.round(value * 100);
}

const lineInputSchema = z.object({
  label: z.string().trim().min(1).max(160),
  qty: z.coerce.number().min(0).max(9999).default(1),
  unitDollars: z.coerce.number().min(0).max(1_000_000),
});

const createInvoiceSchema = z.object({
  quoteId: z.coerce.number().int().positive().nullable().default(null),
  clientId: z.coerce.number().int().positive().nullable().default(null),
  jobId: z.coerce.number().int().positive().nullable().default(null),
  customerName: z.string().trim().max(160).default(""),
  customerEmail: z.string().trim().max(200).default(""),
  customerPhone: z.string().trim().max(60).default(""),
  customerAddress: z.string().trim().max(300).default(""),
  lines: z.array(lineInputSchema).min(1).max(40),
  notes: z.string().trim().max(2000).default(""),
});

function toLineRows(
  lines: z.infer<typeof lineInputSchema>[],
): InvoiceLineRow[] {
  return lines.map((line) => {
    const unitCents = dollarsToCents(line.unitDollars);
    return {
      label: line.label,
      qty: line.qty,
      unitCents,
      amountCents: Math.round(unitCents * line.qty),
    };
  });
}

export interface SaveInvoiceResult extends ActionResult {
  id?: number;
}

export async function createInvoiceAction(raw: unknown): Promise<SaveInvoiceResult> {
  const operator = await requireOperator();

  const parsed = createInvoiceSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That invoice did not validate." };
  }

  const db = await getMigratedDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const billing = await loadBillingSettings();
  const lineRows = toLineRows(parsed.data.lines);
  const totals = computeInvoiceTotals(lineRows, billing);

  const [inserted] = await db
    .insert(invoices)
    .values({
      quoteId: parsed.data.quoteId,
      clientId: parsed.data.clientId,
      jobId: parsed.data.jobId,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerPhone: parsed.data.customerPhone,
      customerAddress: parsed.data.customerAddress,
      lineItems: lineRows,
      subtotalCents: totals.subtotalCents,
      gstCents: totals.gstCents,
      pstCents: totals.pstCents,
      totalCents: totals.totalCents,
      depositCents: totals.depositCents,
      notes: parsed.data.notes,
      status: "draft",
      createdBy: operator,
    })
    .returning({ id: invoices.id });

  if (!inserted) return { ok: false, error: "Could not create that invoice." };

  // The human number is derived from the id, so it needs the id first.
  await db
    .update(invoices)
    .set({ number: invoiceNumber(inserted.id) })
    .where(eq(invoices.id, inserted.id));

  if (parsed.data.clientId) {
    await db.insert(activityLog).values({
      entityType: "client",
      entityId: parsed.data.clientId,
      actor: operator,
      kind: "system",
      body: `Invoice ${invoiceNumber(inserted.id)} raised (${(totals.totalCents / 100).toFixed(2)} CAD).`,
    });
  }

  revalidateBilling();
  return { ok: true, id: inserted.id };
}

/** Prefills a draft invoice from a won quote, carrying its customer + range. */
export async function createInvoiceFromQuoteAction(quoteId: number): Promise<SaveInvoiceResult> {
  const operator = await requireOperator();
  if (!Number.isInteger(quoteId)) return { ok: false, error: "Unknown quote." };

  const db = await getMigratedDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1);
  if (!quote) return { ok: false, error: "That quote no longer exists." };

  const billing = await loadBillingSettings();
  const lineRows = invoiceLinesFromQuote(quote);
  const totals = computeInvoiceTotals(lineRows, billing);

  const [inserted] = await db
    .insert(invoices)
    .values({
      quoteId: quote.id,
      clientId: quote.clientId,
      jobId: quote.jobId,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      customerAddress: quote.customerArea,
      lineItems: lineRows,
      subtotalCents: totals.subtotalCents,
      gstCents: totals.gstCents,
      pstCents: totals.pstCents,
      totalCents: totals.totalCents,
      depositCents: totals.depositCents,
      status: "draft",
      createdBy: operator,
    })
    .returning({ id: invoices.id });

  if (!inserted) return { ok: false, error: "Could not create that invoice." };

  await db
    .update(invoices)
    .set({ number: invoiceNumber(inserted.id) })
    .where(eq(invoices.id, inserted.id));

  revalidateBilling([`/admin/quotes/${quoteId}`]);
  return { ok: true, id: inserted.id };
}

const editInvoiceSchema = createInvoiceSchema.omit({ quoteId: true });

/** Edit a draft invoice's lines / customer / notes. Only while it is a draft. */
export async function updateInvoiceAction(
  invoiceId: number,
  raw: unknown,
): Promise<ActionResult> {
  await requireOperator();
  if (!Number.isInteger(invoiceId)) return { ok: false, error: "Unknown invoice." };

  const parsed = editInvoiceSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Those changes did not validate." };
  }

  const db = await getMigratedDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [current] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!current) return { ok: false, error: "That invoice no longer exists." };
  if (current.status !== "draft") {
    return { ok: false, error: "Only a draft invoice can be edited. Void it to start over." };
  }

  const billing = await loadBillingSettings();
  const lineRows = toLineRows(parsed.data.lines);
  const totals = computeInvoiceTotals(lineRows, billing);

  await db
    .update(invoices)
    .set({
      clientId: parsed.data.clientId,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerPhone: parsed.data.customerPhone,
      customerAddress: parsed.data.customerAddress,
      lineItems: lineRows,
      subtotalCents: totals.subtotalCents,
      gstCents: totals.gstCents,
      pstCents: totals.pstCents,
      totalCents: totals.totalCents,
      depositCents: totals.depositCents,
      notes: parsed.data.notes,
    })
    .where(eq(invoices.id, invoiceId));

  revalidateBilling([`/admin/billing/${invoiceId}`]);
  return { ok: true };
}

export async function updateInvoiceStatusAction(
  invoiceId: number,
  status: string,
): Promise<ActionResult> {
  const operator = await requireOperator();

  const parsed = z.enum(INVOICE_STATUSES).safeParse(status);
  if (!parsed.success) return { ok: false, error: "Unknown status." };
  if (!Number.isInteger(invoiceId)) return { ok: false, error: "Unknown invoice." };

  const db = await getMigratedDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [current] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!current) return { ok: false, error: "That invoice no longer exists." };

  const patch: Record<string, unknown> = { status: parsed.data };

  // Moving to "sent" stamps the issue + due dates once.
  if (parsed.data === "sent" && !current.issuedAt) {
    const billing = await loadBillingSettings();
    const issuedAt = new Date();
    const dueAt = new Date(issuedAt);
    dueAt.setDate(dueAt.getDate() + (billing.netDays ?? DEFAULT_BILLING_SETTINGS.netDays));
    patch.issuedAt = issuedAt;
    patch.dueAt = dueAt;
  }

  await db.update(invoices).set(patch).where(eq(invoices.id, invoiceId));

  if (current.clientId) {
    await db.insert(activityLog).values({
      entityType: "client",
      entityId: current.clientId,
      actor: operator,
      kind: "system",
      body: `Invoice ${current.number || invoiceNumber(invoiceId)} marked ${parsed.data}.`,
    });
  }

  revalidateBilling([`/admin/billing/${invoiceId}`]);
  return { ok: true };
}

const paymentSchema = z.object({
  amountDollars: z.coerce.number().positive().max(1_000_000),
  method: z.enum(PAYMENT_METHODS),
  receivedAt: z.string().trim().max(32).default(""),
  note: z.string().trim().max(500).default(""),
});

export async function recordPaymentAction(
  invoiceId: number,
  raw: unknown,
): Promise<ActionResult> {
  const operator = await requireOperator();
  if (!Number.isInteger(invoiceId)) return { ok: false, error: "Unknown invoice." };

  const parsed = paymentSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That payment did not validate." };
  }

  const db = await getMigratedDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!invoice) return { ok: false, error: "That invoice no longer exists." };
  if (invoice.status === "void") return { ok: false, error: "This invoice is void." };

  const receivedAt = parsed.data.receivedAt ? new Date(parsed.data.receivedAt) : new Date();
  const amountCents = dollarsToCents(parsed.data.amountDollars);

  await db.insert(payments).values({
    invoiceId,
    amountCents,
    method: parsed.data.method,
    receivedAt: Number.isNaN(receivedAt.getTime()) ? new Date() : receivedAt,
    receivedBy: operator,
    note: parsed.data.note,
  });

  // Re-sum and auto-advance to paid when the balance is cleared.
  const [agg] = await db
    .select({ paid: sql<number>`coalesce(sum(${payments.amountCents}), 0)`.mapWith(Number) })
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId));
  const paid = agg?.paid ?? 0;

  if (paid >= invoice.totalCents && invoice.status !== "paid") {
    await db.update(invoices).set({ status: "paid" }).where(eq(invoices.id, invoiceId));
  } else if (invoice.status === "draft") {
    // A payment on a draft implies it is live; promote it to sent.
    await db.update(invoices).set({ status: "sent" }).where(eq(invoices.id, invoiceId));
  }

  if (invoice.clientId) {
    await db.insert(activityLog).values({
      entityType: "client",
      entityId: invoice.clientId,
      actor: operator,
      kind: "system",
      body: `Payment ${(amountCents / 100).toFixed(2)} CAD on invoice ${invoice.number || invoiceNumber(invoiceId)} (${parsed.data.method}).`,
    });
  }

  revalidateBilling([`/admin/billing/${invoiceId}`]);
  return { ok: true };
}

export async function deletePaymentAction(paymentId: number): Promise<ActionResult> {
  await requireOperator();
  if (!Number.isInteger(paymentId)) return { ok: false, error: "Unknown payment." };

  const db = await getMigratedDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  if (!payment) return { ok: true };
  const invoiceId = payment.invoiceId;

  await db.delete(payments).where(eq(payments.id, paymentId));

  // If removing the payment drops the balance below zero-cleared, step a paid
  // invoice back to sent so the balance shown is honest.
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (invoice && invoice.status === "paid") {
    const [agg] = await db
      .select({ paid: sql<number>`coalesce(sum(${payments.amountCents}), 0)`.mapWith(Number) })
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId));
    if ((agg?.paid ?? 0) < invoice.totalCents) {
      await db.update(invoices).set({ status: "sent" }).where(eq(invoices.id, invoiceId));
    }
  }

  revalidateBilling([`/admin/billing/${invoiceId}`]);
  return { ok: true };
}

/**
 * "Send to customer" — drops the invoice into the Control approval queue rather
 * than emailing anyone. Nothing leaves the panel until the owner approves, and
 * actual delivery (email/SMS) is a Phase 2 wiring on top of the approved row.
 */
export async function queueInvoiceSendAction(invoiceId: number): Promise<ActionResult> {
  const operator = await requireOperator();
  if (!Number.isInteger(invoiceId)) return { ok: false, error: "Unknown invoice." };

  const db = await getMigratedDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!invoice) return { ok: false, error: "That invoice no longer exists." };

  const label = invoice.number || invoiceNumber(invoiceId);
  await db.insert(aiActions).values({
    kind: "send_message",
    title: `Send invoice ${label} to ${invoice.customerName || "the customer"}`,
    summary: `Email/SMS invoice ${label} (${(invoice.totalCents / 100).toFixed(2)} CAD) once a channel is connected.`,
    payload: {
      invoiceId,
      number: label,
      totalCents: invoice.totalCents,
      customerEmail: invoice.customerEmail,
      customerPhone: invoice.customerPhone,
    },
    status: "pending",
    entityType: "none",
    createdBy: operator,
  });

  revalidateBilling([`/admin/billing/${invoiceId}`, "/admin/control"]);
  return { ok: true };
}

const billingSettingsSchema = z.object({
  gstPct: z.coerce.number().min(0).max(100),
  pstPct: z.coerce.number().min(0).max(100),
  gstNumber: z.string().trim().max(60).default(""),
  depositPct: z.coerce.number().min(0).max(100),
  netDays: z.coerce.number().int().min(0).max(120),
  terms: z.string().trim().max(600).default(""),
});

export async function saveBillingSettingsAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const operator = await requireOperator();

  const db = await getMigratedDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const parsed = billingSettingsSchema.safeParse({
    gstPct: formData.get("gstPct"),
    pstPct: formData.get("pstPct"),
    gstNumber: formData.get("gstNumber"),
    depositPct: formData.get("depositPct"),
    netDays: formData.get("netDays"),
    terms: formData.get("terms"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue?.path.join(".") ?? "A field"}: ${issue?.message}` };
  }

  const { DEFAULT_PRICING_SETTINGS } = await import("@/lib/quote-engine");

  await db
    .insert(settings)
    .values({
      id: 1,
      pricing: DEFAULT_PRICING_SETTINGS,
      billing: parsed.data,
      updatedBy: operator,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: settings.id,
      set: { billing: parsed.data, updatedBy: operator, updatedAt: new Date() },
    });

  revalidateBilling(["/admin/settings"]);
  return { ok: true };
}
