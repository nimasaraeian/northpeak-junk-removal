import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { anthropicApiKey, visionModel } from "@/lib/admin/config";
import { listJobsBetween, listLeads } from "@/lib/admin/crm-data";
import { zonedInstant } from "@/lib/booking/booking-core";
import { getDb } from "@/lib/db/client";
import { quotes, type JobRow, type LeadRow, type QuoteRow } from "@/lib/db/schema";

/**
 * Office Manager — the read-only daily briefing.
 *
 * It only reads and reasons. It surfaces new/unanswered leads, overdue
 * follow-ups, quotes awaiting a reply (and the money at risk there), tomorrow's
 * jobs, and records with missing details — then, for the items that need a
 * human, it drafts a ready-to-copy message and says why it matters. It sends
 * nothing and changes nothing in the CRM; the drafts are for the owner to use.
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

function dollars(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-CA")}`;
}

export interface BriefingData {
  now: Date;
  newLeads: LeadRow[];
  overdueFollowUps: LeadRow[];
  awaitingReply: LeadRow[];
  incompleteLeads: LeadRow[];
  tomorrowJobs: JobRow[];
  tomorrowLabel: string;
  pendingQuotes: QuoteRow[];
  valueAtRiskLowCents: number;
  valueAtRiskHighCents: number;
}

export async function buildBriefingData(now = new Date()): Promise<BriefingData> {
  const today = vanDateStr(now);
  const tomorrow = addDaysStr(today, 1);
  const dayAfter = addDaysStr(today, 2);
  const from = zonedInstant(tomorrow, 0);
  const to = zonedInstant(dayAfter, 0);

  const db = getDb();
  const [leads, jobs, pendingQuotes] = await Promise.all([
    listLeads({}, 500),
    listJobsBetween(from, to),
    db ? db.select().from(quotes).where(eq(quotes.status, "sent")) : Promise.resolve([]),
  ]);

  const open = leads.filter((l) => OPEN_STATUSES.has(l.status));
  const newLeads = open.filter((l) => l.status === "new");
  const overdueFollowUps = open.filter(
    (l) => l.nextFollowUpAt !== null && new Date(l.nextFollowUpAt).getTime() < now.getTime(),
  );
  const awaitingReply = open.filter((l) => l.status === "quoted");
  const incompleteLeads = open.filter((l) => !l.phone.trim() && !l.email.trim());
  const tomorrowJobs = jobs
    .filter((j) => j.status !== "cancelled" && j.scheduledStart !== null)
    .sort((a, b) => (a.scheduledStart as Date).getTime() - (b.scheduledStart as Date).getTime());

  const valueAtRiskLowCents = pendingQuotes.reduce((s, q) => s + (q.finalLowCents ?? 0), 0);
  const valueAtRiskHighCents = pendingQuotes.reduce((s, q) => s + (q.finalHighCents ?? 0), 0);

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
    pendingQuotes,
    valueAtRiskLowCents,
    valueAtRiskHighCents,
  };
}

// --- Smart action plan (read-only drafts) ----------------------------------

export type ActionPriority = "high" | "medium" | "low";

export interface ActionPlanItem {
  leadId: number;
  priority: ActionPriority;
  why: string;
  draftSms: string;
}

export type ActionPlan = Map<number, ActionPlanItem>;

/** The leads that need a human touch, newest-pressure first, capped for one call. */
function attentionLeads(data: BriefingData): LeadRow[] {
  const byId = new Map<number, LeadRow>();
  for (const l of [...data.overdueFollowUps, ...data.newLeads, ...data.awaitingReply]) {
    if (!byId.has(l.id)) byId.set(l.id, l);
  }
  return [...byId.values()].slice(0, 12);
}

/**
 * One Anthropic call that, for each attention lead, returns a priority, a short
 * reason, and a ready-to-copy SMS draft. Best-effort: on any failure it returns
 * an empty plan and the briefing still shows the exact lists.
 */
