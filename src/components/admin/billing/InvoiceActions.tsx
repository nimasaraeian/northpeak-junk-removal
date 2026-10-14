"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  queueInvoiceSendAction,
  updateInvoiceStatusAction,
} from "@/lib/admin/billing-actions";
import { invoiceNumber } from "@/lib/admin/billing";
import { INVOICE_STATUSES, INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/lib/admin/billing-constants";
import type { InvoiceRow } from "@/lib/db/schema";
import { formatCents } from "@/lib/quote-engine";
import { useT } from "@/lib/i18n/provider";

function invoiceText(invoice: InvoiceRow): string {
  const label = invoice.number || invoiceNumber(invoice.id);
  const lines = invoice.lineItems
    .map((line) => `  ${line.qty} × ${line.label} — ${formatCents(line.amountCents)}`)
    .join("\n");
  const taxLines = [
    `Subtotal: ${formatCents(invoice.subtotalCents)}`,
    invoice.gstCents > 0 ? `GST: ${formatCents(invoice.gstCents)}` : null,
    invoice.pstCents > 0 ? `PST: ${formatCents(invoice.pstCents)}` : null,
    `Total: ${formatCents(invoice.totalCents)}`,
  ]
    .filter(Boolean)
    .join("\n");
  return [
    `NorthPeak Junk Removal — Invoice ${label}`,
    invoice.customerName ? `\nBill to: ${invoice.customerName}` : "",
    "\nItems:",
    lines,
    "",
    taxLines,
    invoice.notes ? `\n${invoice.notes}` : "",
  ].join("\n");
}

export function InvoiceActions({ invoice }: { invoice: InvoiceRow }) {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [queued, setQueued] = useState(false);

  function setStatus(status: InvoiceStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateInvoiceStatusAction(invoice.id, status);
      if (!result.ok) {
        setError(result.error ?? t("That did not save."));
        return;
      }
      router.refresh();
    });
  }

  function queueSend() {
    setError(null);
    startTransition(async () => {
      const result = await queueInvoiceSendAction(invoice.id);
      if (!result.ok) {
        setError(result.error ?? t("Could not queue that."));
        return;
      }
      setQueued(true);
      window.setTimeout(() => setQueued(false), 2500);
      router.refresh();
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(invoiceText(invoice));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t("Could not reach the clipboard on this device."));
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="ops-label">{t("Status")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {INVOICE_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className="ops-btn"
              data-variant={invoice.status === status ? "navy" : "ghost"}
              disabled={pending || invoice.status === status}
              onClick={() => setStatus(status)}
            >
              {t(INVOICE_STATUS_LABELS[status])}
            </button>
          ))}
        </div>
      </div>

      <a
        href={`/admin/invoice/${invoice.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="ops-btn"
        data-variant="primary"
      >
        {t("View / print invoice")}
      </a>

      <button type="button" className="ops-btn" data-variant="ghost" onClick={() => void copy()}>
        {copied ? t("Copied") : t("Copy invoice text")}
      </button>

      {/* Approval-gated: nothing is sent to the customer from here. This drops a
          row into the Control queue for the owner to approve. */}
      <div className="grid gap-1">
        <button
          type="button"
          className="ops-btn"
          data-variant="navy"
          disabled={pending}
          onClick={queueSend}
        >
          {queued ? t("Queued for approval") : t("Send to customer (approval)")}
        </button>
        <p className="text-xs text-[var(--ops-faint)]">
          {t("Queues it in Control; the owner approves before anything is sent.")}
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[var(--ops-lost-ink)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
