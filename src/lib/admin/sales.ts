import type { LeadRow, LeadStatus } from "@/lib/db/schema";

/**
 * Sales engine — speed-to-lead timers, call outcomes, and the ranked
 * "who to call now" list.
 *
 * Pure functions over plain data, like `crm.ts`: no database, no framework and
 * no clock of their own — everything that needs "now" takes it. The call list
 * page, the log-call action and the tests all run the same code, so what the
 * list promises and what saving a call does cannot drift apart.
 *
 * Why this exists: in junk removal the first company to call back usually gets
 * the job. A lead that waits an hour is mostly gone. So the panel measures the
 * wait in *business* minutes (a lead at 11pm is not late at 11:05pm), shows a
 * timer on every open lead, and ranks the day's calls by what is about to be
 * lost rather than by when it arrived.
 */

// --- Business hours --------------------------------------------------------

export interface BusinessHours {
  /** IANA zone the crew works in. */
  timeZone: string;
  /** 0 = Sunday … 6 = Saturday. */
  days: readonly number[];
  /** Opening and closing hour, local, 24h. */
  open: number;
  close: number;
}

export const BUSINESS_HOURS: BusinessHours = {
  timeZone: "America/Vancouver",
  days: [1, 2, 3, 4, 5, 6],
  open: 8,
  close: 19,
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Offset of `zone` from UTC at `at`, in ms (Vancouver is −7h or −8h). */
export function zoneOffsetMs(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/**
 * Minutes between `from` and `to` that fall inside business hours.
 *
 * Works on "wall-clock" time: each instant is shifted by the zone's offset at
 * that instant, then the open window of every working day in between is
 * intersected with the span. A daylight-saving change inside the span is off by
 * at most the hour it moves, which no timer here is sensitive to.
 */
export function businessMinutesBetween(from: Date, to: Date, hours: BusinessHours = BUSINESS_HOURS): number {
  if (to <= from) return 0;
  const a = from.getTime() + zoneOffsetMs(from, hours.timeZone);
  const b = to.getTime() + zoneOffsetMs(to, hours.timeZone);

  let total = 0;
  for (let day = Math.floor(a / DAY) * DAY; day < b; day += DAY) {
    const weekday = new Date(day).getUTCDay();
    if (!hours.days.includes(weekday)) continue;
    const open = day + hours.open * HOUR;
    const close = day + hours.close * HOUR;
    const start = Math.max(open, a);
    const end = Math.min(close, b);
    if (end > start) total += end - start;
  }
  return Math.round(total / MINUTE);
}

/** True when `at` is inside business hours. */
export function isOpenAt(at: Date, hours: BusinessHours = BUSINESS_HOURS): boolean {
  const local = new Date(at.getTime() + zoneOffsetMs(at, hours.timeZone));
  const h = local.getUTCHours() + local.getUTCMinutes() / 60;
  return hours.days.includes(local.getUTCDay()) && h >= hours.open && h < hours.close;
}

/**
 * The next moment the business is open at or after `at` plus `minutes` of
 * business time. Used to put a follow-up "two business hours from now" at
 * 10am tomorrow when it is asked for at 6pm.
 */
export function addBusinessMinutes(at: Date, minutes: number, hours: BusinessHours = BUSINESS_HOURS): Date {
  let cursor = new Date(at);
  let left = minutes;
  // Walk in 15-minute steps; bounded so a misconfigured calendar cannot spin.
  for (let i = 0; i < 4 * 24 * 21 && left > 0; i++) {
    const next = new Date(cursor.getTime() + 15 * MINUTE);
    left -= businessMinutesBetween(cursor, next, hours);
    cursor = next;
  }
  // Land on an open minute even when `minutes` was 0.
  for (let i = 0; i < 4 * 24 * 14 && !isOpenAt(cursor, hours); i++) {
    cursor = new Date(cursor.getTime() + 15 * MINUTE);
  }
  return cursor;
}

// --- Speed-to-lead timers --------------------------------------------------

/** How long each stage may wait before it is late. */
export const SLA = {
  /** New lead → first call attempt, business minutes. */
  firstContactMinutes: 15,
  /** First contact → quote sent, business minutes. */
  quoteMinutes: 4 * 60,
  /** Quote sent → follow-up call, business minutes. */
  quoteFollowUpMinutes: 8 * 60,
} as const;

export type SlaStage = "first_contact" | "quote" | "quote_follow_up";
export type SlaState = "ok" | "soon" | "urgent" | "late";

export interface SlaClock {
  stage: SlaStage;
  state: SlaState;
  /** Business minutes allowed for this stage. */
  targetMinutes: number;
  /** Business minutes used so far. */
  elapsedMinutes: number;
  /** Negative when late. */
  remainingMinutes: number;
}

export const SLA_STAGE_LABELS: Record<SlaStage, string> = {
  first_contact: "First call",
  quote: "Send quote",
  quote_follow_up: "Quote follow-up",
};

type SlaLead = Pick<LeadRow, "status" | "createdAt"> & {
  firstContactedAt: Date | null;
  quotedAt: Date | null;
  lastContactAt?: Date | null;
};

/**
 * The timer that matters for a lead right now, or null when nothing is
 * running (won, lost, booked, or a stage with no clock).
 */
export function slaClock(lead: SlaLead, now: Date, hours: BusinessHours = BUSINESS_HOURS): SlaClock | null {
  let stage: SlaStage;
  let since: Date;

  if (lead.status === "won" || lead.status === "lost" || lead.status === "booked") return null;

  if (!lead.firstContactedAt) {
    stage = "first_contact";
    since = lead.createdAt;
  } else if (lead.status === "new") {
    // Called but nobody picked up: the speed-to-lead target was met by the
    // attempt itself; the retry is driven by the follow-up date, not a timer.
    return null;
  } else if (lead.status === "quoted" || lead.quotedAt) {
    stage = "quote_follow_up";
    // A follow-up call after the quote restarts the clock from that call.
    const quoted = lead.quotedAt ?? lead.firstContactedAt;
    since = lead.lastContactAt && lead.lastContactAt > quoted ? lead.lastContactAt : quoted;
  } else {
    stage = "quote";
    since = lead.firstContactedAt;
  }

  const targetMinutes =
    stage === "first_contact"
      ? SLA.firstContactMinutes
      : stage === "quote"
        ? SLA.quoteMinutes
        : SLA.quoteFollowUpMinutes;
  const elapsedMinutes = businessMinutesBetween(since, now, hours);
  const remainingMinutes = targetMinutes - elapsedMinutes;
  const share = remainingMinutes / targetMinutes;
  const state: SlaState = remainingMinutes < 0 ? "late" : share < 0.2 ? "urgent" : share < 0.5 ? "soon" : "ok";

  return { stage, state, targetMinutes, elapsedMinutes, remainingMinutes };
}

/** "12m left", "3h 10m left", "40m late", "2d late" — the chip text. */
export function slaLabel(clock: SlaClock): string {
  return clock.remainingMinutes < 0 ? `${slaSpan(clock)} late` : `${slaSpan(clock)} left`;
}

/** Just the duration part: "12m", "3h 10m", "2d" (a day = one business day). */
export function slaSpan(clock: SlaClock): string {
  const minutes = Math.abs(clock.remainingMinutes);
  return minutes < 60
    ? `${minutes}m`
    : minutes < 60 * 11
      ? `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ""}`
      : `${Math.max(1, Math.round(minutes / (60 * 11)))}d`;
}

// --- Call outcomes ---------------------------------------------------------

export const CALL_OUTCOMES = [
  "booked",
  "quote_sent",
  "interested",
  "thinking",
  "call_back",
  "no_answer",
  "voicemail",
  "not_interested",
  "wrong_number",
] as const;
export type CallOutcome = (typeof CALL_OUTCOMES)[number];

export const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
  booked: "Booked",
  quote_sent: "Quote sent",
  interested: "Interested",
  thinking: "Thinking it over",
  call_back: "Call back later",
  no_answer: "No answer",
  voicemail: "Left voicemail",
  not_interested: "Not interested",
  wrong_number: "Wrong number",
};

/** Whether the outcome means a person was actually spoken to. */
export function reachedSomeone(outcome: CallOutcome): boolean {
  return outcome !== "no_answer" && outcome !== "voicemail" && outcome !== "wrong_number";
}

export const CALL_FLAGS = ["price", "competitor", "urgent", "big_job", "repeat_potential"] as const;
export type CallFlag = (typeof CALL_FLAGS)[number];

export const CALL_FLAG_LABELS: Record<CallFlag, string> = {
  price: "Price-sensitive",
  competitor: "Comparing quotes",
  urgent: "Urgent",
  big_job: "Big job",
  repeat_potential: "Repeat potential",
};

/** Where a lead goes after a call with this outcome, if anywhere. */
export function statusAfterCall(current: LeadStatus, outcome: CallOutcome): LeadStatus | null {
  if (current === "won" || current === "lost") return null;
  if (outcome === "booked") return current === "booked" ? null : "booked";
  if (outcome === "not_interested" || outcome === "wrong_number") return "lost";
  if (outcome === "quote_sent") return current === "new" || current === "contacted" ? "quoted" : null;
  if (reachedSomeone(outcome) && current === "new") return "contacted";
  return null;
}

/**
 * Business minutes until the next call, per outcome; null means no follow-up.
 * A no-answer is retried the same day, a voicemail the next morning, someone
 * thinking it over in two days.
 */
export const FOLLOW_UP_AFTER: Record<CallOutcome, number | null> = {
  booked: null,
  quote_sent: SLA.quoteFollowUpMinutes,
  interested: 60 * 11,
  thinking: 2 * 60 * 11,
  call_back: 3 * 60 * 11,
  no_answer: 2 * 60,
  voicemail: 60 * 11,
  not_interested: null,
  wrong_number: null,
};

/** A no-answer more than this many times stops being retried by phone. */
export const MAX_UNANSWERED = 4;

export function defaultFollowUp(
  outcome: CallOutcome,
  now: Date,
  hours: BusinessHours = BUSINESS_HOURS,
): Date | null {
  const minutes = FOLLOW_UP_AFTER[outcome];
  return minutes === null ? null : addBusinessMinutes(now, minutes, hours);
}

// --- Reading the call note -------------------------------------------------

export interface NoteReading {
  outcome: CallOutcome | null;
  flags: CallFlag[];
  /** A follow-up the note asks for ("call Friday"), if any. */
  followUp: Date | null;
}

/** Persian day names, indexed like `Date.getUTCDay()` (0 = Sunday). */
const FA_WEEKDAYS = ["یکشنبه", "دوشنبه", "سهشنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/**
 * Persian is typed with and without the zero-width non-joiner and with
 * spaces in its place ("سه‌شنبه", "سهشنبه", "سه شنبه"), so both sides are
 * compared with ZWNJs removed, and Persian phrases also match space-free.
 */
const ZWNJ = /\u200c/g;
const PERSIAN = /[\u0600-\u06ff]/;
const has = (text: string, words: string[]) =>
  words.some((w) => {
    const word = w.replace(ZWNJ, "");
    if (text.includes(word)) return true;
    return PERSIAN.test(word) && text.replace(/ /g, "").includes(word.replace(/ /g, ""));
  });

/**
 * Pulls an outcome, flags and a follow-up day out of what the operator typed.
 *
 * Keyword rules, not a model: the operator sees every suggestion as a chip and
 * accepts or ignores it, so a miss costs a click, never a wrong record. The
 * order of the outcome checks is the order of precedence — "no answer, left a
 * voicemail" is a voicemail; "booked, but wants a lower price" is booked.
 */
export function readCallNote(raw: string, now: Date, hours: BusinessHours = BUSINESS_HOURS): NoteReading {
  const text = ` ${raw.toLowerCase().replace(/[’']/g, "'").replace(ZWNJ, "").replace(/ي/g, "ی").replace(/ك/g, "ک")} `;

  let outcome: CallOutcome | null = null;
  if (has(text, ["wrong number", "not their number", "disconnected", "شماره اشتباه"])) outcome = "wrong_number";
  else if (has(text, ["voicemail", "voice mail", "left a message", " vm ", "پیام صوتی", "ویس"])) outcome = "voicemail";
  else if (has(text, ["no answer", "didn't pick up", "did not pick up", "no pickup", "not picking up", "straight to", "جواب نداد", "برنداشت", "جواب نمی"])) outcome = "no_answer";
  else if (has(text, ["booked", "confirmed for", "scheduled for", "locked in", "see you on", "رزرو شد", "قطعی شد", "وقت گرفت"])) outcome = "booked";
  else if (has(text, ["not interested", "no longer need", "don't need", "went with", "already done", "cancel", "نمی‌خواد", "نمیخواد", "منصرف", "کنسل"])) outcome = "not_interested";
  else if (has(text, ["sent the quote", "sent quote", "quote sent", "sent a quote", "emailed the quote", "texted the quote", "برآورد فرستادم", "قیمت فرستادم", "قیمت دادم"])) outcome = "quote_sent";
  else if (has(text, ["call back", "call me back", "call later", "reach out later", "next month", "بعدا زنگ", "بعداً زنگ", "ماه بعد"])) outcome = "call_back";
  else if (has(text, ["think about", "thinking", "talk to my", "check with", "let us know", "get back to", "فکر کنه", "فکر کند", "مشورت"])) outcome = "thinking";
  else if (has(text, ["interested", "wants a quote", "send a quote", "sounds good", "keen", "علاقه", "قیمت بفرست", "مایله"])) outcome = "interested";

  const flags: CallFlag[] = [];
  if (has(text, ["expensive", "too much", "cheaper", "price", "budget", "discount", "lower", "گرون", "گران", "تخفیف", "قیمت"])) flags.push("price");
  if (has(text, ["other quote", "another quote", "other company", "competitor", "got junk", "1-800", "comparing", "shopping around", "شرکت دیگه", "شرکت دیگر", "مقایسه"])) flags.push("competitor");
  if (has(text, ["asap", "urgent", "today", "tomorrow", "moving out", "closing date", "possession", "this week", "فوری", "امروز", "فردا", "اسباب‌کشی", "همین هفته"])) flags.push("urgent");
  if (has(text, ["full truck", "whole house", "estate", "basement", "garage full", "big job", "two loads", "2 loads", "کل خونه", "کل خانه", "زیرزمین", "کار بزرگ"])) flags.push("big_job");
  if (has(text, ["property manager", "realtor", "landlord", "contractor", "every month", "regular", "more units", "other properties", "مدیر ساختمان", "مشاور املاک", "پیمانکار", "صاحبخانه"])) flags.push("repeat_potential");

  let followUp: Date | null = null;
  const local = new Date(now.getTime() + zoneOffsetMs(now, hours.timeZone));
  const atNine = (daysAhead: number) => {
    // 9:00 local on the day `daysAhead` from today, back in UTC.
    const day = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + daysAhead, 9);
    const guess = new Date(day);
    return new Date(day - zoneOffsetMs(guess, hours.timeZone));
  };
  const inDays = /\bin (\d{1,2}) days?\b/.exec(text);
  // Index = getUTCDay(); Saturday ("شنبه") is a suffix of most other names,
  // so it is matched only when no longer name is in the note.
  const faWeekday = FA_WEEKDAYS.findIndex((day) => has(text, [day]));
  if (has(text, ["پس فردا", "پسفردا"])) followUp = atNine(2);
  else if (text.includes("tomorrow") || has(text, ["فردا"])) followUp = atNine(1);
  else if (faWeekday >= 0) followUp = atNine((faWeekday - local.getUTCDay() + 7) % 7 || 7);
  else if (inDays) followUp = atNine(Number(inDays[1]));
  else if (text.includes("next week")) followUp = atNine(7 - ((local.getUTCDay() + 6) % 7)); // next Monday
  else if (text.includes("end of the month") || text.includes("end of month")) {
    const last = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 0));
    followUp = atNine(Math.max(1, last.getUTCDate() - local.getUTCDate()));
  } else {
    // Longest names first never matters in English, but a weekday mentioned
    // after "on"/"by"/"this"/"next" or alone as a word is the follow-up day.
    for (let i = 0; i < 7; i++) {
      if (new RegExp(`\\b${WEEKDAYS[i]}\\b`).test(text)) {
        const ahead = ((i - local.getUTCDay() + 7) % 7) || 7;
        followUp = atNine(ahead);
        break;
      }
    }
  }

  return { outcome, flags, followUp };
}

