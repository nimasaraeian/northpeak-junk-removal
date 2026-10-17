-- NorthPeak Ops v7 — Sales engine: a call log behind the speed-to-lead
-- timers and the ranked call list.
--
-- Additive only, and the leads table is not altered: everything the timers
-- need is derived from these rows, so existing pages keep working on a
-- database that has not run this yet. Every statement is guarded.
--
--   Run in the Neon SQL editor, or let the app apply it (Settings → database).

CREATE TABLE IF NOT EXISTS "calls" (
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
);

CREATE INDEX IF NOT EXISTS "calls_lead_id_idx" ON "calls" ("lead_id", "created_at");
CREATE INDEX IF NOT EXISTS "calls_client_id_idx" ON "calls" ("client_id", "created_at");
CREATE INDEX IF NOT EXISTS "calls_created_at_idx" ON "calls" ("created_at");
