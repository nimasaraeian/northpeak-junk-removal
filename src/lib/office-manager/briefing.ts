import Anthropic from "@anthropic-ai/sdk";
import { anthropicApiKey, visionModel } from "@/lib/admin/config";
import { listJobsBetween, listLeads } from "@/lib/admin/crm-data";
import { zonedInstant } from "@/lib/booking/booking-core";
import type { JobRow, LeadRow } from "@/lib/db/schema";

/**
 * Office Manager — the read-only daily briefing (Phase 1).
 *
 * It only reads: new and unanswered leads, quotes awaiting a reply, overdue
 * follow-ups, tomorrow's jobs, and records with missing details. It proposes
 * nothing executable and changes nothing — it just tells the owner what needs
 * attention so they don't have to go looking.
 */

const TZ = "America/Vancouver";
const OPEN_STATUSES = new Set(["new", "contacted", "quoted"]);

function vanDateStr(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const m: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") m[p.type] = p.value;
  return `${m.year}-${m.month}-${m.day}`;
}

function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const nd = new Date(Date.UTC(y, m - 1, d) + days * 86400000);
  return `${nd.getUTCFullYear()}-${String(nd.getUTCMonth() + 1).padStart(2, "0")}-${String(
    nd.getUTCDate(),
  ).padStart(2, "0")}`;
}

function vanTime(d: Date | null): string {
  if (!d) return "unscheduled";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function daysOld(created: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - created.getTime()) / 86400000));
}

export interface BriefingData {
  now: Date;
  newLeads: LeadRow[];
  overdueFollowUps: LeadRow[];
  awaitingReply: LeadRow[];
  incompleteLeads: LeadRow[];
  tomorrowJobs: JobRow[];
  tomorrowLabel: string;
}

export async function buildBriefingData(now = new Date()): Promise<BriefingData> {
  const today = vanDateStr(now);
  const tomorrow = addDaysStr(today, 1);
  const dayAfter = addDaysStr(today, 2);
  const from = zonedInstant(tomorrow, 0);
  const to = zonedInstant(dayAfter, 0);

  const [leads, jobs] = await Promise.all([listLeads({}, 500), listJobsBetween(from, to)]);

  const open = leads.filter((l) => OPEN_STATUSES.has(l.status));

  const newLeads = open.filter((l) => l.status === "new");
  const overdueFollowUps = open.filter(
    (l) => l.nextFollowUpAt !== null && new Date(l.nextFollowUpAt).getTime() < now.getTime(),
  );
  const awaitingReply = open.filter((l) => l.status === "quoted");
  const incompleteLeads = open.filter((l) => !l.phone.trim() && !l.email.trim());
  const tomorrowJobs = jobs
    .filter((j) => j.status !== "cancelled" && j.scheduledStart !== null)
    .sort(
      (a, b) =>
        (a.scheduledStart as Date).getTime() - (b.scheduledStart as Date).getTime(),
    );

  const tomorrowLabel = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(zonedInstant(tomorrow, 12));

  return {
    now,
    newLeads,
    overdueFollowUps,
    awaitingReply,
    incompleteLeads,
    tomorrowJobs,
    tomorrowLabel,
  };
}

function leadLine(l: LeadRow, now: Date): string {
  const area = l.area?.trim() ? `, ${l.area}` : "";
  const contact = l.phone?.trim() || l.email?.trim() || "no contact";
  const age = daysOld(new Date(l.createdAt), now);
  return `• ${l.name || "Unnamed"}${area} — ${contact} (${age}d old, ${l.source})`;
}

function jobLine(j: JobRow): string {
  const addr = j.address?.trim() ? j.address : "⚠ no address";
  const firstNote = (j.notes ?? "").split("\n")[0]?.slice(0, 80) ?? "";
  return `• ${vanTime(j.scheduledStart)} — ${addr}${firstNote ? ` · ${firstNote}` : ""}`;
}

/** Deterministic briefing text — the source of truth, always correct. */
export function renderBriefingText(data: BriefingData): string {
  const { now } = data;
  const lines: string[] = [];
  const section = (title: string, items: string[], empty: string) => {
    lines.push(`\n${title} (${items.length})`);
    lines.push(items.length ? items.join("\n") : `  ${empty}`);
  };

  lines.push(`📋 NorthPeak — Office Manager briefing`);
  lines.push(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(now),
  );

  section(
    "🆕 New leads to answer",
    data.newLeads.map((l) => leadLine(l, now)),
    "Nothing new — inbox clear.",
  );
  section(
    "⏰ Overdue follow-ups",
    data.overdueFollowUps.map((l) => leadLine(l, now)),
    "None overdue.",
  );
  section(
    "💬 Quotes awaiting a reply",
    data.awaitingReply.map((l) => leadLine(l, now)),
    "None waiting.",
  );
  section(
    `🗓 Tomorrow's jobs — ${data.tomorrowLabel}`,
    data.tomorrowJobs.map((j) => jobLine(j)),
    "No jobs scheduled.",
  );
  section(
    "⚠ Records missing contact info",
    data.incompleteLeads.map((l) => leadLine(l, now)),
    "All records have contact details.",
  );

  return lines.join("\n");
}

/**
 * Optional Anthropic narrative — a short, prioritized "what to focus on" written
 * on top of the deterministic lists. Best-effort: on any failure the briefing
 * still goes out with the exact lists below.
 */
export async function generateBriefingSummary(data: BriefingData): Promise<string | null> {
  const apiKey = anthropicApiKey();
  if (!apiKey) return null;

  const counts = `new_leads=${data.newLeads.length}, overdue_followups=${data.overdueFollowUps.length}, awaiting_reply=${data.awaitingReply.length}, tomorrow_jobs=${data.tomorrowJobs.length}, incomplete_records=${data.incompleteLeads.length}`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: visionModel(),
      max_tokens: 300,
      system:
        "You are the office manager for NorthPeak Junk Removal, a small junk-removal business in North Vancouver. Given today's counts, write 2–4 short sentences telling the owner what to focus on first and why. Be direct and practical. Do not invent specifics; only use the counts given. No greeting, no sign-off.",
      messages: [{ role: "user", content: `Today's counts: ${counts}.` }],
    });
    const text = response.content.find((b): b is Anthropic.TextBlock => b.type === "text")?.text;
    return text?.trim() || null;
  } catch {
    return null;
  }
}

/** Full briefing text (summary on top when available, then the exact lists). */
export async function composeBriefing(now = new Date()): Promise<string> {
  const data = await buildBriefingData(now);
  const body = renderBriefingText(data);
  const summary = await generateBriefingSummary(data);
  return summary ? `${body}\n\n— Focus —\n${summary}` : body;
}
