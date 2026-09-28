import {
  LEAD_STATUSES,
  type JobAssignee,
  type JobRow,
  type LeadRow,
  type LeadSource,
  type LeadStatus,
  type QuoteRow,
} from "@/lib/db/schema";

/**
 * CRM domain rules.
 *
 * Pure functions over plain data — no database, no framework, no clock of
 * their own (every function that needs "now" takes it). The pipeline board,
 * the server actions and the tests all call the same functions, so what the
 * board lets you drag and what the action lets you save cannot drift apart.
 */

// --- Pipeline --------------------------------------------------------------

/** Board column order, left to right. */
export const PIPELINE_ORDER: readonly LeadStatus[] = LEAD_STATUSES;

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  booked: "Booked",
  won: "Won",
  lost: "Lost",
};

/** Maps a lead status onto the four pill colours the design system has. */
export const LEAD_STATUS_TONE: Record<LeadStatus, "draft" | "sent" | "won" | "lost"> = {
  new: "draft",
  contacted: "sent",
  quoted: "sent",
  booked: "sent",
  won: "won",
  lost: "lost",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  website_form: "Website",
  google: "Google",
  referral: "Referral",
  repeat: "Repeat",
  ads: "Ads",
  walk_in: "Walk-in",
  other: "Other",
};

/**
 * Whether a lead may move from one column to another.
 *
 * Deliberately permissive in both directions — a real pipeline goes
 * backwards ("they said quoted, actually we never called") and a two-person
 * shop should not be fighting a state machine. The rules that do hold:
 *
 * - Won and Lost are terminal for forward motion: from either, the only way
 *   out is back to an earlier stage, because re-winning a won lead is not a
 *   thing that happens.
 * - A lead cannot transition to the status it already has.
 */
export function canTransition(from: LeadStatus, to: LeadStatus): boolean {
  if (from === to) return false;
  if (from === "won" || from === "lost") {
    return to !== "won" && to !== "lost";
  }
  return true;
}

export function allowedTransitions(from: LeadStatus): LeadStatus[] {
  return PIPELINE_ORDER.filter((status) => canTransition(from, status));
}

/** Lost always needs a reason; nothing else does. */
export function requiresLostReason(to: LeadStatus): boolean {
  return to === "lost";
}

// --- Card furniture --------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

/** "today", "3d", "5w" — deliberately terse, it sits on a card corner. */
export function ageLabel(createdAt: Date, now: Date): string {
  const days = Math.floor((now.getTime() - createdAt.getTime()) / DAY_MS);
  if (days <= 0) return "today";
  if (days === 1) return "1d";
  if (days < 14) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 9) return `${weeks}w`;
  return `${Math.floor(days / 30)}mo`;
}

export function isFollowUpOverdue(nextFollowUpAt: Date | null, now: Date): boolean {
  if (!nextFollowUpAt) return false;
  return nextFollowUpAt.getTime() < now.getTime();
}

/** "Today", "Tue 4 Nov", "Overdue 2d" — the chip on a pipeline card. */
export function followUpLabel(nextFollowUpAt: Date | null, now: Date): string | null {
  if (!nextFollowUpAt) return null;

  const diffDays = Math.floor((nextFollowUpAt.getTime() - startOfDay(now).getTime()) / DAY_MS);
  if (diffDays < 0) return `Overdue ${ageLabel(nextFollowUpAt, now)}`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return nextFollowUpAt.toLocaleDateString("en-CA", { weekday: "short", day: "numeric", month: "short" });
}

/** Two letters for the owner chip. "unassigned" has none, by design. */
export function ownerInitials(owner: string): string {
  if (owner === "unassigned") return "—";
  return owner.slice(0, 2).toUpperCase();
}

// --- Conversions -----------------------------------------------------------

export interface QuotePrefill {
  customerName: string;
  customerPhone: string;
  customerArea: string;
  leadId: number;
  clientId: number | null;
}

