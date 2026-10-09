"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireOperator } from "@/lib/admin/auth";
import {
  canTransition,
  DEFAULT_JOB_CHECKLIST,
  leadToClientDraft,
  lifetimeValueCents,
  quoteToJobDraft,
  shouldAdvanceLeadToQuoted,
  statusChangeBody,
} from "@/lib/admin/crm";
import { maybeSendReviewRequest } from "@/lib/admin/review-request";
import { getDb } from "@/lib/db/client";
import {
  ACTIVITY_KINDS,
  activityLog,
  clients,
  JOB_ASSIGNEES,
  JOB_STATUSES,
  jobs,
  LEAD_OWNERS,
  LEAD_SOURCES,
  LEAD_STATUSES,
  leads,
  quotes,
  type ActivityEntity,
  type ActivityKind,
} from "@/lib/db/schema";
import type { Db } from "@/lib/db/client";

/**
 * CRM mutations.
 *
 * Every exported action calls `requireOperator()` first — `proxy.ts` covers
 * Server Function POSTs today, but the Next docs warn a matcher edit can
 * silently drop that, and `admin-security.test.ts` fails the build if any
 * action here skips the check.
 *
 * Every status change and every note writes an `activity_log` row, which is
 * what turns a lead or client page into a timeline instead of a form.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const DB_UNREACHABLE = "The database is not reachable.";

/** Appends to the timeline. Called inside actions that already have a db. */
async function logActivity(
  db: Db,
  entry: {
    entityType: ActivityEntity;
    entityId: number;
    actor: string;
    kind: ActivityKind;
    body: string;
  },
): Promise<void> {
  await db.insert(activityLog).values(entry);
}

/**
 * Recomputes and stores a client's lifetime value.
 *
 * Stored rather than derived because the clients table shows it per row, and
 * deriving it there would be a query per row.
 */
async function recalculateClientValue(db: Db, clientId: number): Promise<void> {
  const rows = await db
    .select({
      status: quotes.status,
      finalLowCents: quotes.finalLowCents,
      finalHighCents: quotes.finalHighCents,
    })
    .from(quotes)
    .where(eq(quotes.clientId, clientId));

  await db
    .update(clients)
    .set({ lifetimeValueCents: lifetimeValueCents(rows) })
    .where(eq(clients.id, clientId));
}

function revalidateCrm(extra: string[] = []): void {
  for (const path of ["/admin", "/admin/leads", "/admin/clients", "/admin/calendar", ...extra]) {
    revalidatePath(path);
  }
}

// --- Leads -----------------------------------------------------------------

const leadInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).default(""),
  email: z.string().trim().max(160).default(""),
  area: z.string().trim().max(120).default(""),
  source: z.enum(LEAD_SOURCES),
  message: z.string().trim().max(4000).default(""),
  owner: z.enum(LEAD_OWNERS),
  /** ISO date (YYYY-MM-DD) or empty. */
  nextFollowUpAt: z.string().trim().max(32).default(""),
});

function parseFollowUp(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export interface SaveLeadResult extends ActionResult {
  id?: number;
}

export async function createLeadAction(raw: unknown): Promise<SaveLeadResult> {
  const operator = await requireOperator();

  const parsed = leadInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That lead did not validate." };
  }

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [inserted] = await db
    .insert(leads)
    .values({
      ...parsed.data,
      nextFollowUpAt: parseFollowUp(parsed.data.nextFollowUpAt),
      createdFrom: "manual",
      status: "new",
    })
    .returning({ id: leads.id });

  if (inserted) {
    await logActivity(db, {
      entityType: "lead",
      entityId: inserted.id,
      actor: operator,
      kind: "system",
      body: `Lead created by ${operator}.`,
    });
  }

  revalidateCrm();
  return { ok: true, id: inserted?.id };
}

const statusSchema = z.enum(LEAD_STATUSES);

