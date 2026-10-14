import assert from "node:assert/strict";
import test from "node:test";
import {
  payForEntryCents,
  profitAndLoss,
  summarizePayByPerson,
  totalPayCents,
} from "@/lib/admin/finance";
import type { TimeEntryRow } from "@/lib/db/schema";

function entry(person: string, hours: number, rateCents: number): TimeEntryRow {
  return {
    id: 1,
    createdAt: new Date(),
    person,
    jobId: null,
    workDate: new Date(),
    hours,
    rateCents,
    note: "",
    createdBy: "Nima",
  };
}

test("pay for an entry is hours × rate, rounded to the cent", () => {
  assert.equal(payForEntryCents(2, 3000), 6000);
  assert.equal(payForEntryCents(1.5, 3333), 5000); // 4999.5 → 5000
});

test("pay rolls up per person and sorts by pay descending", () => {
  const rows = summarizePayByPerson([
    entry("Nima", 3, 3000),
    entry("Sina", 2, 3000),
    entry("Nima", 1, 3000),
  ]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].person, "Nima");
  assert.equal(rows[0].hours, 4);
  assert.equal(rows[0].payCents, 12000);
  assert.equal(rows[1].person, "Sina");
  assert.equal(rows[1].payCents, 6000);
  assert.equal(totalPayCents(rows), 18000);
});

test("P&L is revenue minus labour minus expenses; GST is excluded", () => {
  const pl = profitAndLoss({
    revenueCents: 500000,
    gstCollectedCents: 25000,
    labourCents: 120000,
    expensesCents: 80000,
  });
  assert.equal(pl.netProfitCents, 300000);
  assert.equal(pl.gstCollectedCents, 25000);
});