/** What "Convert to quote" carries across into the New Quote screen. */
export function leadToQuotePrefill(lead: LeadRow): QuotePrefill {
  return {
    customerName: lead.name,
    customerPhone: lead.phone,
    customerArea: lead.area,
    leadId: lead.id,
    clientId: lead.clientId,
  };
}

/** Query string for `/admin/quotes/new`, so the prefill survives a navigation. */
export function quotePrefillSearchParams(prefill: QuotePrefill): string {
  const params = new URLSearchParams();
  if (prefill.customerName) params.set("name", prefill.customerName);
  if (prefill.customerPhone) params.set("phone", prefill.customerPhone);
  if (prefill.customerArea) params.set("area", prefill.customerArea);
  params.set("leadId", String(prefill.leadId));
  if (prefill.clientId !== null) params.set("clientId", String(prefill.clientId));
  return params.toString();
}

export interface ClientDraft {
  name: string;
  phone: string;
  email: string | null;
  area: string;
  source: LeadSource;
  notes: string;
}

/** What "Convert to client" carries across. */
export function leadToClientDraft(lead: LeadRow): ClientDraft {
  return {
    name: lead.name,
    phone: lead.phone,
    email: lead.email || null,
    area: lead.area,
    source: lead.source,
    notes: lead.message,
  };
}

export interface JobDraft {
  clientId: number | null;
  quoteId: number;
  address: string;
  assignedTo: JobAssignee;
  notes: string;
  checklist: { label: string; done: boolean }[];
}

/** The default checklist a job starts with. Editable per job afterwards. */
export const DEFAULT_JOB_CHECKLIST: readonly string[] = [
  "Confirm access and parking",
  "Walk the load with the customer",
  "Confirm the price before loading",
  "Separate donation and recycling",
  "Sweep the cleared area",
  "Final walk-through before leaving",
];

/**
 * "Schedule this job" on a won quote.
 *
 * Unscheduled on purpose — it lands in the calendar's side rail for someone
 * to drag onto a day, rather than guessing a date nobody agreed to.
 */
export function quoteToJobDraft(quote: QuoteRow): JobDraft {
  return {
    clientId: quote.clientId,
    quoteId: quote.id,
    address: quote.customerArea,
    assignedTo: "unassigned",
    notes: quote.notes,
    checklist: DEFAULT_JOB_CHECKLIST.map((label) => ({ label, done: false })),
  };
}

/**
 * Whether saving a quote should advance its lead.
 *
 * Only forward, and only from the stages that precede Quoted: a lead already
 * booked or won must not be dragged back by someone re-saving a quote.
 */
export function shouldAdvanceLeadToQuoted(current: LeadStatus): boolean {
  return current === "new" || current === "contacted";
}

// --- Money -----------------------------------------------------------------

/**
 * Lifetime value: the midpoint of every won quote belonging to a client.
 *
 * The midpoint, because a range is what the customer accepted and there is
 * no invoiced figure in the system yet. Same basis as the dashboard's
 * revenue-won card, so the two agree.
 */
export function lifetimeValueCents(
  quotesForClient: Pick<QuoteRow, "status" | "finalLowCents" | "finalHighCents">[],
): number {
  return quotesForClient
    .filter((quote) => quote.status === "won")
    .reduce(
      (total, quote) => total + Math.round((quote.finalLowCents + quote.finalHighCents) / 2),
      0,
    );
}

// --- Review request --------------------------------------------------------

/**
 * The Send-review-SMS text.
 *
 * v2 copies it to the clipboard; actually sending is v3. Kept pure so the
 * wording is testable and so the button has nothing to get wrong.
 */
export function reviewSmsText(customerName: string, reviewUrl: string | null): string {
  const first = customerName.trim().split(/\s+/)[0] ?? "";
  const greeting = first ? `Hi ${first},` : "Hi,";
  const ask = reviewUrl
    ? `would you mind leaving us a quick Google review? ${reviewUrl}`
    : "would you mind leaving us a quick Google review?";

  return `${greeting} thanks again for having NorthPeak out — ${ask} It genuinely helps a small local crew. — NorthPeak Junk Removal`;
}

