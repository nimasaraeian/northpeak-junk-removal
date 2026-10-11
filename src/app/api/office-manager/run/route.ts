import { NextResponse } from "next/server";
import { cronSecret } from "@/lib/admin/config";
import { composeBriefing } from "@/lib/office-manager/briefing";
import { escapeTelegramHtml } from "@/lib/telegram/escape-html";
import { readTelegramConfig, TelegramClient } from "@/lib/telegram/client";

/**
 * The scheduled Office Manager run (Phase 1, read-only).
 *
 * Vercel Cron calls this daily and sends `Authorization: Bearer <CRON_SECRET>`
 * when CRON_SECRET is set on the project, so only the schedule can trigger it.
 * It builds the daily briefing and sends it to the admin on Telegram. It reads
 * only — nothing is sent to a customer and nothing in the CRM is changed.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const secret = cronSecret();
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const config = readTelegramConfig();
  if (!config.ok) {
    return NextResponse.json({ error: "Telegram is not configured." }, { status: 503 });
  }

  try {
    const briefing = await composeBriefing();
    const client = new TelegramClient(config.config);
    const sent = await client.sendMessage(escapeTelegramHtml(briefing), "office-manager");
    if (!sent.ok) {
      return NextResponse.json({ error: "Could not send the briefing." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not build the briefing." }, { status: 500 });
  }
}
