import { twilioConfig } from "@/lib/admin/config";

/**
 * Outbound SMS via Twilio's REST API.
 *
 * No SDK — a single authenticated POST to the Messages endpoint keeps the
 * dependency surface at zero and runs the same on Vercel's Node runtime as it
 * does in a test. Credentials come from the environment through `twilioConfig`,
 * so nothing secret is ever passed in from the client.
 */

export interface SendSmsResult {
  ok: boolean;
  sid?: string;
  error?: string;
}

/**
 * Normalises a Canadian/North-American number to E.164 (+1XXXXXXXXXX).
 *
 * Returns null when it can't — the caller surfaces that rather than sending to
 * a malformed destination. Already-E.164 input is passed through.
 */
export function toE164(raw: string): string | null {
  const trimmed = (raw ?? "").trim();
  if (/^\+[1-9]\d{7,14}$/.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

const MAX_BODY = 1200;

export async function sendSms(toRaw: string, body: string): Promise<SendSmsResult> {
  const cfg = twilioConfig();
  if (!cfg) return { ok: false, error: "SMS isn't configured yet." };

  const to = toE164(toRaw);
  if (!to) return { ok: false, error: "That phone number doesn't look valid." };

  const text = (body ?? "").trim().slice(0, MAX_BODY);
  if (!text) return { ok: false, error: "Write a message first." };

  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
    cfg.accountSid,
  )}/Messages.json`;
  const form = new URLSearchParams({ From: cfg.fromNumber, To: to, Body: text });
  const auth = Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString("base64");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    const data = (await res.json().catch(() => ({}))) as { sid?: string; message?: string };
    if (!res.ok) {
      return {
        ok: false,
        error: typeof data.message === "string" ? data.message : `Twilio error ${res.status}.`,
      };
    }
    return { ok: true, sid: data.sid };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Send failed." };
  }
}
