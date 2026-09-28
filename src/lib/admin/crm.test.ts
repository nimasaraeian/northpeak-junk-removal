import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  addDays,
  ageLabel,
  allowedTransitions,
  ASSIGNEE_TONE,
  CALENDAR_DAY_END_HOUR,
  CALENDAR_DAY_START_HOUR,
  calendarHours,
  canTransition,
  DEFAULT_JOB_CHECKLIST,
  DEFAULT_JOB_HOURS,
  followUpLabel,
  formatHour,
  fromDateKey,
  isFollowUpOverdue,
  isSameDay,
  jobBlockPosition,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_TONE,
  leadToClientDraft,
  leadToQuotePrefill,
  lifetimeValueCents,
  ownerInitials,
  PIPELINE_ORDER,
  quotePrefillSearchParams,
  quoteToJobDraft,
  requiresLostReason,
  rescheduleJob,
  reviewSmsText,
  shouldAdvanceLeadToQuoted,
  startOfWeek,
  statusChangeBody,
  toDateKey,
  weekDays,
} from "@/lib/admin/crm";
import {
  ACTIVITY_ENTITIES,
  ACTIVITY_KINDS,
  JOB_ASSIGNEES,
  JOB_STATUSES,
  LEAD_ORIGINS,
  LEAD_OWNERS,
  LEAD_SOURCES,
  LEAD_STATUSES,
  type LeadRow,
  type LeadStatus,
  type QuoteRow,
} from "@/lib/db/schema";

const NOW = new Date("2026-06-15T12:00:00Z");

function lead(overrides: Partial<LeadRow> = {}): LeadRow {
  return {
    id: 1,
    createdAt: new Date("2026-06-12T09:00:00Z"),
    clientId: null,
    name: "Dana Reyes",
    phone: "604-555-0134",
    email: "dana@example.com",
    area: "North Vancouver",
    source: "website_form",
    message: "Garage full of boxes",
    status: "new",
    owner: "unassigned",
    nextFollowUpAt: null,
    createdFrom: "website_form",
    lostReason: null,
    ...overrides,
  };
}

function quote(overrides: Partial<QuoteRow> = {}): QuoteRow {
  return {
    id: 7,
    createdAt: NOW,
    createdBy: "Nima",
    customerName: "Dana Reyes",
    customerPhone: "604-555-0134",
    customerArea: "North Vancouver",
    itemLines: [],
    packingPct: 20,
    labor: { stairsFlights: 0, carryDistance: "standard", disassembly: 0 },
    heavyMode: false,
    heavy: null,
    computed: {} as QuoteRow["computed"],
    discount: null,
    finalLowCents: 30_000,
    finalHighCents: 40_000,
    status: "won",
    notes: "Side gate code 4432",
    clientId: 3,
    jobId: null,
    ...overrides,
  };
}

// --- Pipeline transitions --------------------------------------------------

test("the board columns are the published pipeline, in order", () => {
  assert.deepEqual(
    [...PIPELINE_ORDER],
    ["new", "contacted", "quoted", "booked", "won", "lost"],
  );
  assert.deepEqual([...PIPELINE_ORDER], [...LEAD_STATUSES]);
});

test("every stage has a label and a pill tone", () => {
  for (const status of PIPELINE_ORDER) {
    assert.ok(LEAD_STATUS_LABELS[status], `no label for ${status}`);
    assert.ok(
      ["draft", "sent", "won", "lost"].includes(LEAD_STATUS_TONE[status]),
      `${status} maps to a tone the design system does not have`,
    );
  }
});

test("a lead can move freely between the open stages, forwards and back", () => {
  const open: LeadStatus[] = ["new", "contacted", "quoted", "booked"];
  for (const from of open) {
    for (const to of PIPELINE_ORDER) {
      if (from === to) continue;
      assert.equal(canTransition(from, to), true, `${from} → ${to} should be allowed`);
    }
  }
});

test("a lead cannot transition to the stage it is already in", () => {
  for (const status of PIPELINE_ORDER) {
    assert.equal(canTransition(status, status), false);
  }
});

