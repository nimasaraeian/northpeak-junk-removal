import { asc, eq, sql } from "drizzle-orm";
import { getMigratedDb } from "@/lib/db/migrations";
import { users } from "@/lib/db/schema";
import type { UserRow } from "@/lib/db/schema";

/**
 * User reads. Like the billing/finance loaders, every one tolerates a missing
 * database and a database that has not yet run the v8 migration (no `users`
 * table), degrading to an empty value rather than throwing — getMigratedDb
 * self-heals the schema on first use.
 */

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function countUsers(): Promise<number> {
  const db = await getMigratedDb();
  if (!db) return 0;
  return safe(async () => {
    const [row] = await db.select({ c: sql<number>`count(*)`.mapWith(Number) }).from(users);
    return row?.c ?? 0;
  }, 0);
}

export async function listUsers(): Promise<UserRow[]> {
  const db = await getMigratedDb();
  if (!db) return [];
  return safe(() => db.select().from(users).orderBy(asc(users.createdAt)), []);
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const db = await getMigratedDb();
  if (!db) return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  return safe(async () => {
    const [row] = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${trimmed}`)
      .limit(1);
    return row ?? null;
  }, null);
}

export async function getUserById(id: number): Promise<UserRow | null> {
  const db = await getMigratedDb();
  if (!db || !Number.isInteger(id)) return null;
  return safe(async () => {
    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
  }, null);
}
