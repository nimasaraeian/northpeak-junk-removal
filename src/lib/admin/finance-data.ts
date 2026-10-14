import { and, desc, gte, lt, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { expenses, invoices, payments, timeEntries } from "@/lib/db/schema";
import type { ExpenseCategory, ExpenseRow, TimeEntryRow } from "@/lib/db/schema";
import { profitAndLoss, type ProfitAndLoss } from "@/lib/admin/finance";

/**
 * Payroll & accounting reads. Every query tolerates both a missing database
 * and a database that has not yet run the v6 migration (no `time_entries` /
 * `expenses` tables), degrading to empty rather than throwing.
 */

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

/** Month-to-date in UTC, matching the quote and billing dashboards. */
export function defaultFinancePeriod(now = new Date()): { from: Date; to: Date } {
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { from, to };
}

export async function listTimeEntries(from: Date, to: Date, limit = 500): Promise<TimeEntryRow[]> {
  const db = getDb();
  if (!db) return [];
  return safe(
    () =>
      db
        .select()
        .from(timeEntries)
        .where(and(gte(timeEntries.workDate, from), lt(timeEntries.workDate, to)))
        .orderBy(desc(timeEntries.workDate))
        .limit(limit),
    [],
  );
}

export async function listExpenses(from: Date, to: Date, limit = 500): Promise<ExpenseRow[]> {
  const db = getDb();
  if (!db) return [];
  return safe(
    () =>
      db
        .select()
        .from(expenses)
        .where(and(gte(expenses.expenseDate, from), lt(expenses.expenseDate, to)))
        .orderBy(desc(expenses.expenseDate))
        .limit(limit),
    [],
  );
}

export interface FinanceSummary extends ProfitAndLoss {
  expensesByCategory: { category: ExpenseCategory; amountCents: number }[];
}

/**
 * The P&L for a period, cash-basis:
 *   revenue   = payments received in the window
 *   GST       = GST on invoices issued (sent/paid) in the window — pass-through
 *   labour    = time entries × rate in the window
 *   expenses  = expense ledger in the window
 *   net       = revenue − labour − expenses
 */
export async function loadFinanceSummary(from: Date, to: Date): Promise<FinanceSummary> {
  const empty: FinanceSummary = {
    revenueCents: 0,
    gstCollectedCents: 0,
    labourCents: 0,
    expensesCents: 0,
    netProfitCents: 0,
    expensesByCategory: [],
  };
  const db = getDb();
  if (!db) return empty;

  return safe(async () => {
    const [revenueAgg] = await db
      .select({
        revenue: sql<number>`coalesce(sum(${payments.amountCents}), 0)`.mapWith(Number),
      })
      .from(payments)
      .where(and(gte(payments.receivedAt, from), lt(payments.receivedAt, to)));

    const [gstAgg] = await db
      .select({
        gst: sql<number>`coalesce(sum(${invoices.gstCents}) filter (where ${invoices.status} in ('sent', 'paid')), 0)`.mapWith(
          Number,
        ),
      })
      .from(invoices)
      .where(and(gte(invoices.issuedAt, from), lt(invoices.issuedAt, to)));

    const [labourAgg] = await db
      .select({
        labour: sql<number>`coalesce(sum(round(${timeEntries.hours} * ${timeEntries.rateCents})), 0)`.mapWith(
          Number,
        ),
      })
      .from(timeEntries)
      .where(and(gte(timeEntries.workDate, from), lt(timeEntries.workDate, to)));

    const byCategory = await db
      .select({
        category: expenses.category,
        amount: sql<number>`coalesce(sum(${expenses.amountCents}), 0)`.mapWith(Number),
      })
      .from(expenses)
      .where(and(gte(expenses.expenseDate, from), lt(expenses.expenseDate, to)))
      .groupBy(expenses.category);

    const expensesCents = byCategory.reduce((sum, row) => sum + row.amount, 0);
    const pl = profitAndLoss({
      revenueCents: revenueAgg?.revenue ?? 0,
      gstCollectedCents: gstAgg?.gst ?? 0,
      labourCents: labourAgg?.labour ?? 0,
      expensesCents,
    });

    return {
      ...pl,
      expensesByCategory: byCategory
        .map((row) => ({ category: row.category as ExpenseCategory, amountCents: row.amount }))
        .sort((a, b) => b.amountCents - a.amountCents),
    };
  }, empty);
}
