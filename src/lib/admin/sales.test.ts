import assert from "node:assert/strict";
import test from "node:test";
import {
  addBusinessMinutes,
  buildCallList,
  businessMinutesBetween,
  CALL_OUTCOMES,
  defaultFollowUp,
  FOLLOW_UP_AFTER,
  isOpenAt,
  MAX_UNANSWERED,
  readCallNote,
  slaClock,
  slaLabel,
  speedToLead,
  statusAfterCall,
  unansweredStreak,
  type CallListClient,
  type CallListLead,
} from "@/lib/admin/sales";

// Vancouver is UTC−7 in October (PDT). Thursday 15 Oct 2026, 10:00 local.
const THU_10AM = new Date("2026-10-15T17:00:00Z");
const at = (iso: string) => new Date(iso);

test("business minutes count only open hours", () => {
  assert.equal(businessMinutesBetween(at("2026-10-15T17:00:00Z"), at("2026-10-15T17:20:00Z")), 20);
  // 6:30pm → 8:15am next day: 30 minutes before close, 15 after open.
  assert.equal(businessMinutesBetween(at("2026-10-16T01:30:00Z"), at("2026-10-16T15:15:00Z")), 45);
  // Saturday 6pm → Monday 8:10am: Sunday is closed.
  assert.equal(businessMinutesBetween(at("2026-10-18T01:00:00Z"), at("2026-10-19T15:10:00Z")), 70);
  assert.equal(businessMinutesBetween(THU_10AM, THU_10AM), 0);
});

test("open-hours check follows Vancouver time", () => {
  assert.equal(isOpenAt(THU_10AM), true);
  assert.equal(isOpenAt(at("2026-10-16T03:00:00Z")), false); // Thu 8pm
  assert.equal(isOpenAt(at("2026-10-18T18:00:00Z")), false); // Sunday 11am
});

test("adding business minutes rolls over closed hours", () => {
  // Thu 6pm + 2h → Fri 9am.
  const result = addBusinessMinutes(at("2026-10-16T01:00:00Z"), 120);
  assert.equal(result.toISOString(), "2026-10-16T16:00:00.000Z");
  // Zero minutes at night lands on the next opening.
  assert.equal(addBusinessMinutes(at("2026-10-16T05:00:00Z"), 0).toISOString(), "2026-10-16T15:00:00.000Z");
});

const base = { status: "new" as const, firstContactedAt: null, quotedAt: null, lastContactAt: null };

test("first-contact timer runs 15 business minutes", () => {
  const fresh = slaClock({ ...base, createdAt: at("2026-10-15T16:55:00Z") }, THU_10AM)!;
  assert.equal(fresh.stage, "first_contact");
  assert.equal(fresh.remainingMinutes, 10);
  assert.equal(fresh.state, "ok");
  assert.equal(slaLabel(fresh), "10m left");

  const late = slaClock({ ...base, createdAt: at("2026-10-15T16:00:00Z") }, THU_10AM)!;
  assert.equal(late.state, "late");
  assert.equal(slaLabel(late), "45m late");

  // A lead at 11pm is not late before the doors open.
  const overnight = slaClock({ ...base, createdAt: at("2026-10-16T06:00:00Z") }, at("2026-10-16T15:05:00Z"))!;
  assert.equal(overnight.remainingMinutes, 10);
});

test("timer moves to quote, then quote follow-up, and stops when booked", () => {
  const contacted = slaClock(
    { ...base, status: "contacted", createdAt: at("2026-10-15T15:00:00Z"), firstContactedAt: at("2026-10-15T15:05:00Z") },
    THU_10AM,
  )!;
  assert.equal(contacted.stage, "quote");

  const quoted = slaClock(
    {
      ...base,
      status: "quoted",
      createdAt: at("2026-10-14T15:00:00Z"),
      firstContactedAt: at("2026-10-14T15:05:00Z"),
      quotedAt: at("2026-10-14T16:00:00Z"),
    },
    THU_10AM,
  )!;
  assert.equal(quoted.stage, "quote_follow_up");
  assert.equal(quoted.state, "late");

  assert.equal(slaClock({ ...base, status: "booked", createdAt: THU_10AM }, THU_10AM), null);
});

