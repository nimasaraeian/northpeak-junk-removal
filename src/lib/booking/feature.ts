/**
 * Public online-booking feature flag.
 *
 * On by default: the full booking flow — instant JunkQ estimate + customer
 * self-booking at `/book`, the "Book Online" nav CTA, and the booking Server
 * Action — is live on the public site.
 *
 * It stays a one-switch kill: set `NEXT_PUBLIC_BOOKING_ENABLED=0` (or
 * `"false"`) in the environment to turn the whole thing off again, with no
 * code change. While off, `/book` 404s, the CTA hides, and the action refuses,
 * so the team can fall back to pricing every job by hand.
 *
 * `NEXT_PUBLIC_` so the same answer is available to both the server (page +
 * action) and the client (nav), inlined at build time.
 */
export function isBookingEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_BOOKING_ENABLED;
  return value !== "0" && value !== "false";
}
