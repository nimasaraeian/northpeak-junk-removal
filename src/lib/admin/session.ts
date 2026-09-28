import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Admin session cookie.
 *
 * One shared password, so the cookie carries no identity the server can look
 * up — it carries the operator's name for the audit fields on a quote, signed
 * so it cannot be edited. HMAC-SHA256 over the payload, base64url, with the
 * issue time inside the signed part so expiry cannot be extended by hand.
 *
 * The signing key is derived from `ADMIN_PASSWORD` rather than stored
 * separately: changing the password then invalidates every live session,
 * which is what you want from a shared credential.
 */

export const OPERATORS = ["Nima", "Sina"] as const;
export type Operator = (typeof OPERATORS)[number];

export const SESSION_COOKIE = "np_ops_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export interface SessionPayload {
  name: Operator;
  /** Unix milliseconds. */
  issuedAt: number;
}

export function isOperator(value: unknown): value is Operator {
  return typeof value === "string" && (OPERATORS as readonly string[]).includes(value);
}

function base64url(input: Buffer): string {
  return input.toString("base64url");
}

export function deriveSigningKey(password: string): Buffer {
  return createHash("sha256").update(`northpeak-ops:${password}`).digest();
}

function sign(payloadB64: string, key: Buffer): string {
  return base64url(createHmac("sha256", key).update(payloadB64).digest());
}

export function createSessionToken(payload: SessionPayload, password: string): string {
  const key = deriveSigningKey(password);
  const payloadB64 = base64url(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${payloadB64}.${sign(payloadB64, key)}`;
}

/** Constant-time comparison that tolerates length mismatch. */
function signaturesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Verifies a token and returns its payload, or null for anything that is not
 * a currently valid session — bad shape, bad signature, unknown operator, or
 * past its seven days.
 */
export function readSessionToken(
  token: string | undefined,
  password: string,
  now: number = Date.now(),
): SessionPayload | null {
  if (!token) return null;

  const separator = token.indexOf(".");
  if (separator <= 0 || separator === token.length - 1) return null;

  const payloadB64 = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  if (!signaturesMatch(signature, sign(payloadB64, deriveSigningKey(password)))) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;
  const { name, issuedAt } = parsed as Record<string, unknown>;

  if (!isOperator(name)) return null;
  if (typeof issuedAt !== "number" || !Number.isFinite(issuedAt)) return null;

  const ageSeconds = (now - issuedAt) / 1000;
  // A token issued in the future is a clock problem or a forgery attempt with
  // a leaked key; either way it is not a session we should honour.
  if (ageSeconds < -60 || ageSeconds > SESSION_MAX_AGE_SECONDS) return null;

  return { name, issuedAt };
}

/** Constant-time password check, so a wrong guess leaks no timing signal. */
export function passwordMatches(candidate: string, expected: string): boolean {
  if (!expected) return false;
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  // Off in local development, where there is no TLS to set it against.
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const;