// --- Calendar --------------------------------------------------------------

export const CALENDAR_DAY_START_HOUR = 7;
export const CALENDAR_DAY_END_HOUR = 19;
/** Default length of a job dropped on an empty slot. */
export const DEFAULT_JOB_HOURS = 3;

export const ASSIGNEE_TONE: Record<JobAssignee, string> = {
  Nima: "#1d4f96",
  Sina: "#1a6b42",
  both: "#8a5a17",
  unassigned: "#5d6b7a",
};

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Monday-first week containing `date`. */
export function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  const weekday = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - weekday);
  return day;
}

export function weekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

/** ISO `YYYY-MM-DD` in local time, for URL params and day keys. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(key: string, fallback: Date): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return startOfDay(fallback);
  const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(parsed.getTime()) ? startOfDay(fallback) : parsed;
}

/**
 * Where a job sits in a day column, as percentages of the visible day.
 *
 * Returns null for a job that does not touch this day at all. A job running
 * past the visible window is clamped rather than dropped — better to show a
 * block ending at the edge than to lose it.
 */
export function jobBlockPosition(
  job: Pick<JobRow, "scheduledStart" | "scheduledEnd">,
  day: Date,
): { topPct: number; heightPct: number } | null {
  if (!job.scheduledStart) return null;

  const dayStart = new Date(day);
  dayStart.setHours(CALENDAR_DAY_START_HOUR, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(CALENDAR_DAY_END_HOUR, 0, 0, 0);

  const start = job.scheduledStart;
  const end =
    job.scheduledEnd ?? new Date(start.getTime() + DEFAULT_JOB_HOURS * 60 * 60 * 1000);

  if (end <= dayStart || start >= dayEnd) return null;

  const windowMs = dayEnd.getTime() - dayStart.getTime();
  const clampedStart = Math.max(start.getTime(), dayStart.getTime());
  const clampedEnd = Math.min(end.getTime(), dayEnd.getTime());

  return {
    topPct: ((clampedStart - dayStart.getTime()) / windowMs) * 100,
    heightPct: Math.max(4, ((clampedEnd - clampedStart) / windowMs) * 100),
  };
}

/** Moving a job to a new day and hour keeps its duration. */
export function rescheduleJob(
  job: Pick<JobRow, "scheduledStart" | "scheduledEnd">,
  day: Date,
  hour: number,
): { scheduledStart: Date; scheduledEnd: Date } {
  const durationMs =
    job.scheduledStart && job.scheduledEnd
      ? Math.max(30 * 60 * 1000, job.scheduledEnd.getTime() - job.scheduledStart.getTime())
      : DEFAULT_JOB_HOURS * 60 * 60 * 1000;

  const scheduledStart = new Date(day);
  scheduledStart.setHours(
    Math.min(CALENDAR_DAY_END_HOUR - 1, Math.max(CALENDAR_DAY_START_HOUR, Math.floor(hour))),
    0,
    0,
    0,
  );

  return {
    scheduledStart,
    scheduledEnd: new Date(scheduledStart.getTime() + durationMs),
  };
}

export function calendarHours(): number[] {
  return Array.from(
    { length: CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR },
    (_, index) => CALENDAR_DAY_START_HOUR + index,
  );
}

export function formatHour(hour: number): string {
  const suffix = hour < 12 ? "am" : "pm";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${suffix}`;
}

// --- Activity --------------------------------------------------------------

/** The sentence a status change writes into the timeline. */
export function statusChangeBody(
  entity: "lead" | "job" | "quote",
  from: string,
  to: string,
  reason?: string | null,
): string {
  const base = `${entity[0].toUpperCase()}${entity.slice(1)} moved ${from} → ${to}`;
  return reason?.trim() ? `${base} · ${reason.trim()}` : base;
}
