import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/db/schema";

/**
 * Lazy Neon connection.
 *
 * `DATABASE_URL` is deliberately not required at import time: a missing URL
 * has to surface as the `/admin` setup screen, not as a crash during the
 * build or on the first request. Everything that touches the database goes
 * through `getDb()` and handles `null`.
 */
export type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | null = null;

export function databaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();
  return url ? url : undefined;
}

export function isDatabaseConfigured(): boolean {
  return databaseUrl() !== undefined;
}

export function getDb(): Db | null {
  const url = databaseUrl();
  if (!url) return null;
  if (!cached) {
    cached = drizzle(neon(url), { schema });
  }
  return cached;
}

/** For call sites that have already checked `isDatabaseConfigured()`. */
export function requireDb(): Db {
  const db = getDb();
  if (!db) {
    throw new Error("DATABASE_URL is not set — NorthPeak Ops cannot reach the database.");
  }
  return db;
}
