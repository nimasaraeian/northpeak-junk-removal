import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { BriefingRunButton } from "@/components/admin/BriefingRunButton";
import { BriefingSummary, LeadDraftCard, LeadPriorityPill } from "@/components/admin/LeadDraft";
import { buildBriefingData, generateActionPlan, type ActionPlan } from "@/lib/office-manager/briefing";
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

function dollars(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-CA")}`;
}

function DraftSkeleton() {
  return (
    <p className="mt-2 text-xs text-[var(--ops-muted)]">
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--ops-gold)]" /> Drafting…
    </p>
  );
}

function SummarySkeleton() {
  return (
    <div className="ops-card mt-4 p-4">
      <p dir="rtl" className="text-sm text-[var(--ops-muted)]">
        <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--ops-gold)]" />
        در حال تحلیل امروز…
      </p>
    </div>
  );
}

function UnscheduledJobRowItem({ job }: { job: JobRow }) {
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
      <span className="shrink-0 text-xs font-semibold text-[var(--ops-gold-ink)]">needs a date</span>
    </Link>
  );
}

function LeadRowItem({ lead, planPromise }: { lead: LeadRow; planPromise?: Promise<ActionPlan> }) {
  const contact = lead.phone?.trim() || lead.email?.trim() || "no contact on file";
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
          {planPromise ? (
            <Suspense fallback={null}>
              <LeadPriorityPill leadId={lead.id} planPromise={planPromise} />
            </Suspense>
          ) : null}
          <span className="text-xs text-[var(--ops-muted)]">{daysOld(lead.createdAt)}d</span>
        </div>
      </div>

      {planPromise ? (
        <Suspense fallback={<DraftSkeleton />}>
          <LeadDraftCard leadId={lead.id} planPromise={planPromise} />
        </Suspense>
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
  // Only the database read is awaited — the lists render immediately. The
  // Anthropic action plan is started here but NOT awaited; it is handed to the
  // rows as a promise and streamed in through their Suspense boundaries, so the
  // model call never holds up the page.
  const data = await buildBriefingData();
  const resultPromise = generateActionPlan(data);
  const planPromise = resultPromise.then((r) => r.plan);

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

      <Suspense fallback={<SummarySkeleton />}>
        <BriefingSummary resultPromise={resultPromise} />
      </Suspense>

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
            <LeadRowItem key={l.id} lead={l} planPromise={planPromise} />
          ))}
        </Section>

        <Section title="⏰ Overdue follow-ups" count={data.overdueFollowUps.length} empty="Nothing overdue.">
          {data.overdueFollowUps.map((l) => (
            <LeadRowItem key={l.id} lead={l} planPromise={planPromise} />
          ))}
        </Section>

        <Section
          title="💬 Quotes awaiting a reply"
          count={data.awaitingReply.length}
          empty="No quotes waiting on a customer."
        >
          {data.awaitingReply.map((l) => (
            <LeadRowItem key={l.id} lead={l} planPromise={planPromise} />
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
          title="📌 Booked but not scheduled"
          count={data.unscheduledJobs.length}
          empty="No jobs waiting for a date."
        >
          {data.unscheduledJobs.map((j) => (
            <UnscheduledJobRowItem key={j.id} job={j} />
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
