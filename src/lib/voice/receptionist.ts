import { eq, like } from "drizzle-orm";
import { DEFAULT_JOB_CHECKLIST } from "@/lib/admin/crm";
import {
  BOOKING_WINDOWS,
  bookingSlot,
  type BookingWindowId,
} from "@/lib/booking/booking-core";
import { getDb } from "@/lib/db/client";
import { activityLog, jobs, leads, type JobRow } from "@/lib/db/schema";

/**
 * AI phone receptionist — the CRM side.
 *
 * Three jobs the Retell agent drives over /api/voice/*:
 *  - read free estimate-visit slots,
 *  - book an estimate visit (idempotent — a retried call never double-books),
 *  - log the call summary and flag anything unclear for follow-up.
 *
 * An estimate visit is a short (1h) calendar job, not a removal booking: the
 * crew drops by to scope and price the job on site. Everything reuses the same
 * leads/jobs/activity the rest of the panel reads, so an AI-booked visit shows
 * up on the calendar and the lead timeline like any other.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const VISIT_MINUTES = 60;
const TZ = "America/Vancouver";

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dayLabelFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  weekday: "short",
  month: "short",
  day: "numeric",
});

function dateStrInTz(d: Date): string {
  const parts = dateFmt.formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;
  return `${map.year}-${map.month}-${map.day}`;
}

function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const nd = new Date(Date.UTC(y, m - 1, d) + days * DAY_MS);
  return `${nd.getUTCFullYear()}-${String(nd.getUTCMonth() + 1).padStart(2, "0")}-${String(
    nd.getUTCDate(),
  ).padStart(2, "0")}`;
}

function dayLabel(dateStr: string): string {
  return dayLabelFmt.format(new Date(`${dateStr}T12:00:00Z`));
}

// --- Availability ----------------------------------------------------------

export interface VisitSlot {
  date: string;
  window: BookingWindowId;
  label: string;
  startIso: string;
}

/**
 * Free estimate-visit windows over the next `days`, skipping any that overlap a
 * scheduled (non-cancelled) job, and skipping windows already past today.
 */
export function computeAvailableSlots(existing: JobRow[], now: Date, days = 10, max = 6): VisitSlot[] {
  const taken = existing.filter(
    (j) => j.status !== "cancelled" && j.scheduledStart !== null && j.scheduledEnd !== null,
  );
  const today = dateStrInTz(now);
  const out: VisitSlot[] = [];

  for (let d = 0; d < days && out.length < max; d += 1) {
    const dateStr = addDaysStr(today, d);
    for (const w of BOOKING_WINDOWS) {
      const slot = bookingSlot(dateStr, w.id);
      if (!slot) continue;
      if (slot.end.getTime() <= now.getTime()) continue;
      const clash = taken.some(
        (j) =>
          (j.scheduledStart as Date).getTime() < slot.end.getTime() &&
          (j.scheduledEnd as Date).getTime() > slot.start.getTime(),
      );
      if (!clash) {
        out.push({
          date: dateStr,
          window: w.id,
          label: `${dayLabel(dateStr)} · ${w.label} (${w.hint})`,
          startIso: slot.start.toISOString(),
        });
        if (out.length >= max) break;
      }
    }
  }
  return out;
}

// --- Booking an estimate visit --------------------------------------------

export interface BookVisitInput {
  /** Retell call id — used for idempotency so a retried call never double-books. */
  callId?: string;
  name: string;
  phone: string;
  address?: string;
  area?: string;
  date: string;
  window: BookingWindowId;
  /** What's being removed + rough volume, in the caller's words. */
  itemsDescription?: string;
  /** Stairs, elevator, parking, etc. */
  accessNotes?: string;
}

export interface BookVisitResult {
  ok: boolean;
  reference?: string;
  leadId?: number;
  jobId?: number;
  alreadyBooked?: boolean;
  error?: string;
}

