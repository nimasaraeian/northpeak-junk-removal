import Link from "next/link";
import { requireOperator } from "@/lib/admin/auth";
import { InvoiceForm } from "@/components/admin/billing/InvoiceForm";
import { QuoteToInvoiceButton } from "@/components/admin/billing/QuoteToInvoiceButton";
import { listInvoiceableQuotes, loadBillingSettings } from "@/lib/admin/billing-data";
import { listClients } from "@/lib/admin/crm-data";
import { formatRange } from "@/lib/quote-engine";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "New invoice" };
export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  await requireOperator();
  const t = await getT();

  const [quotes, clients, billing] = await Promise.all([
    listInvoiceableQuotes(),
    listClients("", 500),
    loadBillingSettings(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/billing"
        className="text-sm font-medium text-[var(--ops-gold-ink)] hover:underline"
      >
        ← {t("All invoices")}
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-[var(--ops-navy)]">{t("New invoice")}</h1>

      {quotes.length > 0 ? (
        <section className="ops-card mt-4 p-4">
          <h2 className="text-sm font-semibold text-[var(--ops-navy)]">
            {t("From a won quote")}
          </h2>
          <p className="mt-1 text-sm text-[var(--ops-muted)]">
            {t("Prefills the customer and amount; you confirm the final figure.")}
          </p>
          <ul className="mt-3 grid gap-2">
            {quotes.map((quote) => (
              <li
                key={quote.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--ops-border)] px-3 py-2"
              >
                <span className="text-sm">
                  <span className="font-medium text-[var(--ops-navy)]">
                    {quote.customerName || `${t("Quote")} #${quote.id}`}
                  </span>
                  <span className="ms-2 text-[var(--ops-muted)]">
                    {quote.customerArea || "—"} · {formatRange(quote.finalLowCents, quote.finalHighCents)}
                  </span>
                </span>
                <QuoteToInvoiceButton quoteId={quote.id} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <h2 className="mt-6 text-sm font-semibold text-[var(--ops-navy)]">
        {t("Or build one by hand")}
      </h2>
      <div className="mt-3">
        <InvoiceForm
          clients={clients.map((client) => ({ id: client.id, name: client.name }))}
          billing={billing}
        />
      </div>
    </div>
  );
}
