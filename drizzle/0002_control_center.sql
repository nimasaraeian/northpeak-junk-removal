-- NorthPeak Ops v3 — Control Center: the owner-approval queue.
--
-- Additive only. 0000 and 0001 are not edited or replayed, and every
-- statement here is guarded so this can be applied to a database that already
-- has v1/v2 data in it.
--
--   Run in the Neon SQL editor, or `npm run db:push`.

CREATE TABLE IF NOT EXISTS "ai_actions" (
  "id" serial PRIMARY KEY,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "kind" text NOT NULL,
  "title" text NOT NULL,
  "summary" text DEFAULT '' NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "blocked_reason" text,
  "entity_type" text DEFAULT 'none' NOT NULL,
  "entity_id" integer,
  "created_by" text DEFAULT 'assistant' NOT NULL,
  "decided_by" text,
  "decided_at" timestamp with time zone,
  "note" text DEFAULT '' NOT NULL,
  CONSTRAINT "ai_actions_kind_known" CHECK ("kind" IN ('send_estimate', 'send_message', 'publish_instagram', 'start_google_ads', 'intake_summary', 'marketing_draft', 'other')),
  CONSTRAINT "ai_actions_status_known" CHECK ("status" IN ('pending', 'approved', 'rejected', 'deferred', 'blocked', 'done')),
  CONSTRAINT "ai_actions_entity_known" CHECK ("entity_type" IN ('lead', 'client', 'job', 'quote', 'none'))
);

CREATE INDEX IF NOT EXISTS "ai_actions_status_idx" ON "ai_actions" ("status");
CREATE INDEX IF NOT EXISTS "ai_actions_created_at_idx" ON "ai_actions" ("created_at");
