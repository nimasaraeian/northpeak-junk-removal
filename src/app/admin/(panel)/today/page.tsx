import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { BriefingRunButton } from "@/components/admin/BriefingRunButton";
import { buildBriefingData } from "@/lib/office-manager/briefing";
import type { JobRow, LeadRow } from "@/lib/db/schema";

export const metadata = { title: "Today" };
export const dynamic = "force-dynamic";

const TZ = "America/Vancouver";

function daysOld(created: Date): number {
  return Math.max(0, Math.floor((Date.now() - new Date(created).getTime()) / 86400000));
}

function vanTime(d: Date | null): string {
  if (!d) return "unscheduled";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(d));
}

function LeadRowItem({ lead }: { lead: LeadRow }) {
  const contact = lead.phone?.trim() || lead.email?.trim() || "no contact on file";
  return (
    <Link
      href={`/admin/leads/${lead.id}` as Route}
      className="flex items-start justify-between gap-3 p-3 transition-colors hover:bg-[var(--ops-surface-2)]"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--ops-navy)]">
          {lead.name || "Unnamed lead"}
          {lead.area?.trim() ? (
            <span className="font-normal text-[var(--ops-muted)]"> · {lead.area}</span>
          ) : null}
        </p>
        <p className="mt-0.5 text-xs text-[var(--ops-muted)]">
          {contact} · {lead.source}
        </p>
      </div>
      <span className="shrink-0 text-xs text-[var(--ops-muted)]">{daysOld(lead.createdAt)}d</span>
    </Link>
  );
}

function JobRowItem({ job }: { job: JobRow }) {
  const firstNote = (job.notes ?? "").split("\n")[0] ?? "";
  return (
    <Link
      href={`/admin/calendar` as Route}
      className="flex items-start justify-between gap-3 p-3 transition-colors hover:bg-[var(--ops-surface-2)]"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--ops-navy)]">
          {job.address?.trim() ? job.address : "⚠ No address on file"}
        </p>
        {firstNote ? (
          <p className="mt-0.5 truncate text-xs text-[var(--ops-muted)]">{firstNote}</p>
        ) : null}
      </div>
      <span className="shrink-0 text-xs font-semibold text-[var(--ops-navy)]">
        {vanTime(job.scheduledStart)}
      </span>
    </Link>
  );
}

function Section({
  title,
  count,
  empty,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  children?: ReactNode;
}) {
  return (
    <section className="ops-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--ops-border)] p-4">
        <p className="text-sm font-semibold text-[var(--ops-navy)]">{title}</p>
        <span className="ops-pill" data-status={count > 0 ? "draft" : "won"}>
          {count}
        </span>
      </div>
      {count > 0 ? (
        <div className="divide-y divide-[var(--ops-border)]">{children}</div>
      ) : (
        <p className="p-4 text-sm text-[var(--ops-muted)]">{empty}</p>
      )}
    </section>
  );
}

export default async function TodayPage() {
  const data = await buildBriefingData();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ops-label">Office Manager</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">What needs you today</h1>
        </div>
        <BriefingRunButton />
      </div>

      <p className="mt-3 text-sm text-[var(--ops-muted)]">
        A read-only summary from your CRM. Nothing here sends a message or changes a record — it
        just surfaces what&apos;s waiting. The same briefing goes to Telegram each evening.
      </p>

      <div className="mt-5 space-y-4">
        <Section title="🆕 New leads to answer" count={data.newLeads.length} empty="Inbox clear — no new leads.">
          {data.newLeads.map((l) => (
            <LeadRowItem key={l.id} lead={l} />
          ))}
        </Section>

        <Section
          title="⏰ Overdue follow-ups"
          count={data.overdueFollowUps.length}
          empty="Nothing overdue."
        >
          {data.overdueFollowUps.map((l) => (
            <LeadRowItem key={l.id} lead={l} />
          ))}
        </Section>

        <Section
          title="💬 Quotes awaiting a reply"
          count={data.awaitingReply.length}
          empty="No quotes waiting on a customer."
        >
          {data.awaitingReply.map((l) => (
            <LeadRowItem key={l.id} lead={l} />
          ))}
        </Section>

        <Section
          title={`🗓 Tomorrow's jobs — ${data.tomorrowLabel}`}
          count={data.tomorrowJobs.length}
          empty="No jobs scheduled for tomorrow."
        >
          {data.tomorrowJobs.map((j) => (
            <JobRowItem key={j.id} job={j} />
          ))}
        </Section>

        <Section
          title="⚠ Records missing contact info"
          count={data.incompleteLeads.length}
          empty="Every open lead has contact details."
        >
          {data.incompleteLeads.map((l) => (
            <LeadRowItem key={l.id} lead={l} />
          ))}
        </Section>
      </div>
    </div>
  );
}
