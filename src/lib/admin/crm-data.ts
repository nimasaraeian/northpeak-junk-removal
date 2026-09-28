import { and, desc, eq, gte, ilike, inArray, isNull, lt, lte, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  activityLog,
  clients,
  jobs,
  leads,
  quotes,
  type ActivityEntity,
  type ActivityRow,
  type ClientRow,
  type JobRow,
  type LeadOwner,
  type LeadRow,
  type LeadSource,
  type LeadStatus,
  type QuoteRow,
} from "@/lib/db/schema";
import { lifetimeValueCents, PIPELINE_ORDER } from "@/lib/admin/crm";

/**
 * CRM reads.
 *
 * Like the v1 loaders, every one of these tolerates a missing database by
 * returning an empty value — `/admin` renders a setup screen in that state,
 * and these must not be the thing that throws first.
 */

export interface LeadFilters {
  owner?: LeadOwner | "all";
  source?: LeadSource | "all";
  status?: LeadStatus | "all";
  search?: string;
}

export async function listLeads(filters: LeadFilters = {}, limit = 500): Promise<LeadRow[]> {
  const db = getDb();
  if (!db) return [];

  const conditions = [];
  if (filters.owner && filters.owner !== "all") conditions.push(eq(leads.owner, filters.owner));
  if (filters.source && filters.source !== "all") conditions.push(eq(leads.source, filters.source));
  if (filters.status && filters.status !== "all") conditions.push(eq(leads.status, filters.status));

  const search = filters.search?.trim();
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(or(ilike(leads.name, pattern), ilike(leads.phone, pattern)));
  }

  const query = db.select().from(leads);
  const filtered = conditions.length > 0 ? query.where(and(...conditions)) : query;

  return filtered.orderBy(desc(leads.createdAt)).limit(limit);
}

/** Leads bucketed into board columns, in pipeline order. */
export function groupLeadsByStatus(rows: LeadRow[]): Record<LeadStatus, LeadRow[]> {
  const grouped = Object.fromEntries(
    PIPELINE_ORDER.map((status) => [status, [] as LeadRow[]]),
  ) as Record<LeadStatus, LeadRow[]>;

  for (const row of rows) {
    (grouped[row.status] ?? grouped.new).push(row);
  }
  return grouped;
}

export async function getLead(id: number): Promise<LeadRow | null> {
  const db = getDb();
  if (!db || !Number.isInteger(id)) return null;
  const [row] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return row ?? null;
}

export async function listClients(search = "", limit = 200): Promise<ClientRow[]> {
  const db = getDb();
  if (!db) return [];

  const trimmed = search.trim();
  const query = db.select().from(clients);
  const filtered = trimmed
    ? query.where(
        or(
          ilike(clients.name, `%${trimmed}%`),
          ilike(clients.phone, `%${trimmed}%`),
          ilike(clients.area, `%${trimmed}%`),
        ),
      )
    : query;

  return filtered.orderBy(desc(clients.createdAt)).limit(limit);
}

export async function getClient(id: number): Promise<ClientRow | null> {
  const db = getDb();
  if (!db || !Number.isInteger(id)) return null;
  const [row] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return row ?? null;
}

/** Job counts and last activity for the clients table, in one query each. */
export async function clientRollups(
  clientIds: number[],
): Promise<Map<number, { jobCount: number; lastActivityAt: Date | null }>> {
  const rollups = new Map<number, { jobCount: number; lastActivityAt: Date | null }>();
  const db = getDb();
  if (!db || clientIds.length === 0) return rollups;

  const jobCounts = await db
    .select({ clientId: jobs.clientId, count: sql<number>`count(*)`.mapWith(Number) })
    .from(jobs)
    .where(inArray(jobs.clientId, clientIds))
    .groupBy(jobs.clientId);

  const lastActivity = await db
    .select({
      entityId: activityLog.entityId,
      last: sql<Date>`max(${activityLog.createdAt})`,
    })
    .from(activityLog)
    .where(and(eq(activityLog.entityType, "client"), inArray(activityLog.entityId, clientIds)))
    .groupBy(activityLog.entityId);

  for (const id of clientIds) rollups.set(id, { jobCount: 0, lastActivityAt: null });
  for (const row of jobCounts) {
    if (row.clientId !== null) {
      rollups.set(row.clientId, {
        jobCount: row.count,
        lastActivityAt: rollups.get(row.clientId)?.lastActivityAt ?? null,
      });
    }
  }
  for (const row of lastActivity) {
    const current = rollups.get(row.entityId);
    if (current) current.lastActivityAt = row.last ? new Date(row.last) : null;
  }

  return rollups;
}

export interface ClientDossier {
  client: ClientRow;
  leads: LeadRow[];
  quotes: QuoteRow[];
  jobs: JobRow[];
  activity: ActivityRow[];
  lifetimeValueCents: number;
}