test("won and lost are terminal forwards but can be reopened backwards", () => {
  for (const terminal of ["won", "lost"] as const) {
    assert.equal(canTransition(terminal, "won"), false, `${terminal} → won`);
    assert.equal(canTransition(terminal, "lost"), false, `${terminal} → lost`);
    for (const open of ["new", "contacted", "quoted", "booked"] as const) {
      assert.equal(canTransition(terminal, open), true, `${terminal} → ${open}`);
    }
  }
});

test("allowedTransitions never offers the current stage", () => {
  for (const status of PIPELINE_ORDER) {
    const allowed = allowedTransitions(status);
    assert.equal(allowed.includes(status), false);
    for (const target of allowed) assert.equal(canTransition(status, target), true);
  }
});

test("only lost demands a reason", () => {
  for (const status of PIPELINE_ORDER) {
    assert.equal(requiresLostReason(status), status === "lost");
  }
});

test("a status change writes a readable timeline line", () => {
  assert.equal(statusChangeBody("lead", "new", "contacted"), "Lead moved new → contacted");
  assert.equal(
    statusChangeBody("lead", "quoted", "lost", "went with a cheaper quote"),
    "Lead moved quoted → lost · went with a cheaper quote",
  );
  // A blank reason must not leave a dangling separator.
  assert.equal(statusChangeBody("job", "scheduled", "done", "   "), "Job moved scheduled → done");
});

// --- Card furniture --------------------------------------------------------

test("age reads terse on a card", () => {
  const at = (days: number) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
  assert.equal(ageLabel(NOW, NOW), "today");
  assert.equal(ageLabel(at(1), NOW), "1d");
  assert.equal(ageLabel(at(3), NOW), "3d");
  assert.equal(ageLabel(at(13), NOW), "13d");
  assert.equal(ageLabel(at(21), NOW), "3w");
  assert.equal(ageLabel(at(120), NOW), "4mo");
});

test("a follow-up is overdue only once its moment has passed", () => {
  assert.equal(isFollowUpOverdue(null, NOW), false);
  assert.equal(isFollowUpOverdue(new Date(NOW.getTime() + 1000), NOW), false);
  assert.equal(isFollowUpOverdue(new Date(NOW.getTime() - 1000), NOW), true);
});

test("the follow-up chip names today, tomorrow and overdue", () => {
  assert.equal(followUpLabel(null, NOW), null);
  assert.equal(followUpLabel(new Date("2026-06-15T20:00:00Z"), NOW), "Today");
  assert.match(followUpLabel(new Date("2026-06-12T09:00:00Z"), NOW) ?? "", /^Overdue /);
});

test("owner initials fit a 24px chip, and unassigned has none", () => {
  assert.equal(ownerInitials("Nima"), "NI");
  assert.equal(ownerInitials("Sina"), "SI");
  assert.equal(ownerInitials("unassigned"), "—");
});

// --- Conversions -----------------------------------------------------------

test("lead → quote carries the contact details the estimator needs", () => {
  const prefill = leadToQuotePrefill(lead({ clientId: 9 }));

  assert.deepEqual(prefill, {
    customerName: "Dana Reyes",
    customerPhone: "604-555-0134",
    customerArea: "North Vancouver",
    leadId: 1,
    clientId: 9,
  });
});

test("the quote prefill survives a navigation as query params", () => {
  const params = new URLSearchParams(quotePrefillSearchParams(leadToQuotePrefill(lead())));

  assert.equal(params.get("name"), "Dana Reyes");
  assert.equal(params.get("phone"), "604-555-0134");
  assert.equal(params.get("area"), "North Vancouver");
  assert.equal(params.get("leadId"), "1");
  assert.equal(params.get("clientId"), null, "an unconverted lead has no client");
});

test("a lead with no details produces a prefill with no empty params", () => {
  const params = new URLSearchParams(
    quotePrefillSearchParams(leadToQuotePrefill(lead({ phone: "", area: "" }))),
  );

  assert.equal(params.has("phone"), false);
  assert.equal(params.has("area"), false);
  assert.equal(params.get("leadId"), "1");
});

