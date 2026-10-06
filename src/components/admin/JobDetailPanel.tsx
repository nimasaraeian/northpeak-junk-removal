"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateJobAssigneeAction,
  updateJobChecklistAction,
  updateJobStatusAction,
} from "@/lib/admin/crm-actions";
import { ASSIGNEE_TONE } from "@/lib/admin/crm";
import { JOB_ASSIGNEES, JOB_STATUSES, type JobRow } from "@/lib/db/schema";
import { useT } from "@/lib/i18n/provider";

/**
 * The panel that opens when a calendar block is clicked.
 *
 * Checklist ticks save immediately — a crew member on site is not going to
 * hunt for a save button with wet hands. Photo slots are deliberately absent:
 * the columns exist, the upload is v3.
 */
export function JobDetailPanel({
  job,
  clientName,
}: {
  job: JobRow;
  clientName: string | null;
}) {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [checklist, setChecklist] = useState(job.checklist);
  const [error, setError] = useState<string | null>(null);

  function run(work: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await work();
      if (!result.ok) setError(result.error ?? t("That did not save."));
      router.refresh();
    });
  }

  function toggle(index: number) {
    const next = checklist.map((item, i) => (i === index ? { ...item, done: !item.done } : item));
    setChecklist(next);
    run(() => updateJobChecklistAction(job.id, next));
  }

  const doneCount = checklist.filter((item) => item.done).length;

  return (
    <section className="ops-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-1 h-8 w-1.5 shrink-0 rounded-full"
            style={{ background: ASSIGNEE_TONE[job.assignedTo] }}
          />
          <div>
            <h2 className="text-base font-semibold text-[var(--ops-navy)]">
              {clientName ?? `Job #${job.id}`}
            </h2>
            <p className="text-sm text-[var(--ops-muted)]">
              {job.address || t("No address")}
              {job.scheduledStart
                ? ` · ${job.scheduledStart.toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}`
                : ` · ${t("unscheduled")}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {job.clientId ? (
            <Link href={`/admin/clients/${job.clientId}`} className="ops-btn" data-variant="ghost">
              {t("Client")}
            </Link>
          ) : null}
          {job.quoteId ? (
            <Link href={`/admin/quotes/${job.quoteId}`} className="ops-btn" data-variant="ghost">
              {t("Quote")} #{job.quoteId}
            </Link>
          ) : null}
          <Link href="/admin/calendar" className="ops-btn" data-variant="ghost">
            {t("Close")}
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
        <div>
          <p className="ops-label">
            {t("Checklist")} · {doneCount}/{checklist.length}
          </p>
          {checklist.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--ops-muted)]">{t("No checklist on this job.")}</p>
          ) : (
            <ul className="mt-2 grid gap-1.5">
              {checklist.map((item, index) => (
                <li key={`${item.label}-${index}`}>
                  <label className="flex items-start gap-2 text-sm text-[var(--ops-text)]">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={item.done}
                      disabled={pending}
                      onChange={() => toggle(index)}
                    />
                    <span style={item.done ? { textDecoration: "line-through", opacity: 0.6 } : undefined}>
                      {item.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          {job.notes ? (
            <>
              <p className="ops-label mt-4">{t("Notes")}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[var(--ops-text)]">
                {job.notes}
              </p>
            </>
          ) : null}
        </div>

        <div className="grid gap-3">
          <label className="block">
            <span className="ops-label">{t("Status")}</span>
            <select
              className="ops-select mt-1.5"
              value={job.status}
              disabled={pending}
              onChange={(event) => run(() => updateJobStatusAction(job.id, event.target.value))}
            >
              {JOB_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(({scheduled:"Scheduled",in_progress:"In progress",done:"Done",cancelled:"Cancelled"})[status] ?? status)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="ops-label">{t("Assigned to")}</span>
            <select
              className="ops-select mt-1.5"
              value={job.assignedTo}
              disabled={pending}
              onChange={(event) => run(() => updateJobAssigneeAction(job.id, event.target.value))}
            >
              {JOB_ASSIGNEES.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-[var(--ops-faint)]">
            {t("Before/after photos land in v3 — the fields are already on the job.")}
          </p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-[var(--ops-lost-ink)]">
          {error}
        </p>
      ) : null}
    </section>
  );
}
