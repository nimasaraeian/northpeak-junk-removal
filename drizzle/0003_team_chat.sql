-- NorthPeak Ops v4 — Team chat: internal operator-to-operator messages.
--
-- Additive only. 0000–0002 are not edited or replayed, and every statement
-- here is guarded so this can be applied to a database that already has
-- v1/v2/v3 data in it.
--
--   Run in the Neon SQL editor, or `npm run db:push`.

CREATE TABLE IF NOT EXISTS "messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "author" text NOT NULL,
  "body" text NOT NULL
);

-- Reading the latest messages is the hot path; index the ordering column.
CREATE INDEX IF NOT EXISTS "messages_created_at_idx" ON "messages" ("created_at");