// --- The call list ---------------------------------------------------------

export type CallReason =
  | "new_lead"
  | "promised"
  | "quote_follow_up"
  | "retry"
  | "send_quote"
  | "reactivate";

export const CALL_REASON_LABELS: Record<CallReason, string> = {
  new_lead: "New lead — call now",
  promised: "Follow-up due",
  quote_follow_up: "Quote not booked yet",
  retry: "Try again",
  send_quote: "Waiting on a quote",
  reactivate: "Past client — time to check in",
};

/** Base urgency per reason. Value only breaks ties within a band. */
const REASON_BASE: Record<CallReason, number> = {
  new_lead: 100,
  promised: 90,
  quote_follow_up: 80,
  send_quote: 75,
  retry: 60,
  reactivate: 30,
};

export interface CallListLead {
  id: number;
  name: string;
  phone: string;
  area: string;
  status: LeadStatus;
  owner: string;
  createdAt: Date;
  nextFollowUpAt: Date | null;
  firstContactedAt: Date | null;
  quotedAt: Date | null;
  lastContactAt: Date | null;
  lastOutcome: string | null;
  callAttempts: number;
  unansweredStreak: number;
  flags: string[];
  /** Best guess of the job's worth: quote midpoint, else 0. */
  valueCents: number;
}

