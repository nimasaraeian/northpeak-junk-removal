import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { BriefingRunButton } from "@/components/admin/BriefingRunButton";
import { CopyButton } from "@/components/admin/CopyButton";
import {
  buildBriefingData,
  generateActionPlan,
  type ActionPlan,
  type ActionPlanItem,
} from "@/lib/office-manager/briefing";
import type { JobRow, LeadRow } from "@/lib/db/schema";

export const metadata = { title: "Today" };
export const dynamic = "force-dynamic";

const TZ = "America/Vancouver";
const PRIORITY_TONE: Record<ActionPlanItem["priority"], string> = {
  high: "lost",
  medium: "draft",
  low: "sent",
};

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

function dollars(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-CA")}`;
}

function LeadRowItem({ lead, plan }: { lead: LeadRow; plan?: ActionPlan }) {
  const contact = lead.phone?.trim() || lead.email?.trim() || "no contact on file";
  const item = plan?.get(lead.id);
  return (
    <div className="p-3">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/admin/leads/${lead.id}` as Route} className="min-w-0 hover:underline">
          <p className="text-sm font-semibold text-[var(--ops-navy)]">
            {lead.name || "Unnamed lead"}
            {lead.area?.trim() ? (
              <span className="font-normal text-[var(--ops-muted)]"> · {lead.area}</span>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ops-muted)]">
            {contact} · {lead.source}
          </p>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {item ? (
            <span className="ops-pill" data-status={PRIORITY_TONE[item.priority]}>
              {item.priority}
            </span>
          ) : null}
          <span className="text-xs text-[var(--ops-muted)]">{daysOld(lead.createdAt)}d</span>
        </div>
      </div>

      {item?.why ? (
        <p className="mt-2 text-xs text-[var(--ops-navy)]">
          <span className="font-semibold">Why:</span> {item.why}
        </p>
      ) : null}

      {item?.draftSms ? (
        <div className="mt-2 rounded-xl border border-[var(--ops-border)] bg-[var(--ops-surface-2)] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.7rem] font-semibold tracking-[0.1em] text-[var(--ops-muted)] uppercase">
              Draft SMS — not sent
            </p>
            <CopyButton text={item.draftSms} />
          </div>
          <p className="mt-1.5 text-sm leading-6 text-[var(--ops-navy)]">{item.draftSms}</p>
        </div>
      ) : null}
    </div>
  );
}

function JobRowItem({ job }: { job: JobRow }) {
  const firstNote = (job.notes ?? "").split("\n")[0] ?? "";
  return (
    <Link
      href={"/admin/calendar" as Route}
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
  const plan = await generateActionPlan(data);

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
        A read-only summary from your CRM, with a drafted message ready to copy for each lead.
        Nothing here is sent and nothing in the CRM changes — the same briefing goes to Telegram each
        evening.
      </p>

      {data.pendingQuotes.length > 0 ? (
        <div className="ops-card mt-4 flex flex-wrap items-center justify-between gap-2 p-4">
          <p className="text-sm text-[var(--ops-muted)]">💰 Value awaiting a reply</p>
          <p className="text-lg font-semibold text-[var(--ops-navy)]">
            {dollars(data.valueAtRiskLowCents)}–{dollars(data.valueAtRiskHighCents)}
            <span className="ml-2 text-sm font-normal text-[var(--ops-muted)]">
              in {data.pendingQuotes.length} quote{data.pendingQuotes.length === 1 ? "" : "s"}
            </span>
          </p>
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        <Section title="🆕 New leads to answer" count={data.newLeads.length} empty="Inbox clear — no new leads.">
          {data.newLeads.map((l) => (
            <LeadRowItem key={l.id} lead={l} plan={plan} />
          ))}
        </Section>

        <Section title="⏰ Overdue follow-ups" count={data.overdueFollowUps.length} empty="Nothing overdue.">
          {data.overdueFollowUps.map((l) => (
            <LeadRowItem key={l.id} lead={l} plan={plan} />
          ))}
        </Section>

        <Section
          title="💬 Quotes awaiting a reply"
          count={data.awaitingReply.length}
          empty="No quotes waiting on a customer."
        >
          {data.awaitingReply.map((l) => (
            <LeadRowItem key={l.id} lead={l} plan={plan} />
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
