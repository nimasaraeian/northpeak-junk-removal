import {
  computeInvoiceTax,
  depositForTotal,
  type BillingSettings,
} from "@/content/billing";
import type { InvoiceLineRow, QuoteRow } from "@/lib/db/schema";

// Labels live in the dependency-light constants module; re-exported here so
// existing imports from "@/lib/admin/billing" keep working.
export { INVOICE_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/admin/billing-constants";

/**
 * Pure billing logic — no database, no React — so it is unit-testable and can
 * be shared by the server actions, the loaders and the invoice view.
 */

/** NP-0042 from id 42. Stable, human, and sorts naturally up to 9999. */
export function invoiceNumber(id: number): string {
  return `NP-${String(id).padStart(4, "0")}`;
}

export interface PaymentState {
  paidCents: number;
  balanceCents: number;
  fullyPaid: boolean;
  partiallyPaid: boolean;
}

export function paymentState(totalCents: number, paidCents: number): PaymentState {
  const paid = Math.max(0, Math.round(paidCents));
  const balanceCents = Math.round(totalCents) - paid;
  return {
    paidCents: paid,
    balanceCents,
    fullyPaid: balanceCents <= 0 && totalCents > 0,
    partiallyPaid: paid > 0 && balanceCents > 0,
  };
}

/** Sum of line amounts → the pre-tax subtotal. */
export function lineItemsSubtotalCents(lines: InvoiceLineRow[]): number {
  return lines.reduce((sum, line) => sum + Math.round(line.amountCents), 0);
}

export interface InvoiceTotals {
  lineItems: InvoiceLineRow[];
  subtotalCents: number;
  gstCents: number;
  pstCents: number;
  totalCents: number;
  depositCents: number;
}

/** Re-derives subtotal → GST/PST → total → suggested deposit from the lines. */
export function computeInvoiceTotals(
  lines: InvoiceLineRow[],
  settings: BillingSettings,
): InvoiceTotals {
  const subtotalCents = lineItemsSubtotalCents(lines);
  const tax = computeInvoiceTax(subtotalCents, settings);
  return {
    lineItems: lines,
    subtotalCents: tax.subtotalCents,
    gstCents: tax.gstCents,
    pstCents: tax.pstCents,
    totalCents: tax.totalCents,
    depositCents: depositForTotal(tax.totalCents, settings),
  };
}

/**
 * Prefills an invoice from a won quote. The quote carries a range; the invoice
 * needs one number, so it seeds with the range midpoint rounded to the dollar —
 * the operator confirms or edits it against the actual load before sending.
 */
export function invoiceLinesFromQuote(quote: QuoteRow): InvoiceLineRow[] {
  const midCents = Math.round((quote.finalLowCents + quote.finalHighCents) / 2 / 100) * 100;
  return [
    {
      label: `Junk removal — as quoted (#${quote.id})`,
      qty: 1,
      unitCents: midCents,
      amountCents: midCents,
    },
  ];
}

