import Link from "next/link";

/**
 * The panel's own 404.
 *
 * Without this, `notFound()` from a page like `/admin/quotes/999` falls
 * through to the root `not-found.tsx`, which wraps itself in the marketing
 * header and footer — the one thing the admin panel is not supposed to
 * render. Having a boundary here also keeps the public site's RSC payload out
 * of every admin response.
 */
export default function AdminNotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="ops-label">404</p>
      <h1 className="mt-2 text-xl font-semibold text-[var(--ops-navy)]">
        Nothing here.
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--ops-muted)]">
        That quote may have been deleted, or the link is wrong.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/admin" className="ops-btn" data-variant="navy">
          Dashboard
        </Link>
        <Link href="/admin/quotes" className="ops-btn" data-variant="ghost">
          All quotes
        </Link>
      </div>
    </div>
  );
}