export async function generateActionPlan(data: BriefingData): Promise<ActionPlan> {
  const plan: ActionPlan = new Map();
  const apiKey = anthropicApiKey();
  const leads = attentionLeads(data);
  if (!apiKey || leads.length === 0) return plan;

  const items = leads.map((l) => ({
    leadId: l.id,
    name: l.name || "there",
    status: l.status,
    daysOld: daysOld(new Date(l.createdAt), data.now),
    area: l.area || "",
    source: l.source,
    note: (l.message || "").slice(0, 200),
    hasPhone: Boolean(l.phone.trim()),
  }));

  const prompt = `You are the office manager for NorthPeak Junk Removal, a small junk-removal business in North Vancouver, BC (Canadian English).
For each lead below, return a JSON object with:
- "leadId": the number,
- "priority": "high" | "medium" | "low",
- "why": one short sentence on why it needs attention now,
- "draftSms": a friendly, concise SMS the owner could send this customer (<=320 chars, first name only, sign off "— NorthPeak"; never promise a price, offer a free on-site estimate or to answer questions).
Base everything only on the data given; do not invent details. Return ONLY a JSON array, no prose, no markdown.

Leads: ${JSON.stringify(items)}`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: visionModel(),
      max_tokens: 1800,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content.find((b): b is Anthropic.TextBlock => b.type === "text")?.text ?? "";
    const json = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return plan;
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const leadId = typeof r.leadId === "number" ? r.leadId : Number(r.leadId);
      if (!Number.isInteger(leadId)) continue;
      const priority: ActionPriority =
        r.priority === "high" || r.priority === "low" ? r.priority : "medium";
      plan.set(leadId, {
        leadId,
        priority,
        why: typeof r.why === "string" ? r.why : "",
        draftSms: typeof r.draftSms === "string" ? r.draftSms : "",
      });
    }
  } catch {
    return plan;
  }
  return plan;
}

// --- Text rendering (Telegram) ---------------------------------------------

function leadLine(l: LeadRow, now: Date, plan?: ActionPlan): string {
  const area = l.area?.trim() ? `, ${l.area}` : "";
  const contact = l.phone?.trim() || l.email?.trim() || "no contact";
  const age = daysOld(new Date(l.createdAt), now);
  const item = plan?.get(l.id);
  const why = item?.why ? `\n   ↳ ${item.why}` : "";
  return `• ${l.name || "Unnamed"}${area} — ${contact} (${age}d, ${l.source})${why}`;
}

function jobLine(j: JobRow): string {
  const addr = j.address?.trim() ? j.address : "⚠ no address";
  const firstNote = (j.notes ?? "").split("\n")[0]?.slice(0, 80) ?? "";
  return `• ${vanTime(j.scheduledStart)} — ${addr}${firstNote ? ` · ${firstNote}` : ""}`;
}

export function renderBriefingText(data: BriefingData, plan?: ActionPlan): string {
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

  if (data.pendingQuotes.length > 0) {
    lines.push(
      `\n💰 ${dollars(data.valueAtRiskLowCents)}–${dollars(data.valueAtRiskHighCents)} in ${data.pendingQuotes.length} quote(s) awaiting a reply.`,
    );
  }

  section(
    "🆕 New leads to answer",
    data.newLeads.map((l) => leadLine(l, now, plan)),
    "Nothing new — inbox clear.",
  );
  section(
    "⏰ Overdue follow-ups",
    data.overdueFollowUps.map((l) => leadLine(l, now, plan)),
    "None overdue.",
  );
  section(
    "💬 Quotes awaiting a reply",
    data.awaitingReply.map((l) => leadLine(l, now, plan)),
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

  lines.push(
    `\nDrafts for each lead are ready to copy in the panel → /admin/today. Nothing is sent automatically.`,
  );

  return lines.join("\n");
}

/** Full briefing text for Telegram (deterministic lists + reasons). */
export async function composeBriefing(now = new Date()): Promise<string> {
  const data = await buildBriefingData(now);
  const plan = await generateActionPlan(data);
  return renderBriefingText(data, plan);
}
