import { DEFAULT_JOB_CHECKLIST } from "@/lib/admin/crm";
import { getDb } from "@/lib/db/client";
import { activityLog, aiActions, jobs, leads } from "@/lib/db/schema";
import type { Db } from "@/lib/db/client";

/**
 * Files an online booking into the CRM.
 *
 * Unlike a plain estimate lead, a booking is a request for a specific time, so
 * it writes three things in one place:
 *
 *  1. a `lead`, marked `booked`, so it joins the pipeline like any enquiry;
 *  2. a `job` on the calendar at the chosen slot, status `scheduled`, so the
 *     crew can see it — but with "confirm with customer" in the notes;
 *  3. a Control Center queue row, so nothing is treated as final until the
 *     owner approves it. That is the whole human-in-the-loop model: the
 *     website proposes a booking, a person confirms it.
 *
 * Returns rather than throws. A booking is awaited by the server action (the
 * customer is told whether it landed), but a failure in the *queue* row — the
 * one table that might not exist in an environment that skipped the Control
 * Center migration — must never sink an otherwise-good booking, so that insert
 * is isolated and its failure swallowed.
 */

export interface BookingCrmInput {
  name: string;
  phone: string;
  email: string;
  area: string;
  address: string;
  /** The full customer-written description of the job. */
  message: string;
  /** Pre-built note lines for the timeline and the job card. */
  leadNote: string;
  jobNotes: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  /** For the Control Center row. */
  queueTitle: string;
  queueSummary: string;
  queuePayload: Record<string, unknown>;
}

export interface BookingCrmResult {
  ok: boolean;
  leadId?: number;
  jobId?: number;
  error?: string;
}

function isMissingTable(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  const message = String((error as { message?: string } | null)?.message ?? "");
  return code === "42P01" || /relation .* does not exist/i.test(message);
}

/** Best-effort Control Center row. Its absence never fails a booking. */
async function enqueueBookingApproval(
  db: Db,
  input: BookingCrmInput,
  jobId: number,
): Promise<void> {
  try {
    await db.insert(aiActions).values({
      kind: "other",
      title: input.queueTitle,
      summary: input.queueSummary,
      payload: input.queuePayload,
      status: "pending",
      entityType: "job",
      entityId: jobId,
      createdBy: "website",
    });
  } catch (error) {
    if (!isMissingTable(error)) {
      // A real error here is worth knowing about in logs, but still must not
      // reach the customer — the booking itself already succeeded.
      console.error("Booking approval row failed:", error);
    }
  }
}

export async function insertOnlineBooking(input: BookingCrmInput): Promise<BookingCrmResult> {
  const db = getDb();
  if (!db) return { ok: false, error: "No database configured." };

  try {
    const [lead] = await db
      .insert(leads)
      .values({
        name: input.name,
        phone: input.phone,
        email: input.email,
        area: input.area,
        message: input.message,
        source: "website_form",
        createdFrom: "website_form",
        status: "booked",
        owner: "unassigned",
      })
      .returning({ id: leads.id });

    if (!lead) return { ok: false, error: "Lead insert returned no row." };

    await db.insert(activityLog).values({
      entityType: "lead",
      entityId: lead.id,
      actor: "website",
      kind: "system",
      body: input.leadNote,
    });

    const [job] = await db
      .insert(jobs)
      .values({
        clientId: null,
        quoteId: null,
        scheduledStart: input.scheduledStart,
        scheduledEnd: input.scheduledEnd,
        assignedTo: "unassigned",
        status: "scheduled",
        address: input.address,
        notes: input.jobNotes,
        checklist: DEFAULT_JOB_CHECKLIST.map((label) => ({ label, done: false })),
      })
      .returning({ id: jobs.id });

    if (!job) return { ok: false, error: "Job insert returned no row." };

    await db.insert(activityLog).values({
      entityType: "job",
      entityId: job.id,
      actor: "website",
      kind: "system",
      body: `Created from online booking (lead #${lead.id}). Confirm the slot with the customer.`,
    });

    await enqueueBookingApproval(db, input, job.id);

    return { ok: true, leadId: lead.id, jobId: job.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Booking insert failed." };
  }
}