export async function getClientDossier(id: number): Promise<ClientDossier | null> {
  const db = getDb();
  if (!db) return null;

  const client = await getClient(id);
  if (!client) return null;

  const [clientLeads, clientQuotes, clientJobs, activity] = await Promise.all([
    db.select().from(leads).where(eq(leads.clientId, id)).orderBy(desc(leads.createdAt)),
    db.select().from(quotes).where(eq(quotes.clientId, id)).orderBy(desc(quotes.createdAt)),
    db.select().from(jobs).where(eq(jobs.clientId, id)).orderBy(desc(jobs.createdAt)),
    listActivity("client", id),
  ]);

  return {
    client,
    leads: clientLeads,
    quotes: clientQuotes,
    jobs: clientJobs,
    activity,
    lifetimeValueCents: lifetimeValueCents(clientQuotes),
  };
}

export async function listActivity(
  entityType: ActivityEntity,
  entityId: number,
  limit = 100,
): Promise<ActivityRow[]> {
  const db = getDb();
  if (!db || !Number.isInteger(entityId)) return [];

  return db
    .select()
    .from(activityLog)
    .where(and(eq(activityLog.entityType, entityType), eq(activityLog.entityId, entityId)))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}

export async function listJobsBetween(from: Date, to: Date): Promise<JobRow[]> {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(jobs)
    .where(and(gte(jobs.scheduledStart, from), lt(jobs.scheduledStart, to)))
    .orderBy(jobs.scheduledStart);
}

/** The calendar's side rail: booked work with no date on it yet. */
export async function listUnscheduledJobs(limit = 50): Promise<JobRow[]> {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(jobs)
    .where(and(isNull(jobs.scheduledStart), sql`${jobs.status} <> 'cancelled'`))
    .orderBy(desc(jobs.createdAt))
    .limit(limit);
}

export async function getJob(id: number): Promise<JobRow | null> {
  const db = getDb();
  if (!db || !Number.isInteger(id)) return null;
  const [row] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return row ?? null;
}

/** Name lookup for calendar blocks and job cards, without N queries. */
export async function clientNamesFor(ids: number[]): Promise<Map<number, string>> {
  const names = new Map<number, string>();
  const db = getDb();
  const unique = [...new Set(ids)];
  if (!db || unique.length === 0) return names;

  const rows = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(inArray(clients.id, unique));

  for (const row of rows) names.set(row.id, row.name);
  return names;
}

// --- Dashboard -------------------------------------------------------------

export interface CrmDashboardStats {
  leadsByStage: Record<LeadStatus, number>;
  openLeads: number;
  jobsToday: number;
  overdueFollowUps: number;
}

export async function loadCrmDashboardStats(now = new Date()): Promise<CrmDashboardStats> {
  const empty = Object.fromEntries(PIPELINE_ORDER.map((s) => [s, 0])) as Record<
    LeadStatus,
    number
  >;

  const db = getDb();
  if (!db) {
    return { leadsByStage: empty, openLeads: 0, jobsToday: 0, overdueFollowUps: 0 };
  }

  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [stages, today, overdue] = await Promise.all([
    db.select({ status: leads.status, count: sql<number>`count(*)`.mapWith(Number) })
      .from(leads)
      .groupBy(leads.status),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(jobs)
      .where(
        and(
          gte(jobs.scheduledStart, dayStart),
          lt(jobs.scheduledStart, dayEnd),
          sql`${jobs.status} <> 'cancelled'`,
        ),
      ),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(leads)
      .where(
        and(
          lte(leads.nextFollowUpAt, now),
          sql`${leads.status} not in ('won', 'lost')`,
        ),
      ),
  ]);

  const leadsByStage = { ...empty };
  for (const row of stages) {
    if (row.status in leadsByStage) leadsByStage[row.status] = row.count;
  }

  // "Open" is everything still in play — the funnel's working set.
  const openLeads =
    leadsByStage.new + leadsByStage.contacted + leadsByStage.quoted + leadsByStage.booked;

  return {
    leadsByStage,
    openLeads,
    jobsToday: today[0]?.count ?? 0,
    overdueFollowUps: overdue[0]?.count ?? 0,
  };
}

/** For the quote screen's "link to client / lead" selectors. */
export async function listLinkTargets(): Promise<{
  clients: Pick<ClientRow, "id" | "name" | "area">[];
  leads: Pick<LeadRow, "id" | "name" | "area" | "status">[];
}> {
  const db = getDb();
  if (!db) return { clients: [], leads: [] };

  const [clientRows, leadRows] = await Promise.all([
    db
      .select({ id: clients.id, name: clients.name, area: clients.area })
      .from(clients)
      .orderBy(clients.name)
      .limit(500),
    db
      .select({ id: leads.id, name: leads.name, area: leads.area, status: leads.status })
      .from(leads)
      .where(sql`${leads.status} not in ('won', 'lost')`)
      .orderBy(desc(leads.createdAt))
      .limit(200),
  ]);

  return { clients: clientRows, leads: leadRows };
}