test("lead → client carries contact details and the enquiry as notes", () => {
  const draft = leadToClientDraft(lead());

  assert.equal(draft.name, "Dana Reyes");
  assert.equal(draft.email, "dana@example.com");
  assert.equal(draft.source, "website_form");
  assert.equal(draft.notes, "Garage full of boxes");
});

test("a lead with no email converts to a client with a null email, not an empty one", () => {
  assert.equal(leadToClientDraft(lead({ email: "" })).email, null);
});

test("quote → job lands unscheduled, with the standard checklist", () => {
  const draft = quoteToJobDraft(quote());

  assert.equal(draft.quoteId, 7);
  assert.equal(draft.clientId, 3);
  assert.equal(draft.assignedTo, "unassigned");
  assert.equal(draft.notes, "Side gate code 4432");
  assert.equal(draft.checklist.length, DEFAULT_JOB_CHECKLIST.length);
  assert.equal(draft.checklist.every((item) => item.done === false), true);
  // Nothing in the draft sets a date: it goes to the calendar's side rail.
  assert.equal("scheduledStart" in draft, false);
});

test("a quote with no client still produces a job", () => {
  assert.equal(quoteToJobDraft(quote({ clientId: null })).clientId, null);
});

test("saving a quote advances only a lead that has not passed Quoted", () => {
  assert.equal(shouldAdvanceLeadToQuoted("new"), true);
  assert.equal(shouldAdvanceLeadToQuoted("contacted"), true);
  // Already there, or further on — a re-save must not drag it back.
  assert.equal(shouldAdvanceLeadToQuoted("quoted"), false);
  assert.equal(shouldAdvanceLeadToQuoted("booked"), false);
  assert.equal(shouldAdvanceLeadToQuoted("won"), false);
  assert.equal(shouldAdvanceLeadToQuoted("lost"), false);
});

// --- Lifetime value --------------------------------------------------------

test("lifetime value sums the midpoints of won quotes only", () => {
  const value = lifetimeValueCents([
    { status: "won", finalLowCents: 30_000, finalHighCents: 40_000 },
    { status: "won", finalLowCents: 10_000, finalHighCents: 12_000 },
    { status: "lost", finalLowCents: 90_000, finalHighCents: 99_000 },
    { status: "draft", finalLowCents: 50_000, finalHighCents: 60_000 },
    { status: "sent", finalLowCents: 50_000, finalHighCents: 60_000 },
  ]);

  assert.equal(value, 35_000 + 11_000);
});

test("a client with no won quotes is worth nothing yet, not NaN", () => {
  assert.equal(lifetimeValueCents([]), 0);
  assert.equal(
    lifetimeValueCents([{ status: "draft", finalLowCents: 1, finalHighCents: 2 }]),
    0,
  );
});

// --- Review SMS ------------------------------------------------------------

test("the review message greets by first name and carries the link", () => {
  const text = reviewSmsText("Dana Reyes", "https://g.page/r/example/review");

  assert.match(text, /^Hi Dana,/);
  assert.match(text, /https:\/\/g\.page\/r\/example\/review/);
  assert.match(text, /NorthPeak/);
});

test("the review message still reads without a link configured", () => {
  const text = reviewSmsText("Dana", null);

  assert.match(text, /Google review\?/);
  assert.equal(text.includes("null"), false);
  assert.equal(text.includes("undefined"), false);
});

test("a nameless customer gets a plain greeting", () => {
  assert.match(reviewSmsText("   ", null), /^Hi,/);
});

// --- Calendar --------------------------------------------------------------

test("weeks start on Monday and run seven days", () => {
  // 2026-06-15 is a Monday; 2026-06-21 the Sunday that closes that week.
  const days = weekDays(new Date(2026, 5, 17));

  assert.equal(days.length, 7);
  assert.equal(toDateKey(days[0]), "2026-06-15");
  assert.equal(toDateKey(days[6]), "2026-06-21");
  assert.equal(startOfWeek(new Date(2026, 5, 21)).getDay(), 1);
});

test("a Sunday belongs to the week that started the Monday before it", () => {
  assert.equal(toDateKey(startOfWeek(new Date(2026, 5, 21))), "2026-06-15");
});

