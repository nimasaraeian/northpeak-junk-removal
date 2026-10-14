import { requireOperator } from "@/lib/admin/auth";
import {
  DeleteButton,
  ExpenseForm,
  TimeEntryForm,
} from "@/components/admin/finance/FinanceForms";
import {
  defaultFinancePeriod,
  listExpenses,
  listTimeEntries,
  loadFinanceSummary,
} from "@/lib/admin/finance-data";
import {
  EXPENSE_CATEGORY_LABELS,
  payForEntryCents,
  summarizePayByPerson,
  totalPayCents,
} from "@/lib/admin/finance";
import { OPERATORS } from "@/lib/admin/session";
import { formatCents } from "@/lib/quote-engine";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Finance" };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" });

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Parse a YYYY-MM month param into a UTC [from, to) window; fall back to MTD. */
function periodFromParam(month: string | undefined): { from: Date; to: Date; label: string } {
  const now = new Date();
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, mon] = month.split("-").map(Number);
    if (year && mon >= 1 && mon <= 12) {
      const from = new Date(Date.UTC(year, mon - 1, 1));
      const to = new Date(Date.UTC(year, mon, 1));
      return { from, to, label: month };
    }
  }
  const { from, to } = defaultFinancePeriod(now);
  return {
    from,
    to,
    label: `${from.getUTCFullYear()}-${String(from.getUTCMonth() + 1).padStart(2, "0")}`,
  };
}

export default async function FinancePage({ searchParams }: PageProps<"/admin/finance">) {
  await requireOperator();
  const params = await searchParams;
  const { from, to, label } = periodFromParam(firstValue(params.month));

  const t = await getT();
  const [summary, timeRows, expenseRows] = await Promise.all([
    loadFinanceSummary(from, to),
    listTimeEntries(from, to),
    listExpenses(from, to),
  ]);

  const payByPerson = summarizePayByPerson(timeRows);
  const payTotal = totalPayCents(payByPerson);
  const people = [...OPERATORS];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ops-label">{t("Finance")}</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">
            {t("Payroll & accounting")}
          </h1>
        </div>
        <form className="flex items-end gap-2">
          <label className="block">
            <span className="ops-label">{t("Month")}</span>
            <input name="month" type="month" defaultValue={label} className="ops-input mt-1.5" />
          </label>
          <button type="submit" className="ops-btn" data-variant="navy">
            {t("View")}
          </button>
        </form>
      </div>

      {/* P&L cards */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="ops-card p-4">
          <p className="ops-label">{t("Revenue (collected)")}</p>
          <p className="ops-num mt-1 text-xl font-semibold text-[var(--ops-won-ink)]">
            {formatCents(summary.revenueCents)}
          </p>
        </div>
        <div className="ops-card p-4">
          <p className="ops-label">{t("Labour")}</p>
          <p className="ops-num mt-1 text-xl font-semibold text-[var(--ops-navy)]">
            {formatCents(summary.labourCents)}
          </p>
        </div>
        <div className="ops-card p-4">
          <p className="ops-label">{t("Expenses")}</p>
          <p className="ops-num mt-1 text-xl font-semibold text-[var(--ops-navy)]">
            {formatCents(summary.expensesCents)}
          </p>
        </div>
        <div className="ops-card p-4">
          <p className="ops-label">{t("Net profit")}</p>
          <p
            className="ops-num mt-1 text-xl font-semibold"
            style={{
              color:
                summary.netProfitCents >= 0 ? "var(--ops-won-ink)" : "var(--ops-lost-ink)",
            }}
          >
            {formatCents(summary.netProfitCents)}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ops-faint)]">
            {t("GST collected")}: {formatCents(summary.gstCollectedCents)}
          </p>
        </div>
      </div>

      {/* Payroll */}
      <section className="ops-card mt-6 p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Payroll")}</h2>
        {payByPerson.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>{t("Person")}</th>
                  <th>{t("Hours")}</th>
                  <th>{t("Pay")}</th>
                </tr>
              </thead>
              <tbody>
                {payByPerson.map((row) => (
                  <tr key={row.person}>
                    <td className="font-medium">{row.person}</td>
                    <td className="ops-num">{row.hours}</td>
                    <td className="ops-num">{formatCents(row.payCents)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="font-semibold">{t("Total")}</td>
                  <td />
                  <td className="ops-num font-semibold">{formatCents(payTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--ops-muted)]">{t("No hours logged this period.")}</p>
        )}

        <div className="mt-4 border-t border-[var(--ops-border)] pt-4">
          <p className="ops-label mb-2">{t("Log time")}</p>
          <TimeEntryForm people={people} />
        </div>

        {timeRows.length > 0 ? (
          <ul className="mt-4 grid gap-1.5 border-t border-[var(--ops-border)] pt-3 text-sm">
            {timeRows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3">
                <span className="text-[var(--ops-muted)]">
                  <span className="font-medium text-[var(--ops-text)]">{row.person}</span> ·{" "}
                  {dateFormat.format(new Date(row.workDate))} · {row.hours}h ×{" "}
                  {formatCents(row.rateCents)} ={" "}
                  <span className="ops-num">{formatCents(payForEntryCents(row.hours, row.rateCents))}</span>
                  {row.note ? ` · ${row.note}` : ""}
                </span>
                <DeleteButton kind="time" id={row.id} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* Expenses */}
      <section className="ops-card mt-6 p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Expenses")}</h2>
        {summary.expensesByCategory.length > 0 ? (
          <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
            {summary.expensesByCategory.map((row) => (
              <li key={row.category} className="flex justify-between gap-3">
                <span className="text-[var(--ops-muted)]">
                  {t(EXPENSE_CATEGORY_LABELS[row.category])}
                </span>
                <span className="ops-num">{formatCents(row.amountCents)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-[var(--ops-muted)]">{t("No expenses this period.")}</p>
        )}

        <div className="mt-4 border-t border-[var(--ops-border)] pt-4">
          <p className="ops-label mb-2">{t("Add an expense")}</p>
          <ExpenseForm />
        </div>

        {expenseRows.length > 0 ? (
          <ul className="mt-4 grid gap-1.5 border-t border-[var(--ops-border)] pt-3 text-sm">
            {expenseRows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3">
                <span className="text-[var(--ops-muted)]">
                  {dateFormat.format(new Date(row.expenseDate))} ·{" "}
                  <span className="font-medium text-[var(--ops-text)]">
                    {t(EXPENSE_CATEGORY_LABELS[row.category])}
                  </span>{" "}
                  · <span className="ops-num">{formatCents(row.amountCents)}</span>
                  {row.vendor ? ` · ${row.vendor}` : ""}
                  {row.note ? ` · ${row.note}` : ""}
                </span>
                <DeleteButton kind="expense" id={row.id} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
