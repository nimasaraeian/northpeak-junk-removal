-- NorthPeak Ops v5 — Billing & payments: invoices + hand-recorded payments.
--
-- Additive only. 0000–0003 are not edited or replayed, and every statement
-- here is guarded so this can be applied to a database that already has
-- v1–v4 data in it.
--
--   Run in the Neon SQL editor, or `npm run db:push`.

-- Billing & tax overrides live alongside pricing on the single settings row.
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "billing" jsonb;

CREATE TABLE IF NOT EXISTS "invoices" (
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
);

CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices" ("status");
CREATE INDEX IF NOT EXISTS "invoices_created_at_idx" ON "invoices" ("created_at");
CREATE INDEX IF NOT EXISTS "invoices_client_id_idx" ON "invoices" ("client_id");

CREATE TABLE IF NOT EXISTS "payments" (
  "id" serial PRIMARY KEY NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "invoice_id" integer NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "amount_cents" integer NOT NULL,
  "method" text DEFAULT 'cash' NOT NULL,
  "received_at" timestamptz DEFAULT now() NOT NULL,
  "received_by" text NOT NULL,
  "note" text DEFAULT '' NOT NULL,
  CONSTRAINT "payments_method_known" CHECK ("method" IN ('cash', 'etransfer', 'card', 'cheque', 'other'))
);

CREATE INDEX IF NOT EXISTS "payments_invoice_id_idx" ON "payments" ("invoice_id");
CREATE INDEX IF NOT EXISTS "payments_received_at_idx" ON "payments" ("received_at");