test("date keys round-trip, and a bad key falls back rather than throwing", () => {
  const day = new Date(2026, 5, 15);
  assert.equal(toDateKey(fromDateKey("2026-06-15", NOW)), "2026-06-15");
  assert.equal(toDateKey(fromDateKey("nonsense", day)), toDateKey(day));
  assert.equal(toDateKey(fromDateKey("", day)), toDateKey(day));
});

test("isSameDay ignores the time of day", () => {
  assert.equal(isSameDay(new Date(2026, 5, 15, 1), new Date(2026, 5, 15, 23)), true);
  assert.equal(isSameDay(new Date(2026, 5, 15), new Date(2026, 5, 16)), false);
});

test("addDays crosses a month boundary correctly", () => {
  assert.equal(toDateKey(addDays(new Date(2026, 5, 30), 2)), "2026-07-02");
});

test("the day grid runs the working window", () => {
  const hours = calendarHours();
  assert.equal(hours[0], CALENDAR_DAY_START_HOUR);
  assert.equal(hours[hours.length - 1], CALENDAR_DAY_END_HOUR - 1);
  assert.equal(formatHour(7), "7am");
  assert.equal(formatHour(12), "12pm");
  assert.equal(formatHour(18), "6pm");
});

test("a job block is positioned as a percentage of the visible day", () => {
  const day = new Date(2026, 5, 15);
  const start = new Date(2026, 5, 15, 10, 0);
  const end = new Date(2026, 5, 15, 13, 0);

  const position = jobBlockPosition({ scheduledStart: start, scheduledEnd: end }, day);
  assert.ok(position);
  // 7am–7pm is 12h; 10am is 3h in, and the job is 3h long.
  assert.ok(Math.abs(position.topPct - 25) < 0.001);
  assert.ok(Math.abs(position.heightPct - 25) < 0.001);
});

test("a job on another day does not render in this column", () => {
  const position = jobBlockPosition(
    { scheduledStart: new Date(2026, 5, 16, 10), scheduledEnd: new Date(2026, 5, 16, 12) },
    new Date(2026, 5, 15),
  );
  assert.equal(position, null);
});

test("an unscheduled job has no block at all", () => {
  assert.equal(
    jobBlockPosition({ scheduledStart: null, scheduledEnd: null }, new Date(2026, 5, 15)),
    null,
  );
});

test("a job running past the visible window is clamped, not dropped", () => {
  const position = jobBlockPosition(
    { scheduledStart: new Date(2026, 5, 15, 17), scheduledEnd: new Date(2026, 5, 15, 23) },
    new Date(2026, 5, 15),
  );

  assert.ok(position);
  assert.ok(position.topPct + position.heightPct <= 100.001, "must not overflow the column");
});

test("a job with no end time is drawn at the default length", () => {
  const position = jobBlockPosition(
    { scheduledStart: new Date(2026, 5, 15, 9), scheduledEnd: null },
    new Date(2026, 5, 15),
  );

  assert.ok(position);
  assert.ok(Math.abs(position.heightPct - (DEFAULT_JOB_HOURS / 12) * 100) < 0.001);
});

test("rescheduling preserves the job's duration", () => {
  const moved = rescheduleJob(
    {
      scheduledStart: new Date(2026, 5, 15, 9),
      scheduledEnd: new Date(2026, 5, 15, 13, 30),
    },
    new Date(2026, 5, 18),
    14,
  );

  assert.equal(toDateKey(moved.scheduledStart), "2026-06-18");
  assert.equal(moved.scheduledStart.getHours(), 14);
  assert.equal(
    moved.scheduledEnd.getTime() - moved.scheduledStart.getTime(),
    4.5 * 60 * 60 * 1000,
  );
});

test("an unscheduled job dropped on the calendar gets the default length", () => {
  const moved = rescheduleJob({ scheduledStart: null, scheduledEnd: null }, new Date(2026, 5, 18), 9);

  assert.equal(
    moved.scheduledEnd.getTime() - moved.scheduledStart.getTime(),
    DEFAULT_JOB_HOURS * 60 * 60 * 1000,
  );
});

