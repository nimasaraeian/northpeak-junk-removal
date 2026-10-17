import { and, desc, eq, inArray, isNotNull, notInArray, sql } from "drizzle-orm";
import { getMigratedDb } from "@/lib/db/migrations";
import {
  activityLog,
  calls,
  clients,
  jobs,
  leads,
  quotes,
  type CallRow,
  type LeadRow,
} from "@/lib/db/schema";
import {
  BUSINESS_HOURS,
  buildCallList,
  deriveLeadSales,
  slaClock,
  speedToLead,
  type CallItem,
  type CallListClient,
  type CallListLead,
  type LeadSalesState,
  type SlaClock,
  type SpeedStats,
  zoneOffsetMs,
} from "@/lib/admin/sales";

/**
 * Sales-engine reads.
 *
 * Uses `getMigratedDb()` so the call log table is created on first use, and
 * like every other loader returns an empty value when there is no database.
 * The timers and the call list are computed by the pure functions in
 * `sales.ts`; this file only gathers their inputs.
 */

const OPEN_STATUSES = ["new", "contacted", "quoted", "booked"] as const;

/** Calls and status changes for a set of leads, grouped by lead id. */
async function salesStateFor(leadIds: number[]): Promise<Map<number, LeadSalesState>> {
  const out = new Map<number, LeadSalesState>();
  const db = await getMigratedDb();
  if (!db || leadIds.length === 0) return out;

  const [callRows, statusRows] = await Promise.all([
    db
      .select({ leadId: calls.leadId, createdAt: calls.createdAt, outcome: calls.outcome, flags: calls.flags })
      .from(calls)
      .where(inArray(calls.leadId, leadIds)),
    db
      .select({ entityId: activityLog.entityId, createdAt: activityLog.createdAt, body: activityLog.body })
      .from(activityLog)
      .where(
        and(
          eq(activityLog.entityType, "lead"),
          eq(activityLog.kind, "status_change"),
          inArray(activityLog.entityId, leadIds),
        ),
      ),
  ]);

  for (const id of leadIds) {
    out.set(
      id,
      deriveLeadSales(
        callRows.filter((c) => c.leadId === id),
        statusRows.filter((s) => s.entityId === id),
      ),
    );
  }
  return out;
}

/** Highest open quote midpoint per client — the best guess at a lead's worth. */
async function quoteValueByClient(clientIds: number[]): Promise<Map<number, number>> {
  const out = new Map<number, number>();
  const db = await getMigratedDb();
  if (!db || clientIds.length === 0) return out;
  const rows = await db
    .select({ clientId: quotes.clientId, low: quotes.finalLowCents, high: quotes.finalHighCents })
    .from(quotes)
    .where(and(inArray(quotes.clientId, clientIds), notInArray(quotes.status, ["lost"])));
  for (const row of rows) {
    if (row.clientId === null) continue;
    const mid = Math.round((row.low + row.high) / 2);
    out.set(row.clientId, Math.max(out.get(row.clientId) ?? 0, mid));
  }
  return out;
}

export interface CallListData {
  items: CallItem[];
  speed: SpeedStats;
  /** Open leads with a running timer that is already late. */
  lateCount: number;
  callsToday: number;
}

