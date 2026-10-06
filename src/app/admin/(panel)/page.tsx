import Link from "next/link";
import { StatusPill } from "@/components/admin/StatusPill";
import { listQuotes, loadDashboardStats } from "@/lib/admin/data";
import { loadCrmDashboardStats } from "@/lib/admin/crm-data";
import { countPendingActions } from "@/lib/admin/control-data";
import { LEAD_STATUS_LABELS, PIPELINE_ORDER } from "@/lib/admin/crm";
import { formatCents, formatRange } from "@/lib/quote-engine";
import { getT } from "@/lib/i18n/server";

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
  const [stats, crm, latest, pendingActions] = await Promise.all([
    loadDashboardStats(),
    loadCrmDashboardStats(),
    listQuotes({}, 10),
    countPendingActions(),
  ]);

  const t = await getT();
  // The funnel only draws the stages still in play; won and lost have their
  // own cards and would flatten the bars.
  const funnelStages = PIPELINE_ORDER.filter(
    (stage) => stage !== "won" && stage !== "lost",
  );
  const funnelMax = Math.max(1, ...funnelStages.map((stage) => crm.leadsByStage[stage]));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ops-label">{t("Dashboard")}</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">{t("This month")}</h1>
        </div>
        <Link href="/admin/quotes/new" className="ops-btn" data-variant="primary">
          {t("New quote")}
        </Link>
      </div>

      {pendingActions > 0 ? (
        <Link
          href="/admin/control"
          className="ops-card mt-5 flex items-center justify-between gap-3 border-[var(--ops-gold)] p-4 transition-colors hover:bg-[var(--ops-surface-2)]"
        >
          <div>
            <p className="ops-label">Control Center</p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--ops-navy)]">
              {pendingActions} {pendingActions === 1 ? "action is" : "actions are"} waiting for your approval
            </p>
          </div>
          <span className="ops-pill" data-status="draft">
            Review
          </span>
        </Link>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("Quotes this month")} value={String(stats.quotesThisMonth)} />
        <StatCard
          label={t("Win rate")}
          value={stats.winRatePct === null ? "—" : `${Math.round(stats.winRatePct)}%`}
          hint={
            stats.decidedThisMonth === 0
              ? t("No quotes decided yet")
              : `${t("of")} ${stats.decidedThisMonth} ${t("decided")}`
          }
        />
        <StatCard
          label={t("Revenue won")}
          value={formatCents(stats.revenueWonCents)}
          hint={t("Sum of won quote midpoints")}
        />
        <StatCard
          label={t("Avg quote value")}
          value={stats.avgQuoteValueCents === null ? "—" : formatCents(stats.avgQuoteValueCents)}
          hint={t("Midpoint, all quotes this month")}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("Open leads")}
          value={String(crm.openLeads)}
          hint={t("New through Booked")}
        />
        <StatCard label={t("Jobs today")} value={String(crm.jobsToday)} />
        <StatCard
          label={t("Overdue follow-ups")}
          value={String(crm.overdueFollowUps)}
          hint={crm.overdueFollowUps > 0 ? t("Someone is waiting on a call") : t("All caught up")}
        />
        <Link href="/admin/leads" className="ops-card p-4 transition-colors hover:bg-[var(--ops-surface-2)]">
          <p className="ops-label">{t("Pipeline")}</p>
          <ul className="mt-2 grid gap-1">
            {funnelStages.map((stage) => {
              const count = crm.leadsByStage[stage];
              return (
                <li key={stage} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-[0.7rem] text-[var(--ops-muted)]">
                    {t(LEAD_STATUS_LABELS[stage])}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--ops-surface-2)]">
                    <span
                      className="block h-full rounded-full bg-[var(--ops-gold)]"
                      style={{ width: `${(count / funnelMax) * 100}%` }}
                    />
                  </span>
                  <span className="ops-num w-5 shrink-0 text-right text-[0.7rem] font-semibold">
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>
        </Link>
      </div>

      <section className="ops-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--ops-border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Latest quotes")}</h2>
          <Link
            href="/admin/quotes"
            className="text-sm font-medium text-[var(--ops-gold-ink)] hover:underline"
          >
            {t("View all")}
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[var(--ops-muted)]">
            {t("No quotes yet. Start with")} <Link href="/admin/quotes/new" className="underline">{t("a new quote")}</Link>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>{t("Customer")}</th>
                  <th>{t("Area")}</th>
                  <th>{t("Range")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("By")}</th>
                  <th>{t("Date")}</th>
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
