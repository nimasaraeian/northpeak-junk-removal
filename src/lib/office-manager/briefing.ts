import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { anthropicApiKey, visionModel } from "@/lib/admin/config";
import { listJobsBetween, listLeads, listUnscheduledJobs } from "@/lib/admin/crm-data";
import { SLA } from "@/lib/admin/sales";
import { loadCallList } from "@/lib/admin/sales-data";
import { zonedInstant } from "@/lib/booking/booking-core";
import { getDb } from "@/lib/db/client";
import { quotes, type JobRow, type LeadRow, type QuoteRow } from "@/lib/db/schema";

/**
 * Office Manager — the read-only daily briefing.
 *
 * It only reads and reasons. It surfaces new/unanswered leads, overdue
 * follow-ups, quotes awaiting a reply (and the money at risk there), tomorrow's
 * jobs, booked-but-unscheduled work, and records with missing details — then,
 * for the items that need a human, it drafts a ready-to-copy message, says why
 * it matters, and writes a short management read of the day. It sends nothing
 * and changes nothing in the CRM; the drafts are for the owner to use.
 */

const TZ = "America/Vancouver";
// A lead is "open" while it's still in play. This must match the dashboard's
// notion of open (new + contacted + quoted + booked); leaving "booked" out here
// was hiding booked leads' overdue follow-ups and making the two screens
// disagree.
const OPEN_STATUSES = new Set(["new", "contacted", "quoted", "booked"]);

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

/** A plain-language read of a lead's follow-up state, grounded in real dates. */
function followUpDesc(nextFollowUpAt: Date | null, now: Date): string {
  if (!nextFollowUpAt) return "no follow-up set";
  const diff = Math.round((new Date(nextFollowUpAt).getTime() - now.getTime()) / 86400000);
  if (diff < 0) return `follow-up overdue by ${-diff}d`;
  if (diff === 0) return "follow-up due today";
  return `follow-up in ${diff}d`;
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
  unscheduledJobs: JobRow[];
  tomorrowLabel: string;
  pendingQuotes: QuoteRow[];
  valueAtRiskLowCents: number;
  valueAtRiskHighCents: number;
  /** Speed-to-lead and call-list numbers; absent if the sales engine could not load. */
  sales?: {
    toCall: number;
    late: number;
    medianMinutes: number | null;
    withinSla: number | null;
  };
}