export async function updateLeadStatusAction(
  leadId: number,
  status: string,
  lostReason?: string,
): Promise<ActionResult> {
  const operator = await requireOperator();

  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Unknown status." };
  if (!Number.isInteger(leadId)) return { ok: false, error: "Unknown lead." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [current] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!current) return { ok: false, error: "That lead no longer exists." };

  if (!canTransition(current.status, parsed.data)) {
    return {
      ok: false,
      error: `A ${current.status} lead cannot move to ${parsed.data}.`,
    };
  }

  const reason = parsed.data === "lost" ? (lostReason?.trim() || null) : null;

  await db
    .update(leads)
    .set({ status: parsed.data, lostReason: reason })
    .where(eq(leads.id, leadId));

  await logActivity(db, {
    entityType: "lead",
    entityId: leadId,
    actor: operator,
    kind: "status_change",
    body: statusChangeBody("lead", current.status, parsed.data, reason),
  });

  revalidateCrm([`/admin/leads/${leadId}`]);
  return { ok: true };
}

export async function updateLeadFieldsAction(
  leadId: number,
  fields: unknown,
): Promise<ActionResult> {
  const operator = await requireOperator();
  if (!Number.isInteger(leadId)) return { ok: false, error: "Unknown lead." };

  const parsed = z
    .object({
      owner: z.enum(LEAD_OWNERS).optional(),
      nextFollowUpAt: z.string().trim().max(32).optional(),
    })
    .safeParse(fields);
  if (!parsed.success) return { ok: false, error: "Those changes did not validate." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const patch: Record<string, unknown> = {};
  if (parsed.data.owner) patch.owner = parsed.data.owner;
  if (parsed.data.nextFollowUpAt !== undefined) {
    patch.nextFollowUpAt = parseFollowUp(parsed.data.nextFollowUpAt);
  }
  if (Object.keys(patch).length === 0) return { ok: true };

  await db.update(leads).set(patch).where(eq(leads.id, leadId));

  await logActivity(db, {
    entityType: "lead",
    entityId: leadId,
    actor: operator,
    kind: "system",
    body: parsed.data.owner
      ? `Owner set to ${parsed.data.owner}.`
      : "Follow-up date updated.",
  });

  revalidateCrm([`/admin/leads/${leadId}`]);
  return { ok: true };
}

const activityKindSchema = z.enum(ACTIVITY_KINDS);

/**
 * Log call / Log SMS / Add note.
 *
 * Nothing is sent in v2 — this records that the operator did it. The seam
 * for actually sending is the `call` and `sms` kinds, which v3 can hang a
 * provider off without touching the timeline.
 */
export async function logActivityAction(
  entityType: string,
  entityId: number,
  kind: string,
  body: string,
): Promise<ActionResult> {
  const operator = await requireOperator();

  const parsedKind = activityKindSchema.safeParse(kind);
  const parsedEntity = z.enum(["lead", "client", "job", "quote"]).safeParse(entityType);
  if (!parsedKind.success || !parsedEntity.success) {
    return { ok: false, error: "Unknown activity." };
  }
  if (!Number.isInteger(entityId)) return { ok: false, error: "Unknown record." };

  const text = body.trim().slice(0, 4000);
  if (!text) return { ok: false, error: "Write something first." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  await logActivity(db, {
    entityType: parsedEntity.data,
    entityId,
    actor: operator,
    kind: parsedKind.data,
    body: text,
  });

  revalidateCrm([`/admin/${parsedEntity.data}s/${entityId}`]);
  return { ok: true };
}

// --- Conversions -----------------------------------------------------------

export interface ConvertResult extends ActionResult {
  clientId?: number;
}

export async function convertLeadToClientAction(leadId: number): Promise<ConvertResult> {
  const operator = await requireOperator();
  if (!Number.isInteger(leadId)) return { ok: false, error: "Unknown lead." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!lead) return { ok: false, error: "That lead no longer exists." };
  if (lead.clientId) return { ok: true, clientId: lead.clientId };

  const draft = leadToClientDraft(lead);
  const [client] = await db.insert(clients).values(draft).returning({ id: clients.id });
  if (!client) return { ok: false, error: "Could not create that client." };

  await db.update(leads).set({ clientId: client.id }).where(eq(leads.id, leadId));

  await logActivity(db, {
    entityType: "lead",
    entityId: leadId,
    actor: operator,
    kind: "system",
    body: `Converted to client #${client.id}.`,
  });
  await logActivity(db, {
    entityType: "client",
    entityId: client.id,
    actor: operator,
    kind: "system",
    body: `Created from lead #${leadId}.`,
  });

  revalidateCrm([`/admin/leads/${leadId}`, `/admin/clients/${client.id}`]);
  return { ok: true, clientId: client.id };
}

export interface ScheduleJobResult extends ActionResult {
  jobId?: number;
}

/** "Schedule this job" on a quote. Lands unscheduled, in the calendar rail. */
export async function createJobFromQuoteAction(quoteId: number): Promise<ScheduleJobResult> {
  const operator = await requireOperator();
  if (!Number.isInteger(quoteId)) return { ok: false, error: "Unknown quote." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1);
  if (!quote) return { ok: false, error: "That quote no longer exists." };
  if (quote.jobId) return { ok: true, jobId: quote.jobId };

  const [job] = await db.insert(jobs).values(quoteToJobDraft(quote)).returning({ id: jobs.id });
  if (!job) return { ok: false, error: "Could not create that job." };

  await db.update(quotes).set({ jobId: job.id }).where(eq(quotes.id, quoteId));

  await logActivity(db, {
    entityType: "job",
    entityId: job.id,
    actor: operator,
    kind: "system",
    body: `Created from quote #${quoteId}.`,
  });
  await logActivity(db, {
    entityType: "quote",
    entityId: quoteId,
    actor: operator,
    kind: "system",
    body: `Scheduled as job #${job.id}.`,
  });

  revalidateCrm([`/admin/quotes/${quoteId}`]);
  return { ok: true, jobId: job.id };
}

/**
 * Links a saved quote to a lead and/or client, and advances the lead.
 *
 * Called by `saveQuoteAction` after it writes, so the CRM side effects of
 * quoting live here rather than being duplicated in the quote action.
 */
export async function linkQuoteToCrmAction(
  quoteId: number,
  leadId: number | null,
  clientId: number | null,
): Promise<ActionResult> {
  const operator = await requireOperator();
  if (!Number.isInteger(quoteId)) return { ok: false, error: "Unknown quote." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  if (clientId !== null) {
    await db.update(quotes).set({ clientId }).where(eq(quotes.id, quoteId));
    await recalculateClientValue(db, clientId);
  }

  if (leadId !== null) {
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    if (lead && shouldAdvanceLeadToQuoted(lead.status)) {
      await db.update(leads).set({ status: "quoted" }).where(eq(leads.id, leadId));
      await logActivity(db, {
        entityType: "lead",
        entityId: leadId,
        actor: operator,
        kind: "status_change",
        body: statusChangeBody("lead", lead.status, "quoted", `quote #${quoteId}`),
      });
    }
    await logActivity(db, {
      entityType: "lead",
      entityId: leadId,
      actor: operator,
      kind: "system",
      body: `Quote #${quoteId} raised.`,
    });
  }

  revalidateCrm([`/admin/quotes/${quoteId}`]);
  return { ok: true };
}

// --- Clients ---------------------------------------------------------------

const clientInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).default(""),
  email: z.string().trim().max(160).default(""),
  address: z.string().trim().max(240).default(""),
  area: z.string().trim().max(120).default(""),
  source: z.enum(LEAD_SOURCES),
  notes: z.string().trim().max(4000).default(""),
});

