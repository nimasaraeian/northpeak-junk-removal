import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { invoices, payments, quotes, settings } from "@/lib/db/schema";
import type { InvoiceRow, InvoiceStatus, PaymentRow } from "@/lib/db/schema";
import { DEFAULT_BILLING_SETTINGS, type BillingSettings } from "@/content/billing";

/**
 * Billing reads.
 *
 * Like the CRM loaders, every one tolerates a missing database by returning an
 * empty value. On top of that, each query is wrapped so that a database which
 * has not yet run the v5 migration (no `invoices` table) degrades to an empty
 * state instead of throwing a 500 — the panel must never be un-enterable
 * because a migration is pending.
 */

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function loadBillingSettings(): Promise<BillingSettings> {
  const db = getDb();
  if (!db) return DEFAULT_BILLING_SETTINGS;

  return safe(async () => {
    const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    if (!row?.billing) return DEFAULT_BILLING_SETTINGS;
    return { ...DEFAULT_BILLING_SETTINGS, ...row.billing };
  }, DEFAULT_BILLING_SETTINGS);
}

export interface InvoiceFilters {
  status?: InvoiceStatus | "all";
  search?: string;
}

export async function listInvoices(
  filters: InvoiceFilters = {},
  limit = 200,
): Promise<InvoiceRow[]> {
  const db = getDb();
  if (!db) return [];

  return safe(async () => {
    const conditions = [];
    if (filters.status && filters.status !== "all") {
      conditions.push(eq(invoices.status, filters.status));
    }
    const search = filters.search?.trim();
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        or(
          ilike(invoices.customerName, pattern),
          ilike(invoices.customerPhone, pattern),
          ilike(invoices.number, pattern),
        ),
      );
    }
    const query = db.select().from(invoices);
    const filtered = conditions.length > 0 ? query.where(and(...conditions)) : query;
    return filtered.orderBy(desc(invoices.createdAt)).limit(limit);
  }, []);
}

/** Paid-to-date per invoice, one grouped query rather than N. */
export async function paidTotalsFor(invoiceIds: number[]): Promise<Map<number, number>> {
  const totals = new Map<number, number>();
  const db = getDb();
  if (!db || invoiceIds.length === 0) return totals;

  return safe(async () => {
    const rows = await db
      .select({
        invoiceId: payments.invoiceId,
        paid: sql<number>`coalesce(sum(${payments.amountCents}), 0)`.mapWith(Number),
      })
      .from(payments)
      .where(inArray(payments.invoiceId, invoiceIds))
      .groupBy(payments.invoiceId);
    for (const row of rows) totals.set(row.invoiceId, row.paid);
    return totals;
  }, totals);
}

export async function getInvoice(id: number): Promise<InvoiceRow | null> {
  const db = getDb();
  if (!db || !Number.isInteger(id)) return null;
  return safe(async () => {
    const [row] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    return row ?? null;
  }, null);
}

export async function listPaymentsFor(invoiceId: number): Promise<PaymentRow[]> {
  const db = getDb();
  if (!db || !Number.isInteger(invoiceId)) return [];
  return safe(
    () =>
      db
        .select()
        .from(payments)
        .where(eq(payments.invoiceId, invoiceId))
        .orderBy(desc(payments.receivedAt)),
    [],
  );
}

export interface BillingStats {
  outstandingCents: number;
  paidThisMonthCents: number;
  draftCount: number;
  openCount: number;
}

/**
 * Billing summary cards.
 *
 * Outstanding = total − paid across every non-void, non-draft invoice.
 * Paid this month = payments received since the 1st (UTC, matching the quote
 * dashboard's month boundary).
 */
export async function loadBillingStats(now = new Date()): Promise<BillingStats> {
  const empty: BillingStats = {
    outstandingCents: 0,
    paidThisMonthCents: 0,
    draftCount: 0,
    openCount: 0,
  };
  const db = getDb();
  if (!db) return empty;

  return safe(async () => {
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [invoiceAgg] = await db
      .select({
        billed: sql<number>`coalesce(sum(${invoices.totalCents}) filter (where ${invoices.status} in ('sent', 'paid')), 0)`.mapWith(
          Number,
        ),
        drafts: sql<number>`count(*) filter (where ${invoices.status} = 'draft')`.mapWith(Number),
        open: sql<number>`count(*) filter (where ${invoices.status} = 'sent')`.mapWith(Number),
      })
      .from(invoices);

    const [paidAgg] = await db
      .select({
        paidAll: sql<number>`coalesce(sum(${payments.amountCents}), 0)`.mapWith(Number),
        paidMonth: sql<number>`coalesce(sum(${payments.amountCents}) filter (where ${payments.receivedAt} >= ${monthStart}), 0)`.mapWith(
          Number,
        ),
      })
      .from(payments);

    // Outstanding only counts payments against sent/paid invoices; a payment on
    // a since-voided invoice would otherwise make this negative. Good enough for
    // a two-person shop — the per-invoice balance is always exact.
    const outstanding = Math.max(0, (invoiceAgg?.billed ?? 0) - (paidAgg?.paidAll ?? 0));

    return {
      outstandingCents: outstanding,
      paidThisMonthCents: paidAgg?.paidMonth ?? 0,
      draftCount: invoiceAgg?.drafts ?? 0,
      openCount: invoiceAgg?.open ?? 0,
    };
  }, empty);
}

/** Won quotes with no invoice yet — the "raise an invoice" picker on /billing/new. */
export async function listInvoiceableQuotes(limit = 100): Promise<
  { id: number; customerName: string; customerArea: string; finalLowCents: number; finalHighCents: number }[]
> {
  const db = getDb();
  if (!db) return [];
  return safe(async () => {
    const existing = await db
      .select({ quoteId: invoices.quoteId })
      .from(invoices)
      .where(sql`${invoices.quoteId} is not null`);
    const used = new Set(existing.map((row) => row.quoteId));
    const rows = await db
      .select({
        id: quotes.id,
        customerName: quotes.customerName,
        customerArea: quotes.customerArea,
        finalLowCents: quotes.finalLowCents,
        finalHighCents: quotes.finalHighCents,
      })
      .from(quotes)
      .where(eq(quotes.status, "won"))
      .orderBy(desc(quotes.createdAt))
      .limit(limit);
    return rows.filter((row) => !used.has(row.id));
  }, []);
}
