import { sql } from "drizzle-orm";
import { getDb, type Db } from "@/lib/db/client";

/**
 * In-app migration runner.
 *
 * The owner has no direct Neon access in the normal flow, so rather than make
 * someone paste SQL into the Neon console, the operator-gated
 * `applyPendingMigrationsAction` runs these statements with the app's own
 * connection. Every statement is idempotent (`IF NOT EXISTS` / `ADD COLUMN IF
 * NOT EXISTS`), so pressing the button twice is harmless and running it on an
 * already-migrated database is a no-op.
 *
 * Keep this in sync with the `drizzle/*.sql` files — these are the same
 * statements, split one-per-entry so the neon-http driver (one statement per
 * round-trip) can run them.
 */

const BILLING_V5: string[] = [
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "billing" jsonb`,
  `CREATE TABLE IF NOT EXISTS "invoices" (
    "id" serial PRIMARY KEY NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "number" text DEFAULT '' NOT NULL,
    "client_id" integer REFERENCES "clients"("id") ON DELETE SET NULL,
    "job_id" integer REFERENCES "jobs"("id") ON DELETE SET NULL,
    "quote_id" integer REFERENCES "quotes"("id") ON DELETE SET NULL,
    "customer_name" text DEFAULT '' NOT NULL,
    "customer_email" text DEFAULT '' NOT NULL,
    "customer_phone" text DEFAULT '' NOT NULL,
    "customer_address" text DEFAULT '' NOT NULL,
    "line_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "subtotal_cents" integer DEFAULT 0 NOT NULL,
    "gst_cents" integer DEFAULT 0 NOT NULL,
    "pst_cents" integer DEFAULT 0 NOT NULL,
    "total_cents" integer DEFAULT 0 NOT NULL,
    "deposit_cents" integer DEFAULT 0 NOT NULL,
    "status" text DEFAULT 'draft' NOT NULL,
    "issued_at" timestamptz,
    "due_at" timestamptz,
    "notes" text DEFAULT '' NOT NULL,
    "created_by" text NOT NULL,
    CONSTRAINT "invoices_status_known" CHECK ("status" IN ('draft', 'sent', 'paid', 'void'))
  )`,
  `CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices" ("status")`,
  `CREATE INDEX IF NOT EXISTS "invoices_created_at_idx" ON "invoices" ("created_at")`,
  `CREATE INDEX IF NOT EXISTS "invoices_client_id_idx" ON "invoices" ("client_id")`,
  `CREATE TABLE IF NOT EXISTS "payments" (
    "id" serial PRIMARY KEY NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "invoice_id" integer NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
    "amount_cents" integer NOT NULL,
    "method" text DEFAULT 'cash' NOT NULL,
    "received_at" timestamptz DEFAULT now() NOT NULL,
    "received_by" text NOT NULL,
    "note" text DEFAULT '' NOT NULL,
    CONSTRAINT "payments_method_known" CHECK ("method" IN ('cash', 'etransfer', 'card', 'cheque', 'other'))
  )`,
  `CREATE INDEX IF NOT EXISTS "payments_invoice_id_idx" ON "payments" ("invoice_id")`,
  `CREATE INDEX IF NOT EXISTS "payments_received_at_idx" ON "payments" ("received_at")`,
];

const PAYROLL_V6: string[] = [
  `CREATE TABLE IF NOT EXISTS "time_entries" (
    "id" serial PRIMARY KEY NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "person" text NOT NULL,
    "job_id" integer REFERENCES "jobs"("id") ON DELETE SET NULL,
    "work_date" timestamptz NOT NULL,
    "hours" real NOT NULL,
    "rate_cents" integer NOT NULL,
    "note" text DEFAULT '' NOT NULL,
    "created_by" text NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "time_entries_work_date_idx" ON "time_entries" ("work_date")`,
  `CREATE INDEX IF NOT EXISTS "time_entries_person_idx" ON "time_entries" ("person")`,
  `CREATE TABLE IF NOT EXISTS "expenses" (
    "id" serial PRIMARY KEY NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "expense_date" timestamptz NOT NULL,
    "category" text DEFAULT 'other' NOT NULL,
    "amount_cents" integer NOT NULL,
    "vendor" text DEFAULT '' NOT NULL,
    "job_id" integer REFERENCES "jobs"("id") ON DELETE SET NULL,
    "note" text DEFAULT '' NOT NULL,
    "created_by" text NOT NULL,
    CONSTRAINT "expenses_category_known" CHECK ("category" IN ('dump_fee', 'fuel', 'supplies', 'wages', 'maintenance', 'marketing', 'insurance', 'other'))
  )`,
  `CREATE INDEX IF NOT EXISTS "expenses_expense_date_idx" ON "expenses" ("expense_date")`,
  `CREATE INDEX IF NOT EXISTS "expenses_category_idx" ON "expenses" ("category")`,
];