export interface CallListClient {
  id: number;
  name: string;
  phone: string;
  area: string;
  lastJobAt: Date;
  jobCount: number;
  lifetimeValueCents: number;
  lastContactAt: Date | null;
}

export interface CallItem {
  key: string;
  kind: "lead" | "client";
  id: number;
  name: string;
  phone: string;
  area: string;
  owner: string;
  reason: CallReason;
  /**
   * One line on why, shown under the name — an English template with
   * `{name}` slots, so the page can translate it and then fill the values.
   */
  why: string;
  whyVars: Record<string, string | number>;
  clock: SlaClock | null;
  flags: string[];
  valueCents: number;
  score: number;
}

/** Reactivate a past client once this long after their last job. */
export const REACTIVATE_AFTER_DAYS = 300;
/** …but not if they were contacted in this window. */
export const REACTIVATE_QUIET_DAYS = 90;

function valueBonus(valueCents: number): number {
  // log scale, capped: a $2,000 job outranks a $200 one within the same band,
  // never a whole band above it.
  return Math.min(9.9, Math.log10(1 + valueCents / 100) * 3);
}

/**
 * Today's calls, most urgent first.
 *
 * Bands, top to bottom: a new lead nobody has called; a follow-up someone
 * promised; a quote that has not turned into a booking; a lead still waiting
 * for its quote; a no-answer due another try; a past client worth a check-in.
 * A late timer lifts an item to the top of its band, and the job's value
 * breaks ties. Leads called in the last two hours without an answer, or
 * reached in the last day, are left alone — calling again so soon annoys.
 */
