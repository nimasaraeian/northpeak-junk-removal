import type { TimeEntryRow } from "@/lib/db/schema";

/**
 * Pure payroll & accounting logic — no database, no React. The Finance screen
 * and its tests both import from here.
 */

// Labels live in the dependency-light constants module; re-exported here.
export { EXPENSE_CATEGORY_LABELS } from "@/lib/admin/finance-constants";

/** Pay for one time entry: hours × hourly rate, to the nearest cent. */
export function payForEntryCents(hours: number, rateCents: number): number {
  return Math.round(hours * rateCents);
}

export interface PersonPay {
  person: string;
  hours: number;
  payCents: number;
}

/** Rolls a flat list of time entries up per person, for the payroll table. */
export function summarizePayByPerson(entries: TimeEntryRow[]): PersonPay[] {
  const byPerson = new Map<string, PersonPay>();
  for (const entry of entries) {
    const current = byPerson.get(entry.person) ?? {
      person: entry.person,
      hours: 0,
      payCents: 0,
    };
    current.hours += entry.hours;
    current.payCents += payForEntryCents(entry.hours, entry.rateCents);
    byPerson.set(entry.person, current);
  }
  return [...byPerson.values()].sort((a, b) => b.payCents - a.payCents);
}

export function totalPayCents(rows: PersonPay[]): number {
  return rows.reduce((sum, row) => sum + row.payCents, 0);
}

export interface ProfitAndLoss {
  revenueCents: number;
  gstCollectedCents: number;
  labourCents: number;
  expensesCents: number;
  /** Revenue − labour − expenses. GST is pass-through, so it is excluded. */
  netProfitCents: number;
}

export function profitAndLoss(input: {
  revenueCents: number;
  gstCollectedCents: number;
  labourCents: number;
  expensesCents: number;
}): ProfitAndLoss {
  const netProfitCents = input.revenueCents - input.labourCents - input.expensesCents;
  return {
    revenueCents: input.revenueCents,
    gstCollectedCents: input.gstCollectedCents,
    labourCents: input.labourCents,
    expensesCents: input.expensesCents,
    netProfitCents,
  };
}
