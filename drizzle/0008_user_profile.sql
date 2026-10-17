-- NorthPeak Ops v9 — Personnel profile: full HR/pay/compliance data per user.
--
-- Additive only. One jsonb column holds the whole profile, so new fields never
-- need another migration. Guarded so it is safe on a database that already has
-- the v8 users table.
--
--   Self-heals via getMigratedDb() on first /admin/team load.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile" jsonb;