export function buildCallList(
  leads: CallListLead[],
  pastClients: CallListClient[],
  now: Date,
  hours: BusinessHours = BUSINESS_HOURS,
): CallItem[] {
  const items: CallItem[] = [];

  for (const lead of leads) {
    if (lead.status === "won" || lead.status === "lost") continue;

    const sinceLastCall = lead.lastContactAt ? now.getTime() - lead.lastContactAt.getTime() : Infinity;
    const lastWasMiss = lead.lastOutcome === "no_answer" || lead.lastOutcome === "voicemail";
    const followUpDue = lead.nextFollowUpAt !== null && lead.nextFollowUpAt <= now;
    if (!followUpDue && sinceLastCall < (lastWasMiss ? 2 * HOUR : DAY)) continue;
    if (lead.nextFollowUpAt && lead.nextFollowUpAt > now && lead.firstContactedAt) continue;

    const clock = slaClock(lead, now, hours);
    let reason: CallReason | null = null;
    let why = "";
    let whyVars: Record<string, string | number> = {};

    if (!lead.firstContactedAt) {
      reason = "new_lead";
      why = "Came in {ago}; nobody has called yet.";
      whyVars = { ago: minutesAgo(lead.createdAt, now) };
    } else if (followUpDue) {
      reason = lastWasMiss ? "retry" : "promised";
      why = lastWasMiss ? "{n} unanswered so far." : "Follow-up was due {ago}.";
      whyVars = lastWasMiss ? { n: lead.unansweredStreak } : { ago: minutesAgo(lead.nextFollowUpAt!, now) };
    } else if (lead.status === "quoted" || lead.quotedAt) {
      reason = "quote_follow_up";
      why = lead.quotedAt ? "Quoted {ago}; not booked." : "Quoted; not booked.";
      whyVars = lead.quotedAt ? { ago: minutesAgo(lead.quotedAt, now) } : {};
    } else if (lead.status === "contacted") {
      reason = "send_quote";
      why = "Spoken to, no quote sent yet.";
    }

    if (!reason) continue;
    if (reason === "retry" && lead.unansweredStreak >= MAX_UNANSWERED) {
      why = "{n} unanswered — switch to SMS or email.";
      whyVars = { n: lead.unansweredStreak };
    }

    let score = REASON_BASE[reason] + valueBonus(lead.valueCents);
    if (clock?.state === "late") score += 5;
    if (lead.flags.includes("urgent")) score += 3;
    if (reason === "retry" && lead.unansweredStreak >= MAX_UNANSWERED) score -= 40;

    items.push({
      key: `lead-${lead.id}`,
      kind: "lead",
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      area: lead.area,
      owner: lead.owner,
      reason,
      why,
      whyVars,
      clock,
      flags: lead.flags,
      valueCents: lead.valueCents,
      score,
    });
  }

  for (const client of pastClients) {
    const daysSinceJob = (now.getTime() - client.lastJobAt.getTime()) / DAY;
    if (daysSinceJob < REACTIVATE_AFTER_DAYS) continue;
    if (client.lastContactAt && now.getTime() - client.lastContactAt.getTime() < REACTIVATE_QUIET_DAYS * DAY) continue;
    const repeat = client.jobCount > 1;
    items.push({
      key: `client-${client.id}`,
      kind: "client",
      id: client.id,
      name: client.name,
      phone: client.phone,
      area: client.area,
      owner: "unassigned",
      reason: "reactivate",
      why: repeat ? "Last job {months} months ago · {jobs} jobs so far." : "Last job {months} months ago.",
      whyVars: { months: Math.round(daysSinceJob / 30), jobs: client.jobCount },
      clock: null,
      flags: repeat ? ["repeat_potential"] : [],
      valueCents: client.lifetimeValueCents,
      score: REASON_BASE.reactivate + valueBonus(client.lifetimeValueCents) + (repeat ? 5 : 0),
    });
  }

  return items.sort((x, y) => y.score - x.score);
}

