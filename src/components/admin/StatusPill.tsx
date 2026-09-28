import type { QuoteStatus } from "@/lib/db/schema";

export const QUOTE_STATUSES: QuoteStatus[] = ["draft", "sent", "won", "lost"];

const LABELS: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  won: "Won",
  lost: "Lost",
};

export function StatusPill({ status }: { status: QuoteStatus }) {
  return (
    <span className="ops-pill" data-status={status}>
      {LABELS[status] ?? status}
    </span>
  );
}

export function statusLabel(status: QuoteStatus): string {
  return LABELS[status] ?? status;
}
