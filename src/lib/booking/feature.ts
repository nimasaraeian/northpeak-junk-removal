/**
 * Public online-booking feature flag.
 *
 * Off by default. The whole booking system ships in the codebase and on
 * production, but stays invisible on the public site until
 * `NEXT_PUBLIC_BOOKING_ENABLED` is set to `"1"` (or `"true"`) in the
 * environment — one Vercel env var flips it on, with no code change and no
 * redeploy of logic.
 *
 * While it is off:
 *  - `/book` returns a 404,
 *  - the "Book Online" nav CTA is hidden, and
 *  - the booking Server Action refuses,
 * so nothing can self-book and the team keeps pricing every job by hand —
 * with full room to discount — through the admin quote builder.
 *
 * `NEXT_PUBLIC_` so the same answer is available to both the server (page +
 * action) and the client (nav), inlined at build time.
 */
export function isBookingEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_BOOKING_ENABLED;
  return value === "1" || value === "true";
}