export async function createClientAction(raw: unknown): Promise<ConvertResult> {
  const operator = await requireOperator();

  const parsed = clientInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That client did not validate." };
  }

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [client] = await db
    .insert(clients)
    .values({
      ...parsed.data,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
    })
    .returning({ id: clients.id });

  if (client) {
    await logActivity(db, {
      entityType: "client",
      entityId: client.id,
      actor: operator,
      kind: "system",
      body: `Client created by ${operator}.`,
    });
  }

  revalidateCrm();
  return { ok: true, clientId: client?.id };
}

// --- Jobs ------------------------------------------------------------------

const jobInputSchema = z.object({
  clientId: z.number().int().positive().nullable(),
  quoteId: z.number().int().positive().nullable(),
  address: z.string().trim().max(240).default(""),
  notes: z.string().trim().max(4000).default(""),
  assignedTo: z.enum(JOB_ASSIGNEES),
  /** ISO datetime strings, or empty for an unscheduled job. */
  scheduledStart: z.string().trim().max(40).default(""),
  scheduledEnd: z.string().trim().max(40).default(""),
});

function parseInstant(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function createJobAction(raw: unknown): Promise<ScheduleJobResult> {
  const operator = await requireOperator();

  const parsed = jobInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That job did not validate." };
  }

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [job] = await db
    .insert(jobs)
    .values({
      clientId: parsed.data.clientId,
      quoteId: parsed.data.quoteId,
      address: parsed.data.address,
      notes: parsed.data.notes,
      assignedTo: parsed.data.assignedTo,
      scheduledStart: parseInstant(parsed.data.scheduledStart),
      scheduledEnd: parseInstant(parsed.data.scheduledEnd),
      status: "scheduled",
      checklist: DEFAULT_JOB_CHECKLIST.map((label) => ({ label, done: false })),
    })
    .returning({ id: jobs.id });

  if (job) {
    await logActivity(db, {
      entityType: "job",
      entityId: job.id,
      actor: operator,
      kind: "system",
      body: `Job created by ${operator}.`,
    });
  }

  revalidateCrm();
  return { ok: true, jobId: job?.id };
}

