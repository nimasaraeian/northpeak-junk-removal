import type { Config } from "drizzle-kit";

/**
 * Drizzle config for NorthPeak Ops.
 *
 * `drizzle/` holds one hand-maintained migration rather than a generated
 * chain: the admin schema is three tables and the seed data is part of it, so
 * a single reviewable SQL file beats a directory of diffs. Run it against a
 * fresh Neon branch with `npm run db:push`.
 */
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
} satisfies Config;
