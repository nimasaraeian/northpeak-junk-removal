-- NorthPeak Ops v8 — Users & roles: per-person accounts, invites, scrypt hashes.
--
-- Additive only. 0000–0006 are not edited or replayed, and every statement
-- here is guarded so this can be applied to a database that already has
-- v1–v7 data in it.
--
--   Run in the Neon SQL editor, or `npm run db:push` — or just open /admin/team,
--   which self-heals the schema via getMigratedDb().

CREATE TABLE IF NOT EXISTS "users" (
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
);

-- Case-insensitive unique email, and a single-use invite token.
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" (lower("email"));
CREATE UNIQUE INDEX IF NOT EXISTS "users_invite_token_unique" ON "users" ("invite_token") WHERE "invite_token" IS NOT NULL;
