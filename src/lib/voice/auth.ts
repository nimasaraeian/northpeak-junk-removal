import { timingSafeEqual } from "node:crypto";
import { voiceApiSecret } from "@/lib/admin/config";

/**
 * Gate for the public /api/voice/* endpoints the AI phone receptionist calls.
 *
 * Retell sends the shared secret in `X-Voice-Secret` on every function call.
 * Compared in constant time so the check doesn't leak the secret's length by
 * timing. Without a configured secret the endpoints stay closed.
 */
export function voiceAuthorized(request: Request): boolean {
  const secret = voiceApiSecret();
  if (!secret) return false;

  const provided = request.headers.get("x-voice-secret") ?? "";
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(secret, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
