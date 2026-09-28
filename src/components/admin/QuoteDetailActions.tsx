"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QUOTE_STATUSES } from "@/components/admin/StatusPill";
import { updateQuoteNotesAction, updateQuoteStatusAction } from "@/lib/admin/actions";
import { buildCustomerText } from "@/lib/admin/customer-text";
import type { QuoteRow, QuoteStatus } from "@/lib/db/schema";

/**
 * Status buttons, notes, and "Copy customer text" on a saved quote.
 *
 * The customer text is rebuilt from the stored row rather than kept as a
 * snapshot, so a quote re-sent later carries the range it was actually saved
 * with.
 */
export function QuoteDetailActions({
  quote,
  operator,
}: {
  quote: QuoteRow;
  operator: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState(quote.notes);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setStatus(status: QuoteStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateQuoteStatusAction(quote.id, status);
      if (!result.ok) {
        setError(result.error ?? "That did not save.");
        return;
      }
      router.refresh();
    });
  }

  function saveNotes() {
    setError(null);
    startTransition(async () => {
      const result = await updateQuoteNotesAction(quote.id, notes);
      if (!result.ok) setError(result.error ?? "Those notes did not save.");
      else router.refresh();
    });
  }

  async function copyCustomerText() {
    const text = buildCustomerText({
      customerName: quote.customerName,
      items: quote.itemLines.map((line) => ({ label: line.label, qty: line.qty })),
      computation: quote.computed,
      heavyMaterial: quote.heavy?.materialType ?? null,
      operatorName: operator,
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not reach the clipboard on this device.");
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="ops-label">Status</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUOTE_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className="ops-btn"
              data-variant={quote.status === status ? "navy" : "ghost"}
              disabled={pending || quote.status === status}
              onClick={() => setStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="ops-label">Notes</p>
        <textarea
          className="ops-textarea mt-2"
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <button
          type="button"
          className="ops-btn mt-2"
          data-variant="ghost"
          disabled={pending || notes === quote.notes}
          onClick={saveNotes}
        >
          Save notes
        </button>
      </div>

      <button
        type="button"
        className="ops-btn"
        data-variant="primary"
        onClick={() => void copyCustomerText()}
      >
        {copied ? "Copied" : "Copy customer text"}
      </button>

      {error ? (
        <p role="alert" className="text-sm text-[var(--ops-lost-ink)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
