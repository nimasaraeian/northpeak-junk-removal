"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInvoiceAction, updateInvoiceAction } from "@/lib/admin/billing-actions";
import { formatCents } from "@/lib/quote-engine";
import { computeInvoiceTax, type BillingSettings } from "@/content/billing";
import { useT } from "@/lib/i18n/provider";

interface LineDraft {
  label: string;
  qty: string;
  unitDollars: string;
}

export interface InvoiceFormInitial {
  clientId: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
  lines: { label: string; qty: number; unitCents: number }[];
}

const EMPTY_INITIAL: InvoiceFormInitial = {
  clientId: null,
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  customerAddress: "",
  notes: "",
  lines: [{ label: "", qty: 1, unitCents: 0 }],
};

function toDrafts(lines: InvoiceFormInitial["lines"]): LineDraft[] {
  if (lines.length === 0) return [{ label: "", qty: "1", unitDollars: "" }];
  return lines.map((line) => ({
    label: line.label,
    qty: String(line.qty),
    unitDollars: line.unitCents ? (line.unitCents / 100).toString() : "",
  }));
}

/**
 * Create a new invoice, or edit a draft. In "edit" mode it writes back to the
 * same invoice and refreshes; in "create" mode it opens the new invoice.
 */
export function InvoiceForm({
  clients,
  billing,
  mode = "create",
  invoiceId,
  initial = EMPTY_INITIAL,
}: {
  clients: { id: number; name: string }[];
  billing: BillingSettings;
  mode?: "create" | "edit";
  invoiceId?: number;
  initial?: InvoiceFormInitial;
}) {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [clientId, setClientId] = useState(initial.clientId ? String(initial.clientId) : "");
  const [customerName, setCustomerName] = useState(initial.customerName);
  const [customerEmail, setCustomerEmail] = useState(initial.customerEmail);
  const [customerPhone, setCustomerPhone] = useState(initial.customerPhone);
  const [customerAddress, setCustomerAddress] = useState(initial.customerAddress);
  const [notes, setNotes] = useState(initial.notes);
  const [lines, setLines] = useState<LineDraft[]>(toDrafts(initial.lines));

  const preview = useMemo(() => {
    const subtotal = lines.reduce((sum, line) => {
      const qty = Number(line.qty) || 0;
      const unit = Math.round((Number(line.unitDollars) || 0) * 100);
      return sum + Math.round(unit * qty);
    }, 0);
    return computeInvoiceTax(subtotal, billing);
  }, [lines, billing]);

  function setLine(index: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function addLine() {
    setLines((prev) => [...prev, { label: "", qty: "1", unitDollars: "" }]);
  }

  function removeLine(index: number) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function submit() {
    setError(null);
    const parsedLines = lines
      .filter((line) => line.label.trim().length > 0)
      .map((line) => ({
        label: line.label.trim(),
        qty: Number(line.qty) || 1,
        unitDollars: Number(line.unitDollars) || 0,
      }));
    if (parsedLines.length === 0) {
      setError(t("Add at least one line item."));
      return;
    }

    const payload = {
      clientId: clientId ? Number(clientId) : null,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      notes: notes.trim(),
      lines: parsedLines,
    };

    startTransition(async () => {
      if (mode === "edit" && invoiceId) {
        const result = await updateInvoiceAction(invoiceId, payload);
        if (!result.ok) {
          setError(result.error ?? t("Those changes did not save."));
          return;
        }
        router.refresh();
        return;
      }
      const result = await createInvoiceAction(payload);
      if (!result.ok || !result.id) {
        setError(result.error ?? t("Could not create that invoice."));
        return;
      }
      router.push(`/admin/billing/${result.id}`);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
      <div className="grid gap-4">
        <section className="ops-card p-4">
          <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Customer")}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="ops-label">{t("Link to client")}</span>
              <select
                className="ops-select mt-1.5"
                value={clientId}
                onChange={(event) => {
                  const id = event.target.value;
                  setClientId(id);
                  const match = clients.find((c) => String(c.id) === id);
                  if (match && !customerName) setCustomerName(match.name);
                }}
              >
                <option value="">{t("No link (walk-up)")}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="ops-label">{t("Name")}</span>
              <input
                className="ops-input mt-1.5"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="ops-label">{t("Phone")}</span>
              <input
                className="ops-input mt-1.5"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="ops-label">{t("Email")}</span>
              <input
                className="ops-input mt-1.5"
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="ops-label">{t("Address")}</span>
              <input
                className="ops-input mt-1.5"
                value={customerAddress}
                onChange={(event) => setCustomerAddress(event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="ops-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Line items")}</h2>
            <button type="button" className="ops-btn" data-variant="ghost" onClick={addLine}>
              + {t("Add line")}
            </button>
          </div>
          <div className="mt-3 grid gap-3">
            {lines.map((line, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_4rem_7rem_auto]">
                <input
                  className="ops-input"
                  placeholder={t("Description")}
                  value={line.label}
                  onChange={(event) => setLine(index, { label: event.target.value })}
                />
                <input
                  className="ops-input ops-num"
                  type="number"
                  min="0"
                  step="1"
                  placeholder={t("Qty")}
                  value={line.qty}
                  onChange={(event) => setLine(index, { qty: event.target.value })}
                />
                <input
                  className="ops-input ops-num"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={t("Unit $")}
                  value={line.unitDollars}
                  onChange={(event) => setLine(index, { unitDollars: event.target.value })}
                />
                <button
                  type="button"
                  className="ops-btn"
                  data-variant="ghost"
                  onClick={() => removeLine(index)}
                  aria-label={t("Remove line")}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="ops-card p-4">
          <label className="block">
            <span className="ops-label">{t("Notes (shown on the invoice)")}</span>
            <textarea
              className="ops-textarea mt-1.5"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        </section>
      </div>

      <aside className="ops-card h-fit p-4 lg:sticky lg:top-20">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Totals")}</h2>
        <dl className="mt-3 grid gap-1.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--ops-muted)]">{t("Subtotal")}</dt>
            <dd className="ops-num">{formatCents(preview.subtotalCents)}</dd>
          </div>
          {billing.gstPct > 0 ? (
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--ops-muted)]">
                {t("GST")} ({billing.gstPct}%)
              </dt>
              <dd className="ops-num">{formatCents(preview.gstCents)}</dd>
            </div>
          ) : null}
          {billing.pstPct > 0 ? (
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--ops-muted)]">
                {t("PST")} ({billing.pstPct}%)
              </dt>
              <dd className="ops-num">{formatCents(preview.pstCents)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3 border-t border-[var(--ops-border)] pt-2 text-base font-semibold">
            <dt>{t("Total")}</dt>
            <dd className="ops-num">{formatCents(preview.totalCents)}</dd>
          </div>
        </dl>

        <button
          type="button"
          className="ops-btn mt-4 w-full"
          data-variant="primary"
          disabled={pending}
          onClick={submit}
        >
          {pending
            ? t("Saving…")
            : mode === "edit"
              ? t("Save changes")
              : t("Create draft invoice")}
        </button>
        {error ? (
          <p role="alert" className="mt-2 text-sm text-[var(--ops-lost-ink)]">
            {error}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
