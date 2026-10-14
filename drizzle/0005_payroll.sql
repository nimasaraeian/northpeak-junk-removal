-- NorthPeak Ops v6 — Payroll & accounting: crew time entries + expense ledger.
--
-- Additive only. 0000–0004 are not edited or replayed, and every statement
-- here is guarded so this can be applied to a database that already has
-- v1–v5 data in it.
--
--   Run in the Neon SQL editor, or `npm run db:push`.

CREATE TABLE IF NOT EXISTS "time_entries" (
  "id" serial PRIMARY KEY NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "person" text NOT NULL,
  "job_id" integer REFERENCES "jobs"("id") ON DELETE SET NULL,
  "work_date" timestamptz NOT NULL,
  "hours" real NOT NULL,
  "rate_cents" integer NOT NULL,
  "note" text DEFAULT '' NOT NULL,
  "created_by" text NOT NULL
);

CREATE INDEX IF NOT EXISTS "time_entries_work_date_idx" ON "time_entries" ("work_date");
CREATE INDEX IF NOT EXISTS "time_entries_person_idx" ON "time_entries" ("person");

CREATE TABLE IF NOT EXISTS "expenses" (
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
);

CREATE INDEX IF NOT EXISTS "expenses_expense_date_idx" ON "expenses" ("expense_date");
CREATE INDEX IF NOT EXISTS "expenses_category_idx" ON "expenses" ("category");
