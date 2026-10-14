"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInvoiceFromQuoteAction } from "@/lib/admin/billing-actions";
import { useT } from "@/lib/i18n/provider";

/** "Raise invoice" on a won quote — prefills a draft and opens it. */
export function QuoteToInvoiceButton({ quoteId }: { quoteId: number }) {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        className="ops-btn"
        data-variant="navy"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await createInvoiceFromQuoteAction(quoteId);
            if (!result.ok || !result.id) {
              setError(result.error ?? t("Could not create that invoice."));
              return;
            }
            router.push(`/admin/billing/${result.id}`);
            router.refresh();
          });
        }}
      >
        {pending ? t("Creating…") : t("Raise invoice")}
      </button>
      {error ? (
        <span className="ms-2 text-xs text-[var(--ops-lost-ink)]">{error}</span>
      ) : null}
    </>
  );
}
