"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePaymentAction, recordPaymentAction } from "@/lib/admin/billing-actions";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/admin/billing-constants";
import type { PaymentRow } from "@/lib/db/schema";
import { formatCents } from "@/lib/quote-engine";
import { useT } from "@/lib/i18n/provider";

const dateFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" });

export function PaymentsPanel({
  invoiceId,
  totalCents,
  paidCents,
  balanceCents,
  payments,
  readOnly,
}: {
  invoiceId: number;
  totalCents: number;
  paidCents: number;
  balanceCents: number;
  payments: PaymentRow[];
  readOnly: boolean;
}) {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState(balanceCents > 0 ? (balanceCents / 100).toFixed(2) : "");
  const [method, setMethod] = useState<PaymentMethod>("etransfer");
  const [receivedAt, setReceivedAt] = useState("");
  const [note, setNote] = useState("");

  function record() {
    setError(null);
    startTransition(async () => {
      const result = await recordPaymentAction(invoiceId, {
        amountDollars: Number(amount),
        method,
        receivedAt,
        note: note.trim(),
      });
      if (!result.ok) {
        setError(result.error ?? t("That payment did not save."));
        return;
      }
      setAmount("");
      setNote("");
      router.refresh();
    });
  }

  function remove(paymentId: number) {
    setError(null);
    startTransition(async () => {
      const result = await deletePaymentAction(paymentId);
      if (!result.ok) setError(result.error ?? t("Could not remove that payment."));
      else router.refresh();
    });
  }

  return (
    <section className="ops-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Payments")}</h2>
        <span className="ops-num text-sm text-[var(--ops-muted)]">
          {formatCents(paidCents)} / {formatCents(totalCents)}
        </span>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-3 border-b border-[var(--ops-border)] pb-3">
        <span className="text-sm text-[var(--ops-muted)]">{t("Balance due")}</span>
        <span
          className="ops-num text-lg font-semibold"
          style={{ color: balanceCents <= 0 ? "var(--ops-won-ink)" : "var(--ops-navy)" }}
        >
          {balanceCents <= 0 ? t("Paid in full") : formatCents(balanceCents)}
        </span>
      </div>

      {payments.length > 0 ? (
        <ul className="mt-3 grid gap-2">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span>
                <span className="ops-num font-medium">{formatCents(payment.amountCents)}</span>
                <span className="ms-2 text-[var(--ops-muted)]">
                  {t(PAYMENT_METHOD_LABELS[payment.method])} ·{" "}
                  {dateFormat.format(new Date(payment.receivedAt))}
                  {payment.note ? ` · ${payment.note}` : ""}
                </span>
              </span>
              {!readOnly ? (
                <button
                  type="button"
                  className="text-xs text-[var(--ops-lost-ink)] hover:underline"
                  disabled={pending}
                  onClick={() => remove(payment.id)}
                >
                  {t("Remove")}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-[var(--ops-muted)]">{t("No payments recorded yet.")}</p>
      )}

      {!readOnly ? (
        <div className="mt-4 border-t border-[var(--ops-border)] pt-4">
          <p className="ops-label">{t("Record a payment")}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="sr-only">{t("Amount")}</span>
              <input
                className="ops-input ops-num"
                type="number"
                min="0"
                step="0.01"
                placeholder={t("Amount $")}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="sr-only">{t("Method")}</span>
              <select
                className="ops-select"
                value={method}
                onChange={(event) => setMethod(event.target.value as PaymentMethod)}
              >
                {PAYMENT_METHODS.map((value) => (
                  <option key={value} value={value}>
                    {t(PAYMENT_METHOD_LABELS[value])}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">{t("Date")}</span>
              <input
                className="ops-input"
                type="date"
                value={receivedAt}
                onChange={(event) => setReceivedAt(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="sr-only">{t("Note")}</span>
              <input
                className="ops-input"
                placeholder={t("Note (optional)")}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            className="ops-btn mt-2"
            data-variant="navy"
            disabled={pending || !(Number(amount) > 0)}
            onClick={record}
          >
            {pending ? t("Saving…") : t("Add payment")}
          </button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-2 text-sm text-[var(--ops-lost-ink)]">
          {error}
        </p>
      ) : null}
    </section>
  );
}