test("a drop outside the working window is pulled back into it", () => {
  const early = rescheduleJob({ scheduledStart: null, scheduledEnd: null }, new Date(2026, 5, 18), 2);
  const late = rescheduleJob({ scheduledStart: null, scheduledEnd: null }, new Date(2026, 5, 18), 23);

  assert.equal(early.scheduledStart.getHours(), CALENDAR_DAY_START_HOUR);
  assert.equal(late.scheduledStart.getHours(), CALENDAR_DAY_END_HOUR - 1);
});

test("every assignee has a distinct colour", () => {
  const tones = JOB_ASSIGNEES.map((assignee) => ASSIGNEE_TONE[assignee]);
  for (const tone of tones) assert.match(tone, /^#[0-9a-f]{6}$/i);
  assert.equal(new Set(tones).size, tones.length, "two assignees share a colour");
});

// --- Migration stays in step with the schema -------------------------------

const MIGRATION = readFileSync(
  path.join(process.cwd(), "drizzle", "0001_northpeak_crm.sql"),
  "utf8",
);

test("the CRM migration creates all four new tables", () => {
  for (const table of ["clients", "leads", "jobs", "activity_log"]) {
    assert.match(MIGRATION, new RegExp(`CREATE TABLE IF NOT EXISTS "${table}"`));
  }
});

test("v1's migration is untouched by v2", () => {
  const v0 = readFileSync(
    path.join(process.cwd(), "drizzle", "0000_northpeak_ops.sql"),
    "utf8",
  );
  assert.equal(v0.includes("clients"), false, "0000 must not mention the CRM");
  assert.equal(v0.includes("activity_log"), false);
});

test("every enum in the schema is enforced by a check constraint", () => {
  const cases: [string, readonly string[]][] = [
    ["leads_status_known", LEAD_STATUSES],
    ["leads_source_known", LEAD_SOURCES],
    ["leads_owner_known", LEAD_OWNERS],
    ["leads_origin_known", LEAD_ORIGINS],
    ["jobs_status_known", JOB_STATUSES],
    ["jobs_assignee_known", JOB_ASSIGNEES],
    ["activity_kind_known", ACTIVITY_KINDS],
    ["activity_entity_known", ACTIVITY_ENTITIES],
  ];

  for (const [constraint, values] of cases) {
    const match = new RegExp(`CONSTRAINT "${constraint}" CHECK \\([^)]*IN \\(([^)]*)\\)`).exec(
      MIGRATION,
    );
    assert.ok(match, `${constraint} is missing from the migration`);

    const inSql = match[1].split(",").map((value) => value.trim().replace(/^'|'$/g, ""));
    assert.deepEqual(
      inSql.sort(),
      [...values].sort(),
      `${constraint} does not match the TypeScript enum — re-run npm run db:generate:crm`,
    );
  }
});

test("the migration adds the quote links additively", () => {
  assert.match(MIGRATION, /ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "client_id"/);
  assert.match(MIGRATION, /ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "job_id"/);
  // Nothing may be dropped or made NOT NULL — v1 rows have neither column.
  assert.equal(/DROP (TABLE|COLUMN)/i.test(MIGRATION), false);
  assert.equal(/ALTER COLUMN .* SET NOT NULL/i.test(MIGRATION), false);
});

test("the migration is re-runnable against a database that already has v1", () => {
  const creates = MIGRATION.match(/CREATE TABLE(?! IF NOT EXISTS)/g);
  assert.equal(creates, null, "every CREATE TABLE must be guarded");
  const indexes = MIGRATION.match(/CREATE INDEX(?! IF NOT EXISTS)/g);
  assert.equal(indexes, null, "every CREATE INDEX must be guarded");
});

test("the board, the calendar and the timelines all have an index behind them", () => {
  for (const index of [
    "leads_status_idx",
    "leads_follow_up_idx",
    "jobs_scheduled_start_idx",
    "activity_entity_idx",
    "quotes_client_idx",
  ]) {
    assert.match(MIGRATION, new RegExp(index), `${index} is missing`);
  }
});
