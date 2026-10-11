"use server";

import { requireOperator } from "@/lib/admin/auth";
import { composeBriefing } from "@/lib/office-manager/briefing";
import { escapeTelegramHtml } from "@/lib/telegram/escape-html";
import { readTelegramConfig, TelegramClient } from "@/lib/telegram/client";

/**
 * "Send the briefing to Telegram now" — the panel button behind the daily
 * schedule. Operator-gated, read-only: it builds the same briefing and sends it
 * to the admin chat. It changes nothing in the CRM and contacts no customer.
 */
export async function sendBriefingNowAction(): Promise<{ ok: boolean; error?: string }> {
  await requireOperator();

  const config = readTelegramConfig();
  if (!config.ok) return { ok: false, error: "Telegram isn't configured yet." };

  try {
    const briefing = await composeBriefing();
    const client = new TelegramClient(config.config);
    const sent = await client.sendMessage(escapeTelegramHtml(briefing), "office-manager");
    if (!sent.ok) return { ok: false, error: sent.description ?? "Telegram rejected the message." };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not send." };
  }
}
