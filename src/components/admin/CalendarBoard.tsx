"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ASSIGNEE_TONE,
  calendarHours,
  CALENDAR_DAY_START_HOUR,
  DEFAULT_JOB_HOURS,
  formatHour,
  isSameDay,
  jobBlockPosition,
  rescheduleJob,
  toDateKey,
} from "@/lib/admin/crm";
import { rescheduleJobAction } from "@/lib/admin/crm-actions";
import type { JobRow } from "@/lib/db/schema";

/**
 * Week and day calendar.
 *
 * Same reasoning as the pipeline board: HTML5 drag for a mouse, and an
 * explicit control for touch. A phone gets the agenda list instead of a
 * grid, because a seven-column week at 375px is unreadable and dragging in
 * it is worse.
 *
 * Every job block is coloured by assignee, so who is where reads at a
 * glance without opening anything.
 */

export interface CalendarJob extends JobRow {
  clientName: string | null;
}

interface CalendarBoardProps {
  jobs: CalendarJob[];
  unscheduled: CalendarJob[];
  /** Days rendered by the server, as date keys, so no clock runs twice. */
  dayKeys: string[];
  view: "week" | "day";
  todayKey: string;
}

const dayLabel = new Intl.DateTimeFormat("en-CA", { weekday: "short", day: "numeric" });
const timeLabel = new Intl.DateTimeFormat("en-CA", { hour: "numeric", minute: "2-digit" });

function keyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function CalendarBoard({
  jobs,
  unscheduled,
  dayKeys,
  view,
  todayKey,
}: CalendarBoardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dragging, setDragging] = useState<CalendarJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => dayKeys.map(keyToDate), [dayKeys]);
  const hours = useMemo(() => calendarHours(), []);

  function drop(job: CalendarJob, day: Date, hour: number) {
    setError(null);
    const { scheduledStart, scheduledEnd } = rescheduleJob(job, day, hour);

    startTransition(async () => {
      const result = await rescheduleJobAction(
        job.id,
        scheduledStart.toISOString(),
        scheduledEnd.toISOString(),
      );
      if (!result.ok) setError(result.error ?? "That did not reschedule.");
      router.refresh();
    });
  }

  const allJobs = [...jobs];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <div>
        {error ? (
          <p role="alert" className="mb-3 rounded-lg border border-[#e7bcbc] bg-[var(--ops-lost-bg)] px-3 py-2 text-sm text-[var(--ops-lost-ink)]">
            {error}
          </p>
        ) : null}

        {/* Phone: a single-day agenda. Grids do not work at 375px. */}
        <div className="lg:hidden">
          {days.map((day) => {
            const dayJobs = allJobs
              .filter((job) => job.scheduledStart && isSameDay(job.scheduledStart, day))
              .sort(
                (a, b) =>
                  (a.scheduledStart?.getTime() ?? 0) - (b.scheduledStart?.getTime() ?? 0),
              );
            if (view === "week" && dayJobs.length === 0) return null;

            return (
              <section key={toDateKey(day)} className="mb-3">
                <h2 className="ops-label mb-1.5">
                  {dayLabel.format(day)}
                  {toDateKey(day) === todayKey ? " · today" : ""}
                </h2>
                {dayJobs.length === 0 ? (
                  <p className="ops-card px-3 py-5 text-center text-sm text-[var(--ops-muted)]">
                    Nothing booked.
                  </p>
                ) : (
                  <ul className="grid gap-2">
                    {dayJobs.map((job) => (
                      <li key={job.id}>
                        <Link
                          href={`/admin/calendar?job=${job.id}`}
                          className="ops-card flex items-center gap-3 p-3"
                        >
                          <span
                            aria-hidden
                            className="h-9 w-1.5 shrink-0 rounded-full"
                            style={{ background: ASSIGNEE_TONE[job.assignedTo] }}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-[var(--ops-navy)]">
                              {job.clientName ?? `Job #${job.id}`}
                            </span>
                            <span className="ops-num block text-xs text-[var(--ops-muted)]">
                              {job.scheduledStart ? timeLabel.format(job.scheduledStart) : ""} ·{" "}
                              {job.assignedTo}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {/* Desktop: the grid. */}
        <div className="ops-card hidden overflow-hidden lg:block">
          <div
            className="grid border-b border-[var(--ops-border)]"
            style={{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))` }}
          >
            <div />
            {days.map((day) => (
              <div
                key={toDateKey(day)}
                className="border-l border-[var(--ops-border)] px-2 py-2 text-center text-xs font-semibold"
                style={{
                  color:
                    toDateKey(day) === todayKey ? "var(--ops-gold-ink)" : "var(--ops-muted)",
                }}
              >
                {dayLabel.format(day)}
              </div>
            ))}
          </div>

          <div
            className="relative grid"
            style={{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))` }}
          >
            <div className="grid" style={{ gridTemplateRows: `repeat(${hours.length}, 3.5rem)` }}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="ops-num border-t border-[var(--ops-border)] pr-1.5 pt-0.5 text-right text-[0.68rem] text-[var(--ops-faint)]"
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {days.map((day) => (
              <div key={toDateKey(day)} className="relative border-l border-[var(--ops-border)]">
                <div className="grid" style={{ gridTemplateRows: `repeat(${hours.length}, 3.5rem)` }}>
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="border-t border-[var(--ops-border)] transition-colors hover:bg-[var(--ops-surface-2)]"
                      onDragOver={(event) => {
                        if (dragging) event.preventDefault();
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (dragging) drop(dragging, day, hour);
                        setDragging(null);
                      }}
                    >
                      <Link
                        href={`/admin/calendar?new=${toDateKey(day)}T${String(hour).padStart(2, "0")}`}
                        className="block h-full w-full"
                        aria-label={`Book ${dayLabel.format(day)} at ${formatHour(hour)}`}
                      />
                    </div>
                  ))}
                </div>

                {allJobs.map((job) => {
                  const position = jobBlockPosition(job, day);
                  if (!position) return null;
                  return (
                    <Link
                      key={job.id}
                      href={`/admin/calendar?job=${job.id}`}
                      draggable
                      onDragStart={() => setDragging(job)}
                      onDragEnd={() => setDragging(null)}
                      className="absolute left-1 right-1 overflow-hidden rounded-md px-1.5 py-1 text-[0.68rem] font-semibold text-white shadow-[var(--ops-shadow-card)]"
                      style={{
                        top: `${position.topPct}%`,
                        height: `${position.heightPct}%`,
                        background: ASSIGNEE_TONE[job.assignedTo],
                        opacity: job.status === "cancelled" ? 0.45 : 1,
                      }}
                    >
                      {job.clientName ?? `Job #${job.id}`}
                      <span className="block font-normal opacity-80">{job.assignedTo}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side rail: booked work with no date yet. */}
      <aside className="ops-card h-fit p-3">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">Unscheduled</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--ops-muted)]">
          Drag onto a slot, or use the day picker on a phone.
        </p>

        {unscheduled.length === 0 ? (
          <p className="py-6 text-center text-xs text-[var(--ops-faint)]">
            Nothing waiting. Won quotes land here via &ldquo;Schedule this job&rdquo;.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {unscheduled.map((job) => (
              <li
                key={job.id}
                draggable
                onDragStart={() => setDragging(job)}
                onDragEnd={() => setDragging(null)}
                className="rounded-lg border border-[var(--ops-border)] bg-[var(--ops-surface-2)] p-2.5"
              >
                <span className="block text-sm font-semibold text-[var(--ops-navy)]">
                  {job.clientName ?? `Job #${job.id}`}
                </span>
                <span className="block text-xs text-[var(--ops-muted)]">
                  {job.address || "No address"}
                </span>

                {/* Touch path: pick a day rather than dragging. */}
                <label className="mt-1.5 block">
                  <span className="sr-only">Schedule {job.clientName ?? `job ${job.id}`}</span>
                  <input
                    type="date"
                    className="ops-input text-xs"
                    disabled={pending}
                    onChange={(event) => {
                      if (!event.target.value) return;
                      drop(job, keyToDate(event.target.value), CALENDAR_DAY_START_HOUR + 1);
                    }}
                  />
                </label>
                <p className="mt-1 text-[0.68rem] text-[var(--ops-faint)]">
                  Lands at {formatHour(CALENDAR_DAY_START_HOUR + 1)}, {DEFAULT_JOB_HOURS}h
                </p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
