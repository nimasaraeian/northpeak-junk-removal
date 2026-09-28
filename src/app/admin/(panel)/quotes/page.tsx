import Link from "next/link";
import { QUOTE_STATUSES, StatusPill } from "@/components/admin/StatusPill";
import { listQuotes } from "@/lib/admin/data";
import type { QuoteStatus } from "@/lib/db/schema";
import { formatRange } from "@/lib/quote-engine";

export const metadata = { title: "Quotes" };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function QuotesListPage({ searchParams }: PageProps<"/admin/quotes">) {
  const params = await searchParams;
  const status = (firstValue(params.status) ?? "all") as QuoteStatus | "all";
  const search = firstValue(params.q) ?? "";
  const since = firstValue(params.since) ?? "";

  const rows = await listQuotes({ status, search, since: since || undefined });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ops-label">Quotes</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">
            {rows.length} {rows.length === 1 ? "quote" : "quotes"}
          </h1>
        </div>
        <Link href="/admin/quotes/new" className="ops-btn" data-variant="primary">
          New quote
        </Link>
      </div>

      {/* A GET form, so a filtered view is a URL the operator can bookmark or
          send to the other one. */}
      <form className="ops-card mt-5 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="block">
          <span className="ops-label">Search</span>
          <input
            name="q"
            defaultValue={search}
            className="ops-input mt-1.5"
            placeholder="Name or phone"
            type="search"
          />
        </label>
        <label className="block">
          <span className="ops-label">Status</span>
          <select name="status" defaultValue={status} className="ops-select mt-1.5">
            <option value="all">All</option>
            {QUOTE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="ops-label">Since</span>
          <input name="since" type="date" defaultValue={since} className="ops-input mt-1.5" />
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="ops-btn" data-variant="navy">
            Filter
          </button>
          <Link href="/admin/quotes" className="ops-btn" data-variant="ghost">
            Clear
          </Link>
        </div>
      </form>

      <section className="ops-card mt-4 overflow-hidden">
        {rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-[var(--ops-muted)]">
            Nothing matches those filters.
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
                {rows.map((quote) => (
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
