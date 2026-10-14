"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireOperator } from "@/lib/admin/auth";
import { getDb } from "@/lib/db/client";
import { EXPENSE_CATEGORIES, expenses, timeEntries } from "@/lib/db/schema";

/**
 * Payroll & accounting mutations. Every action re-checks the session, matching
 * the other admin action modules and the security test.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const DB_UNREACHABLE = "The database is not reachable.";

function revalidateFinance(): void {
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
}

function dollarsToCents(value: number): number {
  return Math.round(value * 100);
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const timeEntrySchema = z.object({
  person: z.string().trim().min(1).max(80),
  jobId: z.coerce.number().int().positive().nullable().default(null),
  workDate: z.string().trim().min(1).max(32),
  hours: z.coerce.number().positive().max(24),
  rateDollars: z.coerce.number().min(0).max(10000),
  note: z.string().trim().max(500).default(""),
});

export async function addTimeEntryAction(raw: unknown): Promise<ActionResult> {
  const operator = await requireOperator();

  const parsed = timeEntrySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That entry did not validate." };
  }

  const workDate = parseDate(parsed.data.workDate);
  if (!workDate) return { ok: false, error: "That work date is not valid." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  await db.insert(timeEntries).values({
    person: parsed.data.person,
    jobId: parsed.data.jobId,
    workDate,
    hours: parsed.data.hours,
    rateCents: dollarsToCents(parsed.data.rateDollars),
    note: parsed.data.note,
    createdBy: operator,
  });

  revalidateFinance();
  return { ok: true };
}

export async function deleteTimeEntryAction(entryId: number): Promise<ActionResult> {
  await requireOperator();
  if (!Number.isInteger(entryId)) return { ok: false, error: "Unknown entry." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  await db.delete(timeEntries).where(eq(timeEntries.id, entryId));
  revalidateFinance();
  return { ok: true };
}

const expenseSchema = z.object({
  expenseDate: z.string().trim().min(1).max(32),
  category: z.enum(EXPENSE_CATEGORIES),
  amountDollars: z.coerce.number().positive().max(1_000_000),
  vendor: z.string().trim().max(160).default(""),
  jobId: z.coerce.number().int().positive().nullable().default(null),
  note: z.string().trim().max(500).default(""),
});

export async function addExpenseAction(raw: unknown): Promise<ActionResult> {
  const operator = await requireOperator();

  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That expense did not validate." };
  }

  const expenseDate = parseDate(parsed.data.expenseDate);
  if (!expenseDate) return { ok: false, error: "That expense date is not valid." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  await db.insert(expenses).values({
    expenseDate,
    category: parsed.data.category,
    amountCents: dollarsToCents(parsed.data.amountDollars),
    vendor: parsed.data.vendor,
    jobId: parsed.data.jobId,
    note: parsed.data.note,
    createdBy: operator,
  });

  revalidateFinance();
  return { ok: true };
}

export async function deleteExpenseAction(expenseId: number): Promise<ActionResult> {
  await requireOperator();
  if (!Number.isInteger(expenseId)) return { ok: false, error: "Unknown expense." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  await db.delete(expenses).where(eq(expenses.id, expenseId));
  revalidateFinance();
  return { ok: true };
}
