import assert from "node:assert/strict";
import test from "node:test";
import {
  computeInvoiceTotals,
  invoiceLinesFromQuote,
  invoiceNumber,
  lineItemsSubtotalCents,
  paymentState,
} from "@/lib/admin/billing";
import { DEFAULT_BILLING_SETTINGS } from "@/content/billing";
import type { InvoiceLineRow, QuoteRow } from "@/lib/db/schema";

test("invoice numbers are zero-padded and prefixed", () => {
  assert.equal(invoiceNumber(1), "NP-0001");
  assert.equal(invoiceNumber(42), "NP-0042");
  assert.equal(invoiceNumber(12345), "NP-12345");
});

test("payment state tracks balance and paid flags", () => {
  const unpaid = paymentState(10000, 0);
  assert.equal(unpaid.balanceCents, 10000);
  assert.equal(unpaid.fullyPaid, false);
  assert.equal(unpaid.partiallyPaid, false);

  const partial = paymentState(10000, 4000);
  assert.equal(partial.balanceCents, 6000);
  assert.equal(partial.partiallyPaid, true);
  assert.equal(partial.fullyPaid, false);

  const paid = paymentState(10000, 10000);
  assert.equal(paid.balanceCents, 0);
  assert.equal(paid.fullyPaid, true);

  // An overpayment clears the balance and does not report "partial".
  const over = paymentState(10000, 12000);
  assert.equal(over.balanceCents, -2000);
  assert.equal(over.fullyPaid, true);
  assert.equal(over.partiallyPaid, false);
});

test("subtotal sums line amounts", () => {
  const lines: InvoiceLineRow[] = [
    { label: "A", qty: 1, unitCents: 10000, amountCents: 10000 },
    { label: "B", qty: 2, unitCents: 2500, amountCents: 5000 },
  ];
  assert.equal(lineItemsSubtotalCents(lines), 15000);
});

test("GST at 5% applies, PST stays off by default", () => {
  const lines: InvoiceLineRow[] = [
    { label: "Junk removal", qty: 1, unitCents: 40000, amountCents: 40000 },
  ];
  const totals = computeInvoiceTotals(lines, DEFAULT_BILLING_SETTINGS);
  assert.equal(totals.subtotalCents, 40000);
  assert.equal(totals.gstCents, 2000); // 5% of 400.00
  assert.equal(totals.pstCents, 0);
  assert.equal(totals.totalCents, 42000);
  assert.equal(totals.depositCents, 0);
});

test("PST is added when switched on, and deposit follows the percent", () => {
  const lines: InvoiceLineRow[] = [
    { label: "Junk removal", qty: 1, unitCents: 40000, amountCents: 40000 },
  ];
  const totals = computeInvoiceTotals(lines, {
    ...DEFAULT_BILLING_SETTINGS,
    pstPct: 7,
    depositPct: 25,
  });
  assert.equal(totals.gstCents, 2000);
  assert.equal(totals.pstCents, 2800); // 7% of 400.00
  assert.equal(totals.totalCents, 44800);
  assert.equal(totals.depositCents, 11200); // 25% of 448.00
});

test("prefilling from a quote uses the range midpoint rounded to the dollar", () => {
  const quote = { id: 7, finalLowCents: 45000, finalHighCents: 55000 } as QuoteRow;
  const [line] = invoiceLinesFromQuote(quote);
  assert.equal(line.amountCents, 50000); // midpoint of 450–550
  assert.equal(line.qty, 1);
  assert.match(line.label, /#7/);
});
