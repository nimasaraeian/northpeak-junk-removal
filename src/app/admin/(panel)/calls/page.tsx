import { CallListRow } from "@/components/admin/sales/CallListRow";
import { SLA } from "@/lib/admin/sales";
import { loadCallList } from "@/lib/admin/sales-data";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Calls" };
export const dynamic = "force-dynamic";

/**
 * Who to call now, most urgent first.
 *
 * The order is the sales playbook written down: a lead nobody has called yet,
 * then follow-ups someone promised, then quotes that have not booked, then
 * leads still waiting on a quote, then missed calls due another try, then past
 * clients worth a check-in. Work the list top to bottom.
 */
export default async function CallsPage() {
  const t = await getT();
  const { items, speed, lateCount, callsToday } = await loadCallList();

  const stats = [
    { label: t("To call"), value: String(items.length) },
    { label: t("Late"), value: String(lateCount), tone: lateCount > 0 ? "late" : undefined },
    {
      label: t("Median first call (30d)"),
      value: speed.medianMinutes === null ? "—" : `${speed.medianMinutes}m`,
    },
    {
      label: `${t("Called within")} ${SLA.firstContactMinutes}m`,
      value: speed.withinSla === null ? "—" : `${Math.round(speed.withinSla * 100)}%`,
    },
    { label: t("Calls logged today"), value: String(callsToday) },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <p className="ops-label">{t("Sales")}</p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">{t("Who to call now")}</h1>
      <p className="mt-1 text-sm text-[var(--ops-muted)]">
        {t("The first company to call back usually wins the job. Work this list from the top.")}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="ops-card p-3">
            <dt className="text-xs text-[var(--ops-muted)]">{s.label}</dt>
            <dd
              className={`mt-1 text-lg font-semibold tabular-nums ${
                s.tone === "late" ? "text-[var(--ops-lost-ink)]" : "text-[var(--ops-navy)]"
              }`}
            >
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      <section className="ops-card mt-4 overflow-hidden">
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--ops-muted)]">
            {t("Nobody to call right now. New leads and due follow-ups will show up here.")}
          </p>
        ) : (
          <ol className="divide-y divide-[var(--ops-border)]">
            {items.map((item, i) => (
              <CallListRow key={item.key} item={item} rank={i + 1} />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