test("call outcomes move lead status sensibly", () => {
  assert.equal(statusAfterCall("new", "interested"), "contacted");
  assert.equal(statusAfterCall("new", "no_answer"), null);
  assert.equal(statusAfterCall("contacted", "quote_sent"), "quoted");
  assert.equal(statusAfterCall("quoted", "booked"), "booked");
  assert.equal(statusAfterCall("quoted", "not_interested"), "lost");
  assert.equal(statusAfterCall("won", "booked"), null);
});

test("every outcome has a follow-up rule", () => {
  for (const outcome of CALL_OUTCOMES) assert.ok(outcome in FOLLOW_UP_AFTER);
  assert.equal(defaultFollowUp("booked", THU_10AM), null);
  // No answer at 10am → retry at noon.
  assert.equal(defaultFollowUp("no_answer", THU_10AM)!.toISOString(), "2026-10-15T19:00:00.000Z");
});

test("reads outcome, flags and follow-up day from the note", () => {
  const vm = readCallNote("No answer, left a voicemail", THU_10AM);
  assert.equal(vm.outcome, "voicemail");

  const price = readCallNote("Thinks it's too expensive, got another quote from a competitor. Call Friday.", THU_10AM);
  assert.equal(price.outcome, null);
  assert.deepEqual(price.flags, ["price", "competitor"]);
  assert.equal(price.followUp!.toISOString(), "2026-10-16T16:00:00.000Z"); // Fri 9am PDT

  const booked = readCallNote("Booked for Saturday, whole house estate cleanout, realtor", THU_10AM);
  assert.equal(booked.outcome, "booked");
  assert.ok(booked.flags.includes("big_job"));
  assert.ok(booked.flags.includes("repeat_potential"));

  const tomorrow = readCallNote("wants to check with her husband, call tomorrow", THU_10AM);
  assert.equal(tomorrow.outcome, "thinking");
  assert.equal(tomorrow.followUp!.toISOString(), "2026-10-16T16:00:00.000Z");
});

test("unanswered streak counts misses until a real conversation", () => {
  assert.equal(unansweredStreak(["no_answer", "voicemail", "interested", "no_answer"]), 2);
  assert.equal(unansweredStreak([]), 0);
});

function lead(overrides: Partial<CallListLead>): CallListLead {
  return {
    id: 1,
    name: "Lead",
    phone: "604",
    area: "Burnaby",
    status: "new",
    owner: "unassigned",
    createdAt: at("2026-10-15T16:50:00Z"),
    nextFollowUpAt: null,
    firstContactedAt: null,
    quotedAt: null,
    lastContactAt: null,
    lastOutcome: null,
    callAttempts: 0,
    unansweredStreak: 0,
    flags: [],
    valueCents: 0,
    ...overrides,
  };
}

test("call list puts new leads first, then promises, then quotes", () => {
  const list = buildCallList(
    [
      lead({ id: 1, status: "quoted", firstContactedAt: at("2026-10-13T17:00:00Z"), quotedAt: at("2026-10-13T18:00:00Z"), lastContactAt: at("2026-10-13T18:00:00Z"), valueCents: 90_000 }),
      lead({ id: 2 }),
      lead({ id: 3, status: "contacted", firstContactedAt: at("2026-10-14T17:00:00Z"), lastContactAt: at("2026-10-14T17:00:00Z"), nextFollowUpAt: at("2026-10-15T16:00:00Z") }),
      lead({ id: 4, status: "won" }),
    ],
    [],
    THU_10AM,
  );
  assert.deepEqual(list.map((i) => i.id), [2, 3, 1]);
  assert.equal(list[0].reason, "new_lead");
  assert.equal(list[1].reason, "promised");
  assert.equal(list[2].reason, "quote_follow_up");
});

test("call list waits after a missed call, and gives up on the phone after many", () => {
  const justMissed = lead({
    id: 5,
    status: "new",
    firstContactedAt: null,
    lastContactAt: at("2026-10-15T16:30:00Z"),
    lastOutcome: "no_answer",
    nextFollowUpAt: at("2026-10-15T18:30:00Z"),
  });
  // Never contacted, so still a new lead even after a miss — but…
  assert.equal(buildCallList([justMissed], [], THU_10AM).length, 0);

  const exhausted = lead({
    id: 6,
    status: "contacted",
    firstContactedAt: at("2026-10-10T17:00:00Z"),
    lastContactAt: at("2026-10-14T17:00:00Z"),
    lastOutcome: "no_answer",
    unansweredStreak: MAX_UNANSWERED,
    nextFollowUpAt: at("2026-10-15T15:00:00Z"),
  });
  const [item] = buildCallList([exhausted], [], THU_10AM);
  assert.equal(item.reason, "retry");
  assert.match(item.why, /SMS or email/);
  assert.equal(item.whyVars.n, MAX_UNANSWERED);
});

