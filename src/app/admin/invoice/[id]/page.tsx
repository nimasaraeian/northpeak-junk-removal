import { notFound } from "next/navigation";
import { requireOperator } from "@/lib/admin/auth";
import { PrintButton } from "@/components/admin/billing/PrintButton";
import { getInvoice, listPaymentsFor, loadBillingSettings } from "@/lib/admin/billing-data";
import { invoiceNumber, paymentState } from "@/lib/admin/billing";
import { formatCents } from "@/lib/quote-engine";

export const metadata = { title: "Invoice", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "long" });

/**
 * A clean, customer-facing invoice sheet. It sits OUTSIDE the (panel) route
 * group on purpose, so it carries no sidebar or tab bar — just the sheet, ready
 * to print or save as PDF. Still operator-gated.
 */
export default async function InvoicePrintPage({ params }: PageProps<"/admin/invoice/[id]">) {
  await requireOperator();
  const { id } = await params;
  const invoice = await getInvoice(Number(id));
  if (!invoice) notFound();

  const [payments, billing] = await Promise.all([
    listPaymentsFor(invoice.id),
    loadBillingSettings(),
  ]);
  const paidCents = payments.reduce((sum, p) => sum + p.amountCents, 0);
  const state = paymentState(invoice.totalCents, paidCents);
  const label = invoice.number || invoiceNumber(invoice.id);

  return (
    <div className="np-invoice-sheet">
      <style>{`
        @media print { .np-print-hide { display: none !important; } @page { margin: 16mm; } }
        .np-invoice-sheet { max-width: 48rem; margin: 0 auto; padding: 2rem 1.5rem; color: #1a1a1a; }
        .np-invoice-sheet table { width: 100%; border-collapse: collapse; }
        .np-invoice-sheet th, .np-invoice-sheet td { padding: 0.5rem 0.25rem; text-align: left; }
        .np-invoice-sheet thead th { border-bottom: 2px solid #16324f; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: #55637a; }
        .np-invoice-sheet tbody td { border-bottom: 1px solid #e5e8ee; }
        .np-num { font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
      `}</style>

      <div className="np-print-hide" style={{ marginBottom: "1rem", textAlign: "right" }}>
        <PrintButton />
      </div>

      <header style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: "1.35rem", fontWeight: 700, color: "#16324f" }}>
            NorthPeak <span style={{ color: "#e4a020" }}>Junk Removal</span>
          </p>
          <p style={{ fontSize: "0.85rem", color: "#55637a", marginTop: "0.25rem" }}>
            North Vancouver, BC · northpeakjunk.com · admin@northpeakjunk.com
          </p>
          {billing.gstNumber ? (
            <p style={{ fontSize: "0.8rem", color: "#55637a" }}>GST/HST #: {billing.gstNumber}</p>
          ) : null}
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>INVOICE</p>
          <p className="np-num" style={{ fontWeight: 600 }}>{label}</p>
          <p style={{ fontSize: "0.85rem", color: "#55637a" }}>
            {dateFormat.format(invoice.issuedAt ?? invoice.createdAt)}
          </p>
          {invoice.dueAt ? (
            <p style={{ fontSize: "0.85rem", color: "#55637a" }}>
              Due {dateFormat.format(invoice.dueAt)}
            </p>
          ) : null}
        </div>
      </header>

      <section style={{ marginTop: "1.5rem" }}>
        <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#55637a" }}>
          Bill to
        </p>
        <p style={{ fontWeight: 600 }}>{invoice.customerName || "—"}</p>
        {invoice.customerAddress ? (
          <p style={{ fontSize: "0.9rem" }}>{invoice.customerAddress}</p>
        ) : null}
        {invoice.customerPhone ? (
          <p style={{ fontSize: "0.9rem" }}>{invoice.customerPhone}</p>
        ) : null}
        {invoice.customerEmail ? (
          <p style={{ fontSize: "0.9rem" }}>{invoice.customerEmail}</p>
        ) : null}
      </section>

      <table style={{ marginTop: "1.5rem" }}>
        <thead>
          <tr>
            <th>Description</th>
            <th className="np-num">Qty</th>
            <th className="np-num">Unit</th>
            <th className="np-num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map((line, index) => (
            <tr key={`${line.label}-${index}`}>
              <td>{line.label}</td>
              <td className="np-num">{line.qty}</td>
              <td className="np-num">{formatCents(line.unitCents)}</td>
              <td className="np-num">{formatCents(line.amountCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "1rem", marginLeft: "auto", maxWidth: "18rem" }}>
        <Row label="Subtotal" value={formatCents(invoice.subtotalCents)} />
        {invoice.gstCents > 0 ? (
          <Row label={`GST (${billing.gstPct}%)`} value={formatCents(invoice.gstCents)} />
        ) : null}
        {invoice.pstCents > 0 ? (
          <Row label={`PST (${billing.pstPct}%)`} value={formatCents(invoice.pstCents)} />
        ) : null}
        <Row label="Total" value={formatCents(invoice.totalCents)} strong />
        {paidCents > 0 ? <Row label="Paid" value={`− ${formatCents(paidCents)}`} /> : null}
        <Row
          label="Balance due"
          value={state.balanceCents <= 0 ? "Paid in full" : formatCents(state.balanceCents)}
          strong
        />
      </div>

      {invoice.notes ? (
        <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "#55637a" }}>{invoice.notes}</p>
      ) : null}

      {billing.terms ? (
        <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "#55637a", borderTop: "1px solid #e5e8ee", paddingTop: "1rem" }}>
          {billing.terms}
        </p>
      ) : null}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.2rem 0",
        fontWeight: strong ? 700 : 400,
        borderTop: strong ? "1px solid #16324f" : undefined,
      }}
    >
      <span>{label}</span>
      <span className="np-num">{value}</span>
    </div>
  );
}