/** Everything the /admin/calls page shows. */
export async function loadCallList(now = new Date()): Promise<CallListData> {
  const empty: CallListData = {
    items: [],
    speed: { contacted: 0, medianMinutes: null, withinSla: null },
    lateCount: 0,
    callsToday: 0,
  };
  const db = await getMigratedDb();
  if (!db) return empty;

  const openLeads = await db
    .select()
    .from(leads)
    .where(inArray(leads.status, [...OPEN_STATUSES]))
    .orderBy(desc(leads.createdAt))
    .limit(400);

  const ids = openLeads.map((l) => l.id);
  const clientIds = openLeads.map((l) => l.clientId).filter((id): id is number => id !== null);
  const [states, values] = await Promise.all([salesStateFor(ids), quoteValueByClient(clientIds)]);

  const listLeads: CallListLead[] = openLeads
    // Booked leads have their job; the call list is about winning work.
    .filter((l) => l.status !== "booked")
    .map((l) => toCallListLead(l, states.get(l.id)!, l.clientId ? values.get(l.clientId) ?? 0 : 0));

  const pastClients = await loadReactivationCandidates();
  const items = buildCallList(listLeads, pastClients, now);

  // Speed-to-lead over the last 30 days of leads, open or closed.
  const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recent = await db
    .select({ id: leads.id, createdAt: leads.createdAt })
    .from(leads)
    .where(sql`${leads.createdAt} >= ${since}`)
    .limit(1000);
  const recentStates = await salesStateFor(recent.map((r) => r.id));
  const speed = speedToLead(
    recent.map((r) => ({ createdAt: r.createdAt, firstContactedAt: recentStates.get(r.id)?.firstContactedAt ?? null })),
  );

  const lateCount = openLeads.filter((l) => slaClock({ ...l, ...states.get(l.id)! }, now)?.state === "late").length;

  const [{ count } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(calls)
    .where(sql`${calls.createdAt} >= ${startOfLocalDay(now)}`);

  return { items, speed, lateCount, callsToday: count };
}

/** Midnight today in the crew's time zone, as a UTC instant. */
function startOfLocalDay(now: Date): Date {
  const offset = zoneOffsetMs(now, BUSINESS_HOURS.timeZone);
  const local = now.getTime() + offset;
  const midnight = local - (local % (24 * 60 * 60 * 1000));
  return new Date(midnight - offset);
}

function toCallListLead(lead: LeadRow, state: LeadSalesState, valueCents: number): CallListLead {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    area: lead.area,
    status: lead.status,
    owner: lead.owner,
    createdAt: lead.createdAt,
    nextFollowUpAt: lead.nextFollowUpAt,
    ...state,
    valueCents,
  };
}

/** Clients with at least one finished job, their last job date and contact. */
async function loadReactivationCandidates(): Promise<CallListClient[]> {
  const db = await getMigratedDb();
  if (!db) return [];

  const jobRows = await db
    .select({
      clientId: jobs.clientId,
      lastJobAt: sql<Date>`max(${jobs.scheduledStart})`,
      jobCount: sql<number>`count(*)::int`,
    })
    .from(jobs)
    .where(and(eq(jobs.status, "done"), isNotNull(jobs.clientId), isNotNull(jobs.scheduledStart)))
    .groupBy(jobs.clientId);

  const ids = jobRows.map((r) => r.clientId).filter((id): id is number => id !== null);
  if (ids.length === 0) return [];

  const [clientRows, contactRows] = await Promise.all([
    db.select().from(clients).where(inArray(clients.id, ids)),
    db
      .select({ clientId: calls.clientId, last: sql<Date>`max(${calls.createdAt})` })
      .from(calls)
      .where(inArray(calls.clientId, ids))
      .groupBy(calls.clientId),
  ]);

  const lastContact = new Map(contactRows.map((r) => [r.clientId, r.last ? new Date(r.last) : null]));
  return jobRows.flatMap((row) => {
    const client = clientRows.find((c) => c.id === row.clientId);
    if (!client || !row.lastJobAt) return [];
    return [
      {
        id: client.id,
        name: client.name,
        phone: client.phone,
        area: client.area,
        lastJobAt: new Date(row.lastJobAt),
        jobCount: row.jobCount,
        lifetimeValueCents: client.lifetimeValueCents,
        lastContactAt: lastContact.get(client.id) ?? null,
      },
    ];
  });
}

export interface LeadSalesView {
  state: LeadSalesState;
  clock: SlaClock | null;
  calls: CallRow[];
}

/** The lead page's timer chip and call history. */
export async function loadLeadSales(lead: LeadRow, now = new Date()): Promise<LeadSalesView> {
  const db = await getMigratedDb();
  const states = await salesStateFor([lead.id]);
  const state = states.get(lead.id) ?? deriveLeadSales([], []);
  const history = db
    ? await db.select().from(calls).where(eq(calls.leadId, lead.id)).orderBy(desc(calls.createdAt)).limit(50)
    : [];
  return { state, clock: slaClock({ ...lead, ...state }, now), calls: history };
}

/** Late first-contact count, for the dashboard and the daily briefing. */
export async function countLateLeads(now = new Date()): Promise<number> {
  const db = await getMigratedDb();
  if (!db) return 0;
  const open = await db
    .select()
    .from(leads)
    .where(inArray(leads.status, [...OPEN_STATUSES]))
    .limit(400);
  const states = await salesStateFor(open.map((l) => l.id));
  return open.filter((l) => slaClock({ ...l, ...states.get(l.id)! }, now)?.state === "late").length;
}