export async function bookEstimateVisit(input: BookVisitInput): Promise<BookVisitResult> {
  const db = getDb();
  if (!db) return { ok: false, error: "Database not reachable." };

  const slot = bookingSlot(input.date, input.window);
  if (!slot) return { ok: false, error: "Invalid date or arrival window." };

  const start = slot.start;
  const end = new Date(start.getTime() + VISIT_MINUTES * 60 * 1000);
  const tag = input.callId ? `[call:${input.callId}]` : "";
  const reference = `V-${(input.callId ?? Date.now().toString(36)).slice(-8).toUpperCase()}`;

  try {
    // Idempotency: a job already tagged with this call id means it's booked.
    if (input.callId) {
      const [existing] = await db
        .select({ id: jobs.id })
        .from(jobs)
        .where(like(jobs.notes, `%${tag}%`))
        .limit(1);
      if (existing) return { ok: true, reference, jobId: existing.id, alreadyBooked: true };
    }

    const [lead] = await db
      .insert(leads)
      .values({
        name: input.name,
        phone: input.phone,
        email: "",
        area: input.area ?? "",
        message: [input.itemsDescription, input.accessNotes].filter(Boolean).join(" · "),
        source: "other",
        createdFrom: "manual",
        status: "contacted",
        owner: "unassigned",
      })
      .returning({ id: leads.id });
    if (!lead) return { ok: false, error: "Could not create the lead." };

    const jobNotes = [
      "AI RECEPTIONIST — estimate visit booked by phone. Confirm scope on site.",
      input.address ? `Address: ${input.address}` : null,
      input.itemsDescription ? `Items: ${input.itemsDescription}` : null,
      input.accessNotes ? `Access: ${input.accessNotes}` : null,
      `Contact: ${input.phone}`,
      `Reference: ${reference}`,
      tag || null,
    ]
      .filter(Boolean)
      .join("\n");

    const [job] = await db
      .insert(jobs)
      .values({
        clientId: null,
        quoteId: null,
        scheduledStart: start,
        scheduledEnd: end,
        assignedTo: "unassigned",
        status: "scheduled",
        address: [input.address, input.area].filter(Boolean).join(", "),
        notes: jobNotes,
        checklist: DEFAULT_JOB_CHECKLIST.map((label) => ({ label, done: false })),
      })
      .returning({ id: jobs.id });
    if (!job) return { ok: false, error: "Could not create the visit." };

    await db.insert(activityLog).values({
      entityType: "lead",
      entityId: lead.id,
      actor: "ai-receptionist",
      kind: "call",
      body: `Estimate visit booked by the AI phone receptionist for ${input.date} (${input.window}). Reference ${reference}.`,
    });

    return { ok: true, reference, leadId: lead.id, jobId: job.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Booking failed." };
  }
}

// --- Call summary / follow-up ---------------------------------------------

export interface CallSummaryInput {
  /** The lead the call booked, if any. */
  leadId?: number;
  name?: string;
  phone?: string;
  summary: string;
  /** True when something needs Nima to follow up (unclear scope, an error, etc.). */
  followUp?: boolean;
}

export interface CallSummaryResult {
  ok: boolean;
  leadId?: number;
  error?: string;
}

export async function logCallSummary(input: CallSummaryInput): Promise<CallSummaryResult> {
  const db = getDb();
  if (!db) return { ok: false, error: "Database not reachable." };

  const summary = (input.summary ?? "").trim().slice(0, 4000);
  if (!summary) return { ok: false, error: "Nothing to log." };

  try {
    let leadId =
      input.leadId && Number.isInteger(input.leadId) && input.leadId > 0 ? input.leadId : null;

    if (leadId) {
      const [exists] = await db.select({ id: leads.id }).from(leads).where(eq(leads.id, leadId)).limit(1);
      if (!exists) leadId = null;
    }

    if (!leadId) {
      // No booking (inquiry only, or an error) — still capture it as a lead so
      // nothing said on the phone is lost, and flag it for follow-up.
      const [created] = await db
        .insert(leads)
        .values({
          name: input.name?.trim() || "Phone caller",
          phone: input.phone?.trim() || "",
          email: "",
          area: "",
          message: summary,
          source: "other",
          createdFrom: "manual",
          status: "new",
          owner: "unassigned",
          nextFollowUpAt: input.followUp ? new Date(Date.now() + DAY_MS) : null,
        })
        .returning({ id: leads.id });
      leadId = created?.id ?? null;
      if (!leadId) return { ok: false, error: "Could not record the call." };
    } else if (input.followUp) {
      await db.update(leads).set({ nextFollowUpAt: new Date(Date.now() + DAY_MS) }).where(eq(leads.id, leadId));
    }

    await db.insert(activityLog).values({
      entityType: "lead",
      entityId: leadId,
      actor: "ai-receptionist",
      kind: "call",
      body: input.followUp ? `Call summary (needs follow-up): ${summary}` : `Call summary: ${summary}`,
    });

    return { ok: true, leadId };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not record the call." };
  }
}
