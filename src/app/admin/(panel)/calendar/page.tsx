import Link from "next/link";
import { CalendarBoard, type CalendarJob } from "@/components/admin/CalendarBoard";
import { JobDetailPanel } from "@/components/admin/JobDetailPanel";
import {
  addDays,
  fromDateKey,
  startOfDay,
  toDateKey,
  weekDays,
} from "@/lib/admin/crm";
import { clientNamesFor, getJob, listJobsBetween, listUnscheduledJobs } from "@/lib/admin/crm-data";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Calendar" };
export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CalendarPage({ searchParams }: PageProps<"/admin/calendar">) {
  const params = await searchParams;
  const t = await getT();
  const now = new Date();

  const view = first(params.view) === "day" ? "day" : "week";
  const anchor = fromDateKey(first(params.date) ?? "", now);
  const days = view === "day" ? [startOfDay(anchor)] : weekDays(anchor);

  const rangeStart = days[0];
  const rangeEnd = addDays(days[days.length - 1], 1);

  const [scheduled, unscheduled] = await Promise.all([
    listJobsBetween(rangeStart, rangeEnd),
    listUnscheduledJobs(),
  ]);

  const names = await clientNamesFor(
    [...scheduled, ...unscheduled].map((job) => job.clientId).filter((id): id is number => id !== null),
  );
  const decorate = (rows: typeof scheduled): CalendarJob[] =>
    rows.map((job) => ({ ...job, clientName: job.clientId ? names.get(job.clientId) ?? null : null }));

  const selectedId = Number(first(params.job) ?? "");
  const selected = Number.isInteger(selectedId) && selectedId > 0 ? await getJob(selectedId) : null;

  const prev = toDateKey(addDays(rangeStart, view === "day" ? -1 : -7));
  const next = toDateKey(addDays(rangeStart, view === "day" ? 1 : 7));
  // As UrlObjects rather than template strings: `typedRoutes` can check a
  // pathname plus a query object, but not a query string built by hand.
  const step = (date: string) => ({ pathname: "/admin/calendar" as const, query: { view, date } });

  return (
    <div className="mx-auto max-w-[100rem]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ops-label">{t("Calendar")}</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">
            {scheduled.length} {t("scheduled")} · {unscheduled.length} {t("waiting")}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={step(prev)} className="ops-btn" data-variant="ghost" aria-label="Previous">
            ←
          </Link>
          <Link
            href={{ pathname: "/admin/calendar", query: { view } }}
            className="ops-btn"
            data-variant="ghost"
          >
            {t("Today")}
          </Link>
          <Link href={step(next)} className="ops-btn" data-variant="ghost" aria-label="Next">
            →
          </Link>
          <Link
            href={{ pathname: "/admin/calendar", query: { view: "week", date: toDateKey(anchor) } }}
            className="ops-btn"
            data-variant={view === "week" ? "navy" : "ghost"}
          >
            {t("Week")}
          </Link>
          <Link
            href={{ pathname: "/admin/calendar", query: { view: "day", date: toDateKey(anchor) } }}
            className="ops-btn"
            data-variant={view === "day" ? "navy" : "ghost"}
          >
            {t("Day")}
          </Link>
        </div>
      </div>

      {selected ? (
        <div className="mt-4">
          <JobDetailPanel
            job={selected}
            clientName={selected.clientId ? names.get(selected.clientId) ?? null : null}
          />
        </div>
      ) : null}

      <div className="mt-4">
        <CalendarBoard
          jobs={decorate(scheduled)}
          unscheduled={decorate(unscheduled)}
          dayKeys={days.map(toDateKey)}
          view={view}
          todayKey={toDateKey(now)}
        />
      </div>
    </div>
  );
}
