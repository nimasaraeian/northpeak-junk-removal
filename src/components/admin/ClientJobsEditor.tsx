"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  rescheduleJobAction,
  updateJobAssigneeAction,
  updateJobStatusAction,
} from "@/lib/admin/crm-actions";
import { rescheduleJob, CALENDAR_DAY_START_HOUR } from "@/lib/admin/crm";
import { JOB_ASSIGNEES, JOB_STATUSES, type JobRow } from "@/lib/db/schema";
import { useT } from "@/lib/i18n/provider";

/**
 * A client's jobs, editable in place.
 *
 * Status, crew and date change right here on the customer's file — no round
 * trip to the calendar — using the same actions the calendar does. A link to
 * the calendar stays for the full job view (checklist, notes).
 */

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

function assigneeLabel(a: string): string {
  if (a === "both") return "Both";
  if (a === "unassigned") return "Unassigned";
  return a;
}

const dateFmt = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" });

function isoDate(d: Date | null): string {
  if (!d) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function keyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function ClientJobsEditor({ jobs }: { jobs: JobRow[] }) {
  const router = useRouter();
  const { t } = useT();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function run(p: Promise<{ ok: boolean; error?: string }>) {
    setErr(null);
    start(async () => {
      const r = await p;
      if (!r.ok) setErr(r.error ?? t("That did not save."));
      router.refresh();
    });
  }

  if (jobs.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-[var(--ops-muted)]">
        {t("No jobs yet. “Schedule job” creates one for the calendar.")}
      </p>
    );
  }

  return (
    <div className="divide-y divide-[var(--ops-border)]">
      {jobs.map((job) => (
        <div key={job.id} className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href={`/admin/calendar?job=${job.id}`}
              className="text-sm font-semibold text-[var(--ops-navy)] hover:underline"
            >
              {t("Job")} #{job.id}
            </Link>
            <span className="ops-num text-xs text-[var(--ops-muted)]">
              {job.scheduledStart ? dateFmt.format(job.scheduledStart) : t("Unscheduled")}
            </span>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <label className="text-xs font-medium text-[var(--ops-muted)]">
              {t("Status")}
              <select
                className="ops-input mt-1 text-sm"
                defaultValue={job.status}
                disabled={pending}
                onChange={(e) => run(updateJobStatusAction(job.id, e.target.value))}
              >
                {JOB_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(STATUS_LABEL[s] ?? s)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-medium text-[var(--ops-muted)]">
              {t("Assignee")}
              <select
                className="ops-input mt-1 text-sm"
                defaultValue={job.assignedTo}
                disabled={pending}
                onChange={(e) => run(updateJobAssigneeAction(job.id, e.target.value))}
              >
                {JOB_ASSIGNEES.map((a) => (
                  <option key={a} value={a}>
                    {a === "both" || a === "unassigned" ? t(assigneeLabel(a)) : a}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-medium text-[var(--ops-muted)]">
              {t("Date")}
              <input
                type="date"
                className="ops-input mt-1 text-sm"
                defaultValue={isoDate(job.scheduledStart)}
                disabled={pending}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const { scheduledStart, scheduledEnd } = rescheduleJob(
                    job,
                    keyToDate(e.target.value),
                    CALENDAR_DAY_START_HOUR + 1,
                  );
                  run(
                    rescheduleJobAction(
                      job.id,
                      scheduledStart.toISOString(),
                      scheduledEnd.toISOString(),
                    ),
                  );
                }}
              />
            </label>
          </div>
        </div>
      ))}
      {err ? <p className="mt-2 px-4 pb-2 text-sm text-[var(--ops-lost-ink)]">{err}</p> : null}
    </div>
  );
}
