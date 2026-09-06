/**
 * Supabase is not connected in Phase 1.
 *
 * Planned clients:
 * - Browser: @supabase/ssr for the future customer portal
 * - Server: service role for quote intake, CRM writes, and storage
 *
 * Tables (proposed):
 * - quote_requests
 * - customers
 * - job_photos
 * - estimates
 * - service_areas
 *
 * Storage buckets (proposed):
 * - quote-photos (private)
 * - gallery (public, CMS-ready)
 *
 * Do not instantiate a client here until env vars are present.
 */

export const supabaseReady = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function assertSupabaseConfigured() {
  if (!supabaseReady) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
}
