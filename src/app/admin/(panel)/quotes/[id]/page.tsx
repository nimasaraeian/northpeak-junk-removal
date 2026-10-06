import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteDetailActions } from "@/components/admin/QuoteDetailActions";
import { StatusPill } from "@/components/admin/StatusPill";
import { requireOperator } from "@/lib/admin/auth";
import { getQuote } from "@/lib/admin/data";
import { formatCents } from "@/lib/quote-engine";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Quote" };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function QuoteDetailPage({ params }: PageProps<"/admin/quotes/[id]">) {
  const operator = await requireOperator();
  const { id } = await params;
  const quote = await getQuote(Number(id));
  if (!quote) notFound();

  const t = await getT();
  const computed = quote.computed;

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/quotes"
        className="text-sm font-medium text-[var(--ops-gold-ink)] hover:underline"
      >
        ← {t("All quotes")}
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-[var(--ops-navy)]">
              {quote.customerName || `${t("Quote")} #${quote.id}`}
            </h1>
            <StatusPill status={quote.status} />
          </div>
          <p className="mt-1 text-sm text-[var(--ops-muted)]">
            {[quote.customerPhone, quote.customerArea].filter(Boolean).join(" · ") || t("No contact details")}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ops-faint)]">
            {t("Raised by")} {quote.createdBy} · {dateFormat.format(quote.createdAt)}
          </p>
        </div>
        <p className="ops-num text-2xl font-semibold text-[var(--ops-navy)]">
          {formatCents(quote.finalLowCents)} – {formatCents(quote.finalHighCents)}
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="grid gap-4">
          <section className="ops-card overflow-hidden">
            <h2 className="border-b border-[var(--ops-border)] px-4 py-3 text-sm font-semibold text-[var(--ops-navy)]">
              {t("Items")}
            </h2>
            {quote.itemLines.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--ops-muted)]">
                {quote.heavyMode ? t("Priced by weight — no item list.") : t("No items recorded.")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>{t("Item")}</th>
                      <th>{t("Qty")}</th>
                      <th>{t("ft³ each")}</th>
                      <th>{t("Flags")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.itemLines.map((line, index) => (
                      <tr key={`${line.label}-${index}`}>
                        <td className="font-medium">{line.label}</td>
                        <td className="ops-num">{line.qty}</td>
                        <td className="ops-num">{line.cubicFeetEach}</td>
                        <td className="text-xs text-[var(--ops-muted)]">
                          {line.flags?.join(", ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="ops-card p-4">
            <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Breakdown")}</h2>
            <ul className="mt-3 grid gap-1.5 text-sm">
              {computed.breakdown.map((row) => (
                <li key={row.label} className="flex items-baseline justify-between gap-3">
                  <span className="text-[var(--ops-muted)]">
                    {t(row.label)}
                    {row.detail ? (
                      <span className="block text-xs text-[var(--ops-faint)]">{row.detail}</span>
                    ) : null}
                  </span>
                  <span className="ops-num shrink-0 font-medium">
                    {formatCents(row.amountCents)}
                  </span>
                </li>
              ))}
            </ul>
            {computed.floorApplied ? (
              <p className="mt-2 text-xs text-[var(--ops-muted)]">
                {t("Adjusted to published tier floor")} ({computed.floorLabel}).
              </p>
            ) : null}
            <dl className="mt-3 grid gap-1 border-t border-[var(--ops-border)] pt-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ops-muted)]">{t("Access")}</dt>
                <dd>
                  {quote.labor.stairsFlights} {t("flights")} ·{" "}
                  {quote.labor.carryDistance === "long" ? t("long carry") : t("standard carry")} ·{" "}
                  {quote.labor.disassembly} {t("disassembly")}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ops-muted)]">{t("Packing factor")}</dt>
                <dd className="ops-num">{quote.packingPct}%</dd>
              </div>
              {quote.discount ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--ops-muted)]">{t("Discount")}</dt>
                  <dd>
                    {quote.discount.type === "percent"
                      ? `${quote.discount.value}%`
                      : formatCents(quote.discount.value)}
                    {quote.discount.reason ? ` · ${quote.discount.reason}` : ""}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="ops-internal p-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--ops-lost-ink)]">
              {t("Internal — do not share")}
            </p>
            <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--ops-muted)]">{t("Est. weight")}</dt>
                <dd className="ops-num">{Math.round(computed.internal.estWeightKg)} kg</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--ops-muted)]">{t("Disposal")}</dt>
                <dd className="ops-num">{formatCents(computed.internal.disposalCents)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--ops-muted)]">{t("Crew")} · {computed.internal.laborHoursEst}h</dt>
                <dd className="ops-num">{formatCents(computed.internal.laborCostCents)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--ops-muted)]">{t("Fuel")}</dt>
                <dd className="ops-num">{formatCents(computed.internal.fuelCents)}</dd>
              </div>
              <div className="flex justify-between gap-2 font-semibold">
                <dt>{t("Cost")}</dt>
                <dd className="ops-num">{formatCents(computed.internal.totalCents)}</dd>
              </div>
              <div className="flex justify-between gap-2 font-semibold">
                <dt>{t("Margin")}</dt>
                <dd
                  className="ops-num"
                  style={{
                    color:
                      computed.internal.marginCents >= 0
                        ? "var(--ops-won-ink)"
                        : "var(--ops-lost-ink)",
                  }}
                >
                  {formatCents(computed.internal.marginCents)} ·{" "}
                  {computed.internal.marginPct.toFixed(0)}%
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="ops-card h-fit p-4 lg:sticky lg:top-20">
          <QuoteDetailActions quote={quote} operator={operator} />
        </aside>
      </div>
    </div>
  );
}
