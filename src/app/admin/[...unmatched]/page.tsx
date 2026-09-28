import { notFound } from "next/navigation";

/**
 * Catch-all for unrecognised `/admin/...` URLs.
 *
 * Without it an unmatched path under /admin falls through to the root
 * `not-found.tsx`, which renders the public header and footer — inside the
 * admin panel, which is the one place they must never appear. Matching here
 * first means `admin/not-found.tsx` is the nearest boundary, so a bad admin
 * URL looks like the panel.
 *
 * Catch-alls are the lowest-priority match in the App Router, so every real
 * route under /admin still wins.
 */
export const dynamic = "force-dynamic";

export default function AdminUnmatchedPage() {
  notFound();
}
