import Link from "next/link";
import { requireOperator } from "@/lib/admin/auth";
import {
  listInvoices,
  loadBillingStats,
  paidTotalsFor,
  type InvoiceFilters,
} from "@/lib/admin/billing-data";
import { INVOICE_STATUS_LABELS, invoiceNumber, paymentState } from "@/lib/admin/billing";
import { INVOICE_STATUSES, type InvoiceStatus } from "@/lib/db/schema";
import { formatCents } from "@/lib/quote-engine";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Billing" };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BillingPage({ searchParams }: PageProps<"/admin/billing">) {
  await requireOperator();
  const params = await searchParams;
  const status = (firstValue(params.status) ?? "all") as InvoiceStatus | "all";
  const search = firstValue(params.q) ?? "";

  const t = await getT();
  const filters: InvoiceFilters = { status, search };
  const rows = await listInvoices(filters);
  const [paid, stats] = await Promise.all([
    paidTotalsFor(rows.map((row) => row.id)),
    loadBillingStats(),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ops-label">{t("Billing")}</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">
            {rows.length} {rows.length === 1 ? t("invoice") : t("invoices")}
          </h1>
        </div>
        <Link href="/admin/billing/new" className="ops-btn" data-variant="primary">
          {t("New invoice")}
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="ops-card p-4">
          <p className="ops-label">{t("Outstanding")}</p>
          <p className="ops-num mt-1 text-2xl font-semibold text-[var(--ops-navy)]">
            {formatCents(stats.outstandingCents)}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ops-faint)]">
            {stats.openCount} {t("sent, awaiting payment")}
          </p>
        </div>
        <div className="ops-card p-4">
          <p className="ops-label">{t("Collected this month")}</p>
          <p className="ops-num mt-1 text-2xl font-semibold text-[var(--ops-won-ink)]">
            {formatCents(stats.paidThisMonthCents)}
          </p>
        </div>
        <div className="ops-card p-4">
          <p className="ops-label">{t("Drafts")}</p>
          <p className="ops-num mt-1 text-2xl font-semibold text-[var(--ops-navy)]">
            {stats.draftCount}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ops-faint)]">{t("Not yet sent")}</p>
        </div>
      </div>

      <form className="ops-card mt-4 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]">
        <label className="block">
          <span className="ops-label">{t("Search")}</span>
          <input
            name="q"
            defaultValue={search}
            className="ops-input mt-1.5"
            placeholder={t("Name, phone or number")}
            type="search"
          />
        </label>
        <label className="block">
          <span className="ops-label">{t("Status")}</span>
          <select name="status" defaultValue={status} className="ops-select mt-1.5">
            <option value="all">{t("All")}</option>
            {INVOICE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {t(INVOICE_STATUS_LABELS[value])}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="ops-btn" data-variant="navy">
            {t("Filter")}
          </button>
          <Link href="/admin/billing" className="ops-btn" data-variant="ghost">
            {t("Clear")}
          </Link>
        </div>
      </form>

      <section className="ops-card mt-4 overflow-hidden">
        {rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-[var(--ops-muted)]">
            {t("No invoices yet. Raise one from a won quote or from scratch.")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>{t("Invoice")}</th>
                  <th>{t("Customer")}</th>
                  <th>{t("Total")}</th>
                  <th>{t("Balance")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("Date")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((invoice) => {
                  const state = paymentState(invoice.totalCents, paid.get(invoice.id) ?? 0);
                  return (
                    <tr key={invoice.id}>
                      <td>
                        <Link
                          href={`/admin/billing/${invoice.id}`}
                          className="ops-num font-medium text-[var(--ops-navy)] hover:underline"
                        >
                          {invoice.number || invoiceNumber(invoice.id)}
                        </Link>
                      </td>
                      <td>{invoice.customerName || "—"}</td>
                      <td className="ops-num">{formatCents(invoice.totalCents)}</td>
                      <td
                        className="ops-num font-medium"
                        style={{
                          color: state.fullyPaid
                            ? "var(--ops-won-ink)"
                            : state.balanceCents > 0
                              ? "var(--ops-navy)"
                              : "var(--ops-muted)",
                        }}
                      >
                        {state.fullyPaid ? t("Paid") : formatCents(state.balanceCents)}
                      </td>
                      <td>
                        <span className="ops-pill" data-status={invoice.status}>
                          {t(INVOICE_STATUS_LABELS[invoice.status])}
                        </span>
                      </td>
                      <td className="ops-num whitespace-nowrap text-[var(--ops-muted)]">
                        {dateFormat.format(invoice.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