function minutesAgo(at: Date, now: Date): string {
  const minutes = Math.max(0, Math.round((now.getTime() - at.getTime()) / MINUTE));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / (60 * 24))}d ago`;
}

/** Counts of consecutive unanswered calls, newest first. */
export function unansweredStreak(outcomesNewestFirst: string[]): number {
  let streak = 0;
  for (const outcome of outcomesNewestFirst) {
    if (outcome === "no_answer" || outcome === "voicemail") streak++;
    else break;
  }
  return streak;
}

// --- Speed-to-lead report --------------------------------------------------

export interface SpeedStats {
  /** Leads with a first contact in the window. */
  contacted: number;
  /** Median business minutes to first contact. */
  medianMinutes: number | null;
  /** Share answered inside the SLA, 0–1. */
  withinSla: number | null;
}

export function speedToLead(
  rows: { createdAt: Date; firstContactedAt: Date | null }[],
  hours: BusinessHours = BUSINESS_HOURS,
): SpeedStats {
  const waits = rows
    .filter((r) => r.firstContactedAt)
    .map((r) => businessMinutesBetween(r.createdAt, r.firstContactedAt!, hours))
    .sort((a, b) => a - b);
  if (waits.length === 0) return { contacted: 0, medianMinutes: null, withinSla: null };
  const mid = Math.floor(waits.length / 2);
  const median = waits.length % 2 ? waits[mid] : Math.round((waits[mid - 1] + waits[mid]) / 2);
  return {
    contacted: waits.length,
    medianMinutes: median,
    withinSla: waits.filter((w) => w <= SLA.firstContactMinutes).length / waits.length,
  };
}

// --- Deriving a lead's sales state ----------------------------------------

export interface CallFact {
  createdAt: Date;
  outcome: string;
  flags: string[];
}

export interface StatusEvent {
  createdAt: Date;
  /** The activity body, e.g. "Lead moved new → contacted". */
  body: string;
}

export interface LeadSalesState {
  firstContactedAt: Date | null;
  quotedAt: Date | null;
  lastContactAt: Date | null;
  lastOutcome: string | null;
  callAttempts: number;
  unansweredStreak: number;
  flags: string[];
}

const MOVED_TO = /moved \w+ → (\w+)/;

/**
 * A lead's timer inputs, read from its calls and its status history.
 *
 * Calls are the main source. Status changes cover leads someone moved by hand
 * before calls were logged — a lead dragged to "contacted" was contacted at
 * that moment, even with no call row — so the timer never shows a phantom
 * "first call late" on old leads.
 */
export function deriveLeadSales(calls: CallFact[], statusEvents: StatusEvent[]): LeadSalesState {
  const byTime = [...calls].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const events = [...statusEvents].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const movedTo = (targets: string[]) =>
    events.find((e) => targets.includes(MOVED_TO.exec(e.body)?.[1] ?? ""))?.createdAt ?? null;
  const earliest = (...dates: (Date | null)[]) =>
    dates.filter((d): d is Date => d !== null).sort((a, b) => a.getTime() - b.getTime())[0] ?? null;

  const firstCall = byTime[0]?.createdAt ?? null;
  const firstQuoteCall = byTime.find((c) => c.outcome === "quote_sent")?.createdAt ?? null;
  const last = byTime[byTime.length - 1] ?? null;

  const flags = new Set<string>();
  for (const call of byTime) for (const flag of call.flags) flags.add(flag);

  return {
    firstContactedAt: earliest(firstCall, movedTo(["contacted", "quoted", "booked", "won"])),
    quotedAt: earliest(firstQuoteCall, movedTo(["quoted"])),
    lastContactAt: last?.createdAt ?? null,
    lastOutcome: last?.outcome ?? null,
    callAttempts: byTime.length,
    unansweredStreak: unansweredStreak(byTime.map((c) => c.outcome).reverse()),
    flags: [...flags],
  };
}

/** Fills `{name}` slots in a (translated) template. */
export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}
