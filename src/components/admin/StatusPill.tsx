"use client";

import { useT } from "@/lib/i18n/provider";
import type { QuoteStatus } from "@/lib/db/schema";

export const QUOTE_STATUSES: QuoteStatus[] = ["draft", "sent", "won", "lost"];

const LABELS: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  won: "Won",
  lost: "Lost",
};

export function StatusPill({ status }: { status: QuoteStatus }) {
  const { t } = useT();
  return (
    <span className="ops-pill" data-status={status}>
      {t(LABELS[status] ?? status)}
    </span>
  );
}

/** Non-hook label, for places that already have a translate function. */
export function statusLabel(status: QuoteStatus): string {
  return LABELS[status] ?? status;
}
