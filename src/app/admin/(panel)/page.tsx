import Link from "next/link";
import { StatusPill } from "@/components/admin/StatusPill";
import { listQuotes, loadDashboardStats } from "@/lib/admin/data";
import { formatCents, formatRange } from "@/lib/quote-engine";

export const metadata = { title: "Dashboard" };

/** Reads the session and the database, so it is never prerendered. */
export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="ops-card p-4">
      <p className="ops-label">{label}</p>
      <p className="ops-num mt-2 text-2xl font-semibold text-[var(--ops-navy)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--ops-faint)]">{hint}</p> : null}
    </div>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
});

export default async function AdminDashboardPage() {
  const [stats, latest] = await Promise.all([
    loadDashboardStats(),
    listQuotes({}, 10),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ops-label">Dashboard</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">This month</h1>
        </div>
        <Link href="/admin/quotes/new" className="ops-btn" data-variant="primary">
          New quote
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Quotes this month" value={String(stats.quotesThisMonth)} />
        <StatCard
          label="Win rate"
          value={stats.winRatePct === null ? "—" : `${Math.round(stats.winRatePct)}%`}
          hint={
            stats.decidedThisMonth === 0
              ? "No quotes decided yet"
              : `of ${stats.decidedThisMonth} decided`
          }
        />
        <StatCard
          label="Revenue won"
          value={formatCents(stats.revenueWonCents)}
          hint="Sum of won quote midpoints"
        />
        <StatCard
          label="Avg quote value"
          value={stats.avgQuoteValueCents === null ? "—" : formatCents(stats.avgQuoteValueCents)}
          hint="Midpoint, all quotes this month"
        />
      </div>

      <section className="ops-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--ops-border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--ops-navy)]">Latest quotes</h2>
          <Link
            href="/admin/quotes"
            className="text-sm font-medium text-[var(--ops-gold-ink)] hover:underline"
          >
            View all
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[var(--ops-muted)]">
            No quotes yet. Start with <Link href="/admin/quotes/new" className="underline">a new quote</Link>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Area</th>
                  <th>Range</th>
                  <th>Status</th>
                  <th>By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {latest.map((quote) => (
                  <tr key={quote.id}>
                    <td>
                      <Link
                        href={`/admin/quotes/${quote.id}`}
                        className="font-medium text-[var(--ops-navy)] hover:underline"
                      >
                        {quote.customerName || `Quote #${quote.id}`}
                      </Link>
                      {quote.customerPhone ? (
                        <span className="ops-num block text-xs text-[var(--ops-faint)]">
                          {quote.customerPhone}
                        </span>
                      ) : null}
                    </td>
                    <td className="text-[var(--ops-muted)]">{quote.customerArea || "—"}</td>
                    <td className="ops-num font-medium">
                      {formatRange(quote.finalLowCents, quote.finalHighCents)}
                    </td>
                    <td>
                      <StatusPill status={quote.status} />
                    </td>
                    <td className="text-[var(--ops-muted)]">{quote.createdBy}</td>
                    <td className="ops-num whitespace-nowrap text-[var(--ops-muted)]">
                      {dateFormat.format(quote.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
