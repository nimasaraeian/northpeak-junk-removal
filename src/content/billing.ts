/**
 * Billing & tax configuration.
 *
 * The code constants here are the defaults; a `settings.billing` JSON row
 * (edited in admin → Settings) overrides them at runtime, exactly like the
 * pricing settings. GST is 5% federally in Canada; PST defaults to 0 because
 * junk-removal labour is generally not PST-taxable in BC — flip `pstPct` on in
 * Settings if an accountant says otherwise.
 */

export interface BillingSettings {
  /** GST rate as a percent, e.g. 5 for 5%. 0 hides the GST line. */
  gstPct: number;
  /** PST rate as a percent. 0 hides the PST line (the BC default here). */
  pstPct: number;
  /** GST/HST registration number printed on the invoice, if the shop has one. */
  gstNumber: string;
  /** Default deposit requested, as a percent of the total. 0 = no deposit. */
  depositPct: number;
  /** Net terms in days — sets the invoice due date from its issue date. */
  netDays: number;
  /** Footer line on the invoice: how to pay, thank-you, etc. */
  terms: string;
}

export const DEFAULT_BILLING_SETTINGS: BillingSettings = {
  gstPct: 5,
  pstPct: 0,
  gstNumber: "",
  depositPct: 0,
  netDays: 14,
  terms:
    "Payment by cash or Interac e-Transfer to admin@northpeakjunk.com. Thank you for choosing NorthPeak Junk Removal.",
};

export interface InvoiceTaxBreakdown {
  subtotalCents: number;
  gstCents: number;
  pstCents: number;
  totalCents: number;
}

/** Applies the configured GST/PST to a pre-tax subtotal. Rounds each tax line. */
export function computeInvoiceTax(
  subtotalCents: number,
  settings: BillingSettings,
): InvoiceTaxBreakdown {
  const base = Math.max(0, Math.round(subtotalCents));
  const gstCents = Math.round((base * settings.gstPct) / 100);
  const pstCents = Math.round((base * settings.pstPct) / 100);
  return { subtotalCents: base, gstCents, pstCents, totalCents: base + gstCents + pstCents };
}

/** Deposit the settings would ask for on a given total. */
export function depositForTotal(totalCents: number, settings: BillingSettings): number {
  if (settings.depositPct <= 0) return 0;
  return Math.round((totalCents * settings.depositPct) / 100);
}