export async function buildBriefingData(now = new Date()): Promise<BriefingData> {
  const today = vanDateStr(now);
  const tomorrow = addDaysStr(today, 1);
  const dayAfter = addDaysStr(today, 2);
  const from = zonedInstant(tomorrow, 0);
  const to = zonedInstant(dayAfter, 0);

  const db = getDb();
  const [leads, jobs, unscheduledJobs, pendingQuotes] = await Promise.all([
    listLeads({}, 500),
    listJobsBetween(from, to),
    listUnscheduledJobs(50),
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

  let sales: BriefingData["sales"];
  try {
    const callList = await loadCallList(now);
    sales = {
      toCall: callList.items.length,
      late: callList.lateCount,
      medianMinutes: callList.speed.medianMinutes,
      withinSla: callList.speed.withinSla,
    };
  } catch {
    sales = undefined;
  }

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
    unscheduledJobs,
    tomorrowLabel,
    pendingQuotes,
    valueAtRiskLowCents,
    valueAtRiskHighCents,
    sales,
  };
}

// --- Smart action plan (read-only drafts + a management read) --------------

export type ActionPriority = "high" | "medium" | "low";

export interface ActionPlanItem {
  leadId: number;
  priority: ActionPriority;
  why: string;
  draftSms: string;
}

export type ActionPlan = Map<number, ActionPlanItem>;

export interface ActionPlanResult {
  /** false when the model couldn't be reached or isn't configured. */
  ok: boolean;
  /** The office manager's read of the day, in Persian. "" when unavailable. */
  summary: string;
  plan: ActionPlan;
}

/** The leads that need a human touch, highest-pressure first, capped for one call. */
function attentionLeads(data: BriefingData): LeadRow[] {
  const byId = new Map<number, LeadRow>();
  for (const l of [...data.overdueFollowUps, ...data.newLeads, ...data.awaitingReply]) {
    if (!byId.has(l.id)) byId.set(l.id, l);
  }
  return [...byId.values()].slice(0, 14);
}

/**
 * One Anthropic call that returns a Persian management summary plus, for each
 * attention lead, a priority, a short reason, and a ready-to-copy SMS draft.
 * Best-effort: on any failure it returns ok:false with an empty plan, and the
 * briefing still shows the exact deterministic lists.
 */
export async function generateActionPlan(data: BriefingData): Promise<ActionPlanResult> {
  const plan: ActionPlan = new Map();
  const apiKey = anthropicApiKey();
  const leads = attentionLeads(data);
  if (!apiKey) return { ok: false, summary: "", plan };
  if (leads.length === 0 && data.pendingQuotes.length === 0 && data.unscheduledJobs.length === 0) {
    return { ok: true, summary: "", plan };
  }

  const items = leads.map((l) => ({
    leadId: l.id,
    name: l.name || "there",
    status: l.status,
    daysOld: daysOld(new Date(l.createdAt), data.now),
    followUp: followUpDesc(l.nextFollowUpAt, data.now),
    area: l.area || "",
    source: l.source,
    owner: l.owner,
    hasPhone: Boolean(l.phone.trim()),
    hasEmail: Boolean(l.email.trim()),
    note: (l.message || "").slice(0, 240),
  }));

  const facts = {
    today: vanDateStr(data.now),
    newLeads: data.newLeads.length,
    overdueFollowUps: data.overdueFollowUps.length,
    awaitingReply: data.awaitingReply.length,
    tomorrowJobs: data.tomorrowJobs.length,
    unscheduledJobs: data.unscheduledJobs.length,
    incompleteLeads: data.incompleteLeads.length,
    pendingQuotes: data.pendingQuotes.length,
    valueAtRisk: `${dollars(data.valueAtRiskLowCents)}–${dollars(data.valueAtRiskHighCents)}`,
  };

  const prompt = `You are the office manager for NorthPeak Junk Removal, a small junk-removal business in North Vancouver, BC. You are precise and base everything ONLY on the data given — never invent a name, number, quote, or detail.

Return ONLY a JSON object (no prose, no markdown) with:
- "summary": 2–4 sentences in PERSIAN (Farsi) — a sharp read of what matters most today for the owner: the biggest risk, the money awaiting a reply, and the 1–3 things to do first. Reference the real counts/figures from FACTS. Be specific and calm, not generic.
- "leads": an array; for each lead below one object with:
  - "leadId": the number,
  - "priority": "high" | "medium" | "low" (weigh money at stake, how long it has waited, and how overdue the follow-up is),
  - "why": one short sentence in PERSIAN on why it needs attention now,
  - "draftSms": a friendly, concise SMS in CANADIAN ENGLISH the owner could send this customer (<=320 chars, first name only, sign off "— NorthPeak"; never promise a price; offer a free on-site estimate or to answer questions).

FACTS: ${JSON.stringify(facts)}

LEADS: ${JSON.stringify(items)}`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: visionModel(),
      max_tokens: 2400,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content.find((b): b is Anthropic.TextBlock => b.type === "text")?.text ?? "";
    const json = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return { ok: false, summary: "", plan };
    const obj = parsed as Record<string, unknown>;

    const summary = typeof obj.summary === "string" ? obj.summary.trim() : "";
    const rows = Array.isArray(obj.leads) ? obj.leads : [];
    for (const row of rows) {
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
    return { ok: true, summary, plan };
  } catch {
    return { ok: false, summary: "", plan };
  }
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

function unscheduledJobLine(j: JobRow): string {
  const addr = j.address?.trim() ? j.address : "⚠ no address";
  const firstNote = (j.notes ?? "").split("\n")[0]?.slice(0, 80) ?? "";
  return `• ${addr}${firstNote ? ` · ${firstNote}` : ""}`;
}

export function renderBriefingText(data: BriefingData, result?: ActionPlanResult): string {
  const { now } = data;
  const plan = result?.plan;
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

  if (result?.summary) {
    lines.push(`\n🧭 ${result.summary}`);
  } else if (result && !result.ok) {
    lines.push(`\n🧭 (تحلیل هوش مصنوعی الان در دسترس نبود — لیست‌های زیر دقیق و کامل‌اند.)`);
  }

  if (data.pendingQuotes.length > 0) {
    lines.push(
      `\n💰 ${dollars(data.valueAtRiskLowCents)}–${dollars(data.valueAtRiskHighCents)} in ${data.pendingQuotes.length} quote(s) awaiting a reply.`,
    );
  }

  if (data.sales) {
    const { toCall, late, medianMinutes, withinSla } = data.sales;
    const speed =
      medianMinutes === null
        ? ""
        : ` Median first call ${medianMinutes} business min; ${Math.round((withinSla ?? 0) * 100)}% within ${SLA.firstContactMinutes} min (30 days).`;
    lines.push(
      `
📞 ${toCall} on today's call list${late > 0 ? `, ${late} past their response target` : ""}.${speed} → /admin/calls`,
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
    "📌 Booked but not scheduled",
    data.unscheduledJobs.map((j) => unscheduledJobLine(j)),
    "No unscheduled jobs.",
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

/** Full briefing text for Telegram (deterministic lists + Persian read). */
export async function composeBriefing(now = new Date()): Promise<string> {
  const data = await buildBriefingData(now);
  const result = await generateActionPlan(data);
  return renderBriefingText(data, result);
}