const SALES_V7: string[] = [
  `CREATE TABLE IF NOT EXISTS "calls" (
    "id" serial PRIMARY KEY NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "lead_id" integer REFERENCES "leads"("id") ON DELETE CASCADE,
    "client_id" integer REFERENCES "clients"("id") ON DELETE SET NULL,
    "actor" text NOT NULL,
    "direction" text DEFAULT 'outbound' NOT NULL,
    "outcome" text NOT NULL,
    "notes" text DEFAULT '' NOT NULL,
    "flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "next_follow_up_at" timestamptz,
    CONSTRAINT "calls_direction_known" CHECK ("direction" IN ('outbound', 'inbound')),
    CONSTRAINT "calls_outcome_known" CHECK ("outcome" IN ('booked', 'quote_sent', 'interested', 'thinking', 'call_back', 'no_answer', 'voicemail', 'not_interested', 'wrong_number'))
  )`,
  `CREATE INDEX IF NOT EXISTS "calls_lead_id_idx" ON "calls" ("lead_id", "created_at")`,
  `CREATE INDEX IF NOT EXISTS "calls_client_id_idx" ON "calls" ("client_id", "created_at")`,
  `CREATE INDEX IF NOT EXISTS "calls_created_at_idx" ON "calls" ("created_at")`,
];

const USERS_V8: string[] = [
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "email" text NOT NULL,
    "name" text NOT NULL,
    "role" text DEFAULT 'sales' NOT NULL,
    "password_hash" text,
    "status" text DEFAULT 'active' NOT NULL,
    "invite_token" text,
    "invite_expires_at" timestamptz,
    "invited_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
    "last_login_at" timestamptz,
    CONSTRAINT "users_role_known" CHECK ("role" IN ('owner', 'manager', 'sales', 'crew')),
    CONSTRAINT "users_status_known" CHECK ("status" IN ('active', 'invited', 'disabled'))
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" (lower("email"))`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_invite_token_unique" ON "users" ("invite_token") WHERE "invite_token" IS NOT NULL`,
];

const PROFILE_V9: string[] = [
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile" jsonb`,
];

const MIGRATIONS: { name: string; statements: string[] }[] = [
  { name: "0004_billing", statements: BILLING_V5 },
  { name: "0005_payroll", statements: PAYROLL_V6 },
  { name: "0006_sales_engine", statements: SALES_V7 },
  { name: "0007_users", statements: USERS_V8 },
  { name: "0008_user_profile", statements: PROFILE_V9 },
];

export interface MigrationResult {
  ok: boolean;
  ran: string[];
  error?: string;
}

/** Runs every pending migration statement in order. Idempotent. */
export async function applyMigrations(db: Db): Promise<MigrationResult> {
  const ran: string[] = [];
  try {
    for (const migration of MIGRATIONS) {
      for (const statement of migration.statements) {
        await db.execute(sql.raw(statement));
      }
      ran.push(migration.name);
    }
    return { ok: true, ran };
  } catch (error) {
    return {
      ok: false,
      ran,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Self-healing schema.
 *
 * The billing/payroll features depend on tables and a column the migration
 * creates. Rather than require someone to run SQL first (and crash every path
 * that touches the new schema until they do), this runs the idempotent
 * migrations lazily, once per process, the first time any billing/finance code
 * reaches the database. On success it is cached; on failure it is cleared so a
 * later request can retry.
 */
let schemaReady: Promise<void> | null = null;

/** True when the billing/payroll/sales tables already exist — a single cheap query. */
async function schemaAlreadyApplied(db: Db): Promise<boolean> {
  try {
    const result = await db.execute(
      sql`select
        to_regclass('public.invoices') as inv,
        to_regclass('public.payments') as pay,
        to_regclass('public.time_entries') as te,
        to_regclass('public.expenses') as ex,
        to_regclass('public.calls') as calls,
        to_regclass('public.users') as users,
        (select count(*) from information_schema.columns
           where table_name = 'users' and column_name = 'profile') as user_profile`,
    );
    const rows = (result as { rows?: Record<string, unknown>[] }).rows ?? [];
    const row = rows[0];
    // Tables must exist AND the latest additive column must be present — a
    // column added to an existing table is not caught by to_regclass alone.
    return Boolean(
      row &&
        row.inv &&
        row.pay &&
        row.te &&
        row.ex &&
        row.calls &&
        row.users &&
        Number(row.user_profile) > 0,
    );
  } catch {
    return false;
  }
}

export function ensureSchema(db: Db): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      // Fast path: if everything already exists (the normal case after the
      // first run ever), skip the DDL entirely — one cheap query per cold
      // start instead of a dozen CREATE/ALTER round-trips.
      if (await schemaAlreadyApplied(db)) return;
      const result = await applyMigrations(db);
      if (!result.ok) schemaReady = null;
    })();
  }
  return schemaReady;
}

/**
 * `getDb()` plus a guarantee the billing/payroll schema exists. Billing and
 * finance code uses this instead of `getDb()` so it works on a database that
 * has the new code but has not run the migration yet.
 */
export async function getMigratedDb(): Promise<Db | null> {
  const db = getDb();
  if (!db) return null;
  try {
    await ensureSchema(db);
  } catch {
    schemaReady = null;
  }
  return db;
}
