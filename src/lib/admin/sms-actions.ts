"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOperator } from "@/lib/admin/auth";
import { sendSms } from "@/lib/admin/sms";
import { getDb } from "@/lib/db/client";
import { activityLog } from "@/lib/db/schema";

/**
 * Customer SMS, operator-initiated.
 *
 * Human-in-the-loop by construction: a person writes (or edits a template) and
 * clicks send — nothing auto-sends. `requireOperator()` is first, like every
 * admin action. A successful send writes an `sms` row to the timeline so the
 * lead/client page shows exactly what went out and when.
 */

export interface SmsActionResult {
  ok: boolean;
  error?: string;
}

const schema = z.object({
  entityType: z.enum(["lead", "client", "job"]),
  entityId: z.number().int().positive(),
  to: z.string().trim().min(5).max(40),
  body: z.string().trim().min(1).max(1200),
});

export async function sendSmsAction(raw: unknown): Promise<SmsActionResult> {
  const operator = await requireOperator();

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That message didn't validate." };
  }

  const sent = await sendSms(parsed.data.to, parsed.data.body);
  if (!sent.ok) return { ok: false, error: sent.error };

  const db = getDb();
  if (db) {
    await db.insert(activityLog).values({
      entityType: parsed.data.entityType,
      entityId: parsed.data.entityId,
      actor: operator,
      kind: "sms",
      body: `SMS → ${parsed.data.to}: ${parsed.data.body}`,
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${parsed.data.entityType}s/${parsed.data.entityId}`);
  return { ok: true };
}