test("past clients come back onto the list after a long quiet spell", () => {
  const client: CallListClient = {
    id: 9,
    name: "Old client",
    phone: "604",
    area: "Surrey",
    lastJobAt: at("2025-09-01T17:00:00Z"),
    jobCount: 3,
    lifetimeValueCents: 150_000,
    lastContactAt: null,
  };
  const [item] = buildCallList([], [client], THU_10AM);
  assert.equal(item.reason, "reactivate");
  assert.equal(buildCallList([], [{ ...client, lastJobAt: at("2026-06-01T17:00:00Z") }], THU_10AM).length, 0);
});

test("speed-to-lead median and share within target", () => {
  const stats = speedToLead([
    { createdAt: at("2026-10-15T17:00:00Z"), firstContactedAt: at("2026-10-15T17:05:00Z") },
    { createdAt: at("2026-10-15T17:00:00Z"), firstContactedAt: at("2026-10-15T17:30:00Z") },
    { createdAt: at("2026-10-15T17:00:00Z"), firstContactedAt: at("2026-10-15T17:10:00Z") },
    { createdAt: at("2026-10-15T17:00:00Z"), firstContactedAt: null },
  ]);
  assert.equal(stats.contacted, 3);
  assert.equal(stats.medianMinutes, 10);
  assert.ok(Math.abs(stats.withinSla! - 2 / 3) < 1e-9);
});

test("sales state comes from calls, with status history as a fallback", async () => {
  const { deriveLeadSales } = await import("@/lib/admin/sales");
  const state = deriveLeadSales(
    [
      { createdAt: at("2026-10-15T17:10:00Z"), outcome: "no_answer", flags: [] },
      { createdAt: at("2026-10-15T17:05:00Z"), outcome: "interested", flags: ["price"] },
      { createdAt: at("2026-10-15T17:20:00Z"), outcome: "voicemail", flags: ["urgent"] },
    ],
    [{ createdAt: at("2026-10-15T16:00:00Z"), body: "Lead moved new → contacted" }],
  );
  assert.equal(state.firstContactedAt!.toISOString(), "2026-10-15T16:00:00.000Z");
  assert.equal(state.lastOutcome, "voicemail");
  assert.equal(state.callAttempts, 3);
  assert.equal(state.unansweredStreak, 2);
  assert.deepEqual(state.flags.sort(), ["price", "urgent"]);
  assert.equal(state.quotedAt, null);

  const old = deriveLeadSales([], [{ createdAt: at("2026-10-01T16:00:00Z"), body: "Lead moved contacted → quoted · sent by text" }]);
  assert.equal(old.quotedAt!.toISOString(), "2026-10-01T16:00:00.000Z");
  assert.equal(old.firstContactedAt!.toISOString(), "2026-10-01T16:00:00.000Z");
});

test("templates fill their slots and leave unknown ones alone", async () => {
  const { fillTemplate } = await import("@/lib/admin/sales");
  assert.equal(fillTemplate("Came in {ago}; {x}", { ago: "5m ago" }), "Came in 5m ago; {x}");
});

test("reads Persian notes too", () => {
  const miss = readCallNote("جواب نداد، پیام صوتی گذاشتم", THU_10AM);
  assert.equal(miss.outcome, "voicemail");

  const price = readCallNote("گفت گرونه، از یه شرکت دیگه هم قیمت گرفته. سه شنبه زنگ بزنم", THU_10AM);
  assert.deepEqual(price.flags, ["price", "competitor"]);
  assert.equal(price.followUp!.toISOString(), "2026-10-20T16:00:00.000Z"); // Tue 9am

  const saturday = readCallNote("رزرو شد برای شنبه", THU_10AM);
  assert.equal(saturday.outcome, "booked");
  assert.equal(saturday.followUp!.toISOString(), "2026-10-17T16:00:00.000Z");

  assert.equal(readCallNote("پس‌فردا تماس بگیر", THU_10AM).followUp!.toISOString(), "2026-10-17T16:00:00.000Z");
  assert.equal(readCallNote("پنج‌شنبه", THU_10AM).followUp!.toISOString(), "2026-10-22T16:00:00.000Z");
});