/** Drag on the calendar. Start and end move together; duration is preserved. */
export async function rescheduleJobAction(
  jobId: number,
  startIso: string,
  endIso: string,
): Promise<ActionResult> {
  const operator = await requireOperator();
  if (!Number.isInteger(jobId)) return { ok: false, error: "Unknown job." };

  const start = parseInstant(startIso);
  const end = parseInstant(endIso);
  if (!start || !end || end <= start) {
    return { ok: false, error: "That is not a valid time range." };
  }

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  await db
    .update(jobs)
    .set({ scheduledStart: start, scheduledEnd: end })
    .where(eq(jobs.id, jobId));

  await logActivity(db, {
    entityType: "job",
    entityId: jobId,
    actor: operator,
    kind: "system",
    body: `Rescheduled to ${start.toLocaleString("en-CA")}.`,
  });

  revalidateCrm([`/admin/calendar`]);
  return { ok: true };
}

export async function updateJobStatusAction(jobId: number, status: string): Promise<ActionResult> {
  const operator = await requireOperator();

  const parsed = z.enum(JOB_STATUSES).safeParse(status);
  if (!parsed.success) return { ok: false, error: "Unknown status." };
  if (!Number.isInteger(jobId)) return { ok: false, error: "Unknown job." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [current] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
  if (!current) return { ok: false, error: "That job no longer exists." };

  await db.update(jobs).set({ status: parsed.data }).where(eq(jobs.id, jobId));

  await logActivity(db, {
    entityType: "job",
    entityId: jobId,
    actor: operator,
    kind: "status_change",
    body: statusChangeBody("job", current.status, parsed.data),
  });

  // When a real removal job is first completed, ask the customer for a Google
  // review by SMS. Best-effort and self-gating (skips estimate visits, needs
  // SMS configured) — it must never fail the status change.
  if (parsed.data === "done" && current.status !== "done") {
    try {
      await maybeSendReviewRequest({
        id: jobId,
        clientId: current.clientId,
        notes: current.notes,
      });
    } catch {
      // Ignore — the job is already marked done above.
    }
  }

  revalidateCrm();
  return { ok: true };
}

export async function updateJobChecklistAction(
  jobId: number,
  checklist: unknown,
): Promise<ActionResult> {
  await requireOperator();
  if (!Number.isInteger(jobId)) return { ok: false, error: "Unknown job." };

  const parsed = z
    .array(z.object({ label: z.string().trim().min(1).max(160), done: z.boolean() }))
    .max(40)
    .safeParse(checklist);
  if (!parsed.success) return { ok: false, error: "That checklist did not validate." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  await db.update(jobs).set({ checklist: parsed.data }).where(eq(jobs.id, jobId));

  revalidateCrm([`/admin/calendar`]);
  return { ok: true };
}

export async function updateJobAssigneeAction(
  jobId: number,
  assignedTo: string,
): Promise<ActionResult> {
  const operator = await requireOperator();

  const parsed = z.enum(JOB_ASSIGNEES).safeParse(assignedTo);
  if (!parsed.success) return { ok: false, error: "Unknown assignee." };
  if (!Number.isInteger(jobId)) return { ok: false, error: "Unknown job." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  await db.update(jobs).set({ assignedTo: parsed.data }).where(eq(jobs.id, jobId));
  await logActivity(db, {
    entityType: "job",
    entityId: jobId,
    actor: operator,
    kind: "system",
    body: `Assigned to ${parsed.data}.`,
  });

  revalidateCrm();
  return { ok: true };
}
