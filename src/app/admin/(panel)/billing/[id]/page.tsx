import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOperator } from "@/lib/admin/auth";
import { InvoiceActions } from "@/components/admin/billing/InvoiceActions";
import { InvoiceForm } from "@/components/admin/billing/InvoiceForm";
import { PaymentsPanel } from "@/components/admin/billing/PaymentsPanel";
import {
  getInvoice,
  listPaymentsFor,
  loadBillingSettings,
} from "@/lib/admin/billing-data";
import { listClients } from "@/lib/admin/crm-data";
import { INVOICE_STATUS_LABELS, invoiceNumber, paymentState } from "@/lib/admin/billing";
import { formatCents } from "@/lib/quote-engine";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Invoice" };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" });

export default async function InvoiceDetailPage({ params }: PageProps<"/admin/billing/[id]">) {
  await requireOperator();
  const { id } = await params;
  const invoice = await getInvoice(Number(id));
  if (!invoice) notFound();

  const t = await getT();
  const [payments, billing, clients] = await Promise.all([
    listPaymentsFor(invoice.id),
    loadBillingSettings(),
    invoice.status === "draft" ? listClients("", 500) : Promise.resolve([]),
  ]);

  const paidCents = payments.reduce((sum, payment) => sum + payment.amountCents, 0);
  const state = paymentState(invoice.totalCents, paidCents);
  const isDraft = invoice.status === "draft";

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/billing"
        className="text-sm font-medium text-[var(--ops-gold-ink)] hover:underline"
      >
        ← {t("All invoices")}
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="ops-num text-xl font-semibold text-[var(--ops-navy)]">
              {invoice.number || invoiceNumber(invoice.id)}
            </h1>
            <span className="ops-pill" data-status={invoice.status}>
              {t(INVOICE_STATUS_LABELS[invoice.status])}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--ops-muted)]">
            {[invoice.customerName, invoice.customerPhone].filter(Boolean).join(" · ") ||
              t("No customer details")}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ops-faint)]">
            {t("Raised by")} {invoice.createdBy} · {dateFormat.format(invoice.createdAt)}
            {invoice.issuedAt ? ` · ${t("sent")} ${dateFormat.format(invoice.issuedAt)}` : ""}
            {invoice.dueAt ? ` · ${t("due")} ${dateFormat.format(invoice.dueAt)}` : ""}
          </p>
        </div>
        <p className="ops-num text-2xl font-semibold text-[var(--ops-navy)]">
          {formatCents(invoice.totalCents)}
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="grid gap-4">
          {isDraft ? (
            <div>
              <p className="ops-label mb-2">{t("Edit draft")}</p>
              <InvoiceForm
                mode="edit"
                invoiceId={invoice.id}
                billing={billing}
                clients={clients.map((client) => ({ id: client.id, name: client.name }))}
                initial={{
                  clientId: invoice.clientId,
                  customerName: invoice.customerName,
                  customerEmail: invoice.customerEmail,
                  customerPhone: invoice.customerPhone,
                  customerAddress: invoice.customerAddress,
                  notes: invoice.notes,
                  lines: invoice.lineItems.map((line) => ({
                    label: line.label,
                    qty: line.qty,
                    unitCents: line.unitCents,
                  })),
                }}
              />
            </div>
          ) : (
            <>
              <section className="ops-card overflow-hidden">
                <h2 className="border-b border-[var(--ops-border)] px-4 py-3 text-sm font-semibold text-[var(--ops-navy)]">
                  {t("Items")}
                </h2>
                <div className="overflow-x-auto">
                  <table className="ops-table">
                    <thead>
                      <tr>
                        <th>{t("Description")}</th>
                        <th>{t("Qty")}</th>
                        <th>{t("Unit")}</th>
                        <th>{t("Amount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((line, index) => (
                        <tr key={`${line.label}-${index}`}>
                          <td className="font-medium">{line.label}</td>
                          <td className="ops-num">{line.qty}</td>
                          <td className="ops-num">{formatCents(line.unitCents)}</td>
                          <td className="ops-num">{formatCents(line.amountCents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <dl className="grid gap-1 border-t border-[var(--ops-border)] px-4 py-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--ops-muted)]">{t("Subtotal")}</dt>
                    <dd className="ops-num">{formatCents(invoice.subtotalCents)}</dd>
                  </div>
                  {invoice.gstCents > 0 ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-[var(--ops-muted)]">
                        {t("GST")} ({billing.gstPct}%)
                      </dt>
                      <dd className="ops-num">{formatCents(invoice.gstCents)}</dd>
                    </div>
                  ) : null}
                  {invoice.pstCents > 0 ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-[var(--ops-muted)]">
                        {t("PST")} ({billing.pstPct}%)
                      </dt>
                      <dd className="ops-num">{formatCents(invoice.pstCents)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-3 border-t border-[var(--ops-border)] pt-2 font-semibold">
                    <dt>{t("Total")}</dt>
                    <dd className="ops-num">{formatCents(invoice.totalCents)}</dd>
                  </div>
                </dl>
                {invoice.notes ? (
                  <p className="border-t border-[var(--ops-border)] px-4 py-3 text-sm text-[var(--ops-muted)]">
                    {invoice.notes}
                  </p>
                ) : null}
              </section>
            </>
          )}

          <PaymentsPanel
            invoiceId={invoice.id}
            totalCents={invoice.totalCents}
            paidCents={state.paidCents}
            balanceCents={state.balanceCents}
            payments={payments}
            readOnly={invoice.status === "void"}
          />
        </div>

        <aside className="ops-card h-fit p-4 lg:sticky lg:top-20">
          <InvoiceActions invoice={invoice} />
        </aside>
      </div>
    </div>
  );
}
