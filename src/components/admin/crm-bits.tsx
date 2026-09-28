import Link from "next/link";
import {
  ageLabel,
  followUpLabel,
  isFollowUpOverdue,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_TONE,
  ownerInitials,
} from "@/lib/admin/crm";
import type { ActivityRow, LeadRow, LeadSource, LeadStatus } from "@/lib/db/schema";

/**
 * Small shared pieces for the CRM screens, so the pipeline card, the client
 * page and the calendar all render a source badge or a timeline the same way.
 */

export function LeadStatusPill({ status }: { status: LeadStatus }) {
  return (
    <span className="ops-pill" data-status={LEAD_STATUS_TONE[status]}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}

export function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span className="rounded bg-[var(--ops-surface-2)] px-1.5 py-0.5 text-[0.68rem] font-semibold text-[var(--ops-muted)]">
      {LEAD_SOURCE_LABELS[source]}
    </span>
  );
}

export function OwnerChip({ owner }: { owner: string }) {
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ops-navy)] text-[0.62rem] font-bold text-white"
      title={owner}
      aria-label={`Owner: ${owner}`}
    >
      {ownerInitials(owner)}
    </span>
  );
}

export function FollowUpChip({
  nextFollowUpAt,
  now,
}: {
  nextFollowUpAt: Date | null;
  now: Date;
}) {
  const label = followUpLabel(nextFollowUpAt, now);
  if (!label) return null;

  const overdue = isFollowUpOverdue(nextFollowUpAt, now);
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[0.68rem] font-semibold"
      style={{
        background: overdue ? "var(--ops-lost-bg)" : "var(--ops-surface-2)",
        color: overdue ? "var(--ops-lost-ink)" : "var(--ops-muted)",
      }}
    >
      {label}
    </span>
  );
}

/** The card body, shared by the board and any list that shows a lead. */
export function LeadCardBody({ lead, now }: { lead: LeadRow; now: Date }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold leading-5 text-[var(--ops-navy)]">
          {lead.name || "Unnamed lead"}
        </span>
        <OwnerChip owner={lead.owner} />
      </div>
      <p className="mt-0.5 text-xs text-[var(--ops-muted)]">{lead.area || "No area"}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <SourceBadge source={lead.source} />
        <FollowUpChip nextFollowUpAt={lead.nextFollowUpAt} now={now} />
        <span className="ops-num ml-auto text-[0.68rem] text-[var(--ops-faint)]">
          {ageLabel(lead.createdAt, now)}
        </span>
      </div>
    </>
  );
}

const timelineFormat = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "medium",
  timeStyle: "short",
});

const KIND_LABELS: Record<string, string> = {
  note: "Note",
  status_change: "Status",
  call: "Call",
  sms: "SMS",
  system: "System",
};

export function ActivityTimeline({ rows }: { rows: ActivityRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-[var(--ops-muted)]">
        Nothing logged yet. Calls, notes and status changes land here.
      </p>
    );
  }

  return (
    <ol className="mt-2 grid gap-0">
      {rows.map((row, index) => (
        <li key={row.id} className="relative flex gap-3 pb-4 pl-1">
          <div className="flex flex-col items-center">
            <span
              aria-hidden
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{
                background:
                  row.kind === "status_change" ? "var(--ops-gold)" : "var(--ops-border-strong)",
              }}
            />
            {index < rows.length - 1 ? (
              <span aria-hidden className="w-px flex-1 bg-[var(--ops-border)]" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-6 text-[var(--ops-text)]">{row.body}</p>
            <p className="text-xs text-[var(--ops-faint)]">
              {KIND_LABELS[row.kind] ?? row.kind} · {row.actor} ·{" "}
              {timelineFormat.format(row.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="px-4 py-14 text-center">
      <p className="text-sm font-semibold text-[var(--ops-navy)]">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[var(--ops-muted)]">{body}</p>
      {action ? (
        <div className="mt-4">
          <Link href={action.href as never} className="ops-btn" data-variant="primary">
            {action.label}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
