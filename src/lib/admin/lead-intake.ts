import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { LEAD_SOURCES } from "@/lib/db/schema";

/**
 * The public lead intake contract.
 *
 * `POST /api/leads/intake` is the one unauthenticated endpoint that touches
 * the CRM database, so everything it decides lives here as pure functions
 * the tests can drive without a request: who is allowed to post, what shape
 * the body must be, and how hard it may be hammered.
 *
 * It only ever inserts a lead. There is no read, no update, and no path from
 * it to any other table.
 */

export const INTAKE_SECRET_HEADER = "x-northpeak-intake-secret";

export const intakeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).default(""),
  email: z.string().trim().max(160).default(""),
  area: z.string().trim().max(120).default(""),
  message: z.string().trim().max(4000).default(""),
  /**
   * Optional: the form may say where it sits. Anything unrecognised falls
   * back to `website_form` rather than rejecting a real lead over a label.
   */
  source: z.enum(LEAD_SOURCES).optional(),
});

export type IntakePayload = z.infer<typeof intakeSchema>;

export function intakeSecret(): string | undefined {
  const value = process.env.LEAD_INTAKE_SECRET?.trim();
  return value ? value : undefined;
}

/**
 * Constant-time secret comparison.
 *
 * Hashed first so a length difference does not leak through the comparison,
 * the same approach the admin password uses.
 */
export function secretMatches(candidate: string | null, expected: string | undefined): boolean {
  if (!expected || !candidate) return false;
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export type IntakeRejection =
  | { ok: false; status: 503; error: string }
  | { ok: false; status: 401; error: string }
  | { ok: false; status: 400; error: string }
  | { ok: false; status: 429; error: string; retryAfterSeconds: number };

export type IntakeDecision = { ok: true; lead: IntakePayload } | IntakeRejection;

/**
 * Everything the route decides before it touches the database.
 *
 * Order matters: configuration, then the secret, then the body. A caller
 * without the secret learns nothing about whether its JSON was valid.
 */
export function decideIntake(args: {
  secretHeader: string | null;
  expectedSecret: string | undefined;
  body: unknown;
}): IntakeDecision {
  if (!args.expectedSecret) {
    // Unset secret means the endpoint is closed, not open.
    return { ok: false, status: 503, error: "Lead intake is not configured." };
  }

  if (!secretMatches(args.secretHeader, args.expectedSecret)) {
    return { ok: false, status: 401, error: "Unauthorized." };
  }

  const parsed = intakeSchema.safeParse(args.body);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: parsed.error.issues[0]?.message ?? "That payload did not validate.",
    };
  }

  return { ok: true, lead: parsed.data };
}

// --- Rate limiting ---------------------------------------------------------

/**
 * Fixed-window counter, per caller, in process memory.
 *
 * Serverless means each instance counts separately, so this throttles a
 * flood rather than stopping a determined one — the secret header is what
 * actually gates the endpoint. Worth having anyway: one leaked secret should
 * not turn into ten thousand pipeline cards.
 */
export const INTAKE_WINDOW_MS = 60_000;
export const INTAKE_MAX_PER_WINDOW = 10;

export interface IntakeWindow {
  windowStart: number;
  count: number;
}

export function nextWindow(
  current: IntakeWindow | undefined,
  now: number,
): { window: IntakeWindow; allowed: boolean; retryAfterSeconds: number } {
  if (!current || now - current.windowStart >= INTAKE_WINDOW_MS) {
    return { window: { windowStart: now, count: 1 }, allowed: true, retryAfterSeconds: 0 };
  }

  const window = { windowStart: current.windowStart, count: current.count + 1 };
  const allowed = window.count <= INTAKE_MAX_PER_WINDOW;

  return {
    window,
    allowed,
    retryAfterSeconds: allowed
      ? 0
      : Math.max(1, Math.ceil((current.windowStart + INTAKE_WINDOW_MS - now) / 1000)),
  };
}

const windows = new Map<string, IntakeWindow>();

export function checkIntakeRate(
  key: string,
  now: number = Date.now(),
): { allowed: boolean; retryAfterSeconds: number } {
  // Cheap sweep so an instance that lives a long time does not grow a map of
  // every IP it has ever seen.
  if (windows.size > 5_000) windows.clear();

  const result = nextWindow(windows.get(key), now);
  windows.set(key, result.window);
  return { allowed: result.allowed, retryAfterSeconds: result.retryAfterSeconds };
}

export function resetIntakeRate(): void {
  windows.clear();
}

// --- CORS ------------------------------------------------------------------

/**
 * Only our own origin may call this from a browser.
 *
 * A server-to-server caller sends no Origin header at all and is unaffected;
 * this exists so a page on someone else's domain cannot post with a secret
 * scraped out of our client bundle. (It should never be in the bundle — the
 * wiring posts from the server — but defence in depth is cheap here.)
 */
export function allowedOrigins(siteUrl: string): string[] {
  const origins = new Set<string>();
  try {
    origins.add(new URL(siteUrl).origin);
  } catch {
    // A malformed site URL should not take the endpoint down.
  }
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
  }
  return [...origins];
}

export function isOriginAllowed(origin: string | null, siteUrl: string): boolean {
  if (!origin) return true; // server-to-server
  return allowedOrigins(siteUrl).includes(origin);
}
