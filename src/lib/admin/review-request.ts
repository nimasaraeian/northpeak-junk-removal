import { eq } from "drizzle-orm";
import { isReviewRequestEnabled, reviewRequestUrl } from "@/lib/admin/config";
import { sendSms, toE164 } from "@/lib/admin/sms";
import { getDb } from "@/lib/db/client";
import { activityLog, clients } from "@/lib/db/schema";

/**
 * Post-job Google review request.
 *
 * When a real removal job is marked done, text the customer a short, friendly
 * ask with the review link. It is deliberately conservative:
 *  - only runs when SMS is configured and REVIEW_SMS_ENABLED isn't "false",
 *  - never fires for an estimate visit (an on-site quote isn't a finished job),
 *  - is best-effort — a failure is logged on the job timeline, never thrown,
 *    so marking a job done can't fail because a text didn't go out.
 */

export interface ReviewJob {
  id: number;
  clientId: number | null;
  notes: string;
}

/** An estimate visit (AI receptionist or otherwise) is a quote, not a completed removal. */
function isEstimateVisit(notes: string): boolean {
  return /estimate visit/i.test(notes) || /^AI RECEPTIONIST/i.test(notes.trimStart());
}

/** Pull a contact number out of a job's notes ("Contact: +1 604 …"). */
function phoneFromNotes(notes: string): string {
  const match = notes.match(/Contact:\s*([+\d()\-.\s]+)/i);
  return match ? match[1].trim() : "";
}

export async function maybeSendReviewRequest(job: ReviewJob): Promise<void> {
  if (!isReviewRequestEnabled()) return;
  if (isEstimateVisit(job.notes ?? "")) return;

  const db = getDb();
  if (!db) return;

  let name = "";
  let phone = "";

  if (job.clientId) {
    const [client] = await db
      .select({ name: clients.name, phone: clients.phone })
      .from(clients)
      .where(eq(clients.id, job.clientId))
      .limit(1);
    if (client) {
      name = client.name ?? "";
      phone = client.phone ?? "";
    }
  }

  if (!phone) phone = phoneFromNotes(job.notes ?? "");

  const to = toE164(phone);
  if (!to) return; // No usable number — nothing to send, nothing to log.

  const firstName = name.trim().split(/\s+/)[0] || "there";
  const body =
    `Hi ${firstName}, thanks for choosing NorthPeak Junk Removal! If we did a great job, ` +
    `a quick Google review would mean a lot: ${reviewRequestUrl()} — reply STOP to opt out.`;

  const result = await sendSms(phone, body);

  await db.insert(activityLog).values({
    entityType: "job",
    entityId: job.id,
    actor: "system",
    kind: "sms",
    body: result.ok
      ? `Review request SMS sent to ${to}.`
      : `Review request SMS failed: ${result.error ?? "unknown error"}.`,
  });
}
