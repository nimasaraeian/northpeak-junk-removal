/**
 * Billing enums + labels, in a dependency-light module with NO imports.
 *
 * Client components (status pills, dropdowns) need these as real runtime
 * values. Importing them from the Drizzle schema would pull Drizzle into the
 * client bundle — the same client/server boundary mistake that once crashed
 * `/admin/quotes`. The schema re-exports from here, so there is one source of
 * truth and server code can keep importing from `@/lib/db/schema`.
 */

export const INVOICE_STATUSES = ["draft", "sent", "paid", "void"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_METHODS = ["cash", "etransfer", "card", "cheque", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface InvoiceLineRow {
  label: string;
  qty: number;
  unitCents: number;
  amountCents: number;
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  void: "Void",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  etransfer: "e-Transfer",
  card: "Card",
  cheque: "Cheque",
  other: "Other",
};
