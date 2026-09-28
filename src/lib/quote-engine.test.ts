import assert from "node:assert/strict";
import test from "node:test";
import {
  clampPackingPct,
  computeQuote,
  DEFAULT_PRICING_SETTINGS,
  estimateLaborHours,
  formatCents,
  formatRange,
  ITEM_FLAGS,
  lineSurchargeCents,
  roundToNearestFiveDollars,
  type ItemFlag,
  type PricingSettings,
  type QuoteInput,
  type QuoteItemLine,
} from "@/lib/quote-engine";

const settings = DEFAULT_PRICING_SETTINGS;

function item(overrides: Partial<QuoteItemLine> = {}): QuoteItemLine {
  return {
    catalogId: null,
    label: "Test item",
    qty: 1,
    cubicFeetEach: 10,
    surchargeCents: null,
    flags: [],
    ...overrides,
  };
}

function input(overrides: Partial<QuoteInput> = {}): QuoteInput {
  return {
    items: [],
    labor: { stairsFlights: 0, carryDistance: "standard", disassembly: 0 },
    heavyMode: false,
    heavy: null,
    discount: null,
    ...overrides,
  };
}

// --- Volume path -----------------------------------------------------------

test("volume path pads for packing, converts to cubic yards, and prices per yard", () => {
  // 100 ft³ raw + 20% packing = 120 ft³ = 4.444 yd³ × $49 = $217.78
  const result = computeQuote(input({ items: [item({ cubicFeetEach: 100 })] }), settings);

  assert.equal(result.rawCubicFeet, 100);
  assert.ok(Math.abs(result.packedCubicFeet - 120) < 1e-9);
  assert.ok(Math.abs(result.cubicYards - 120 / 27) < 1e-9);
  assert.equal(result.volumeCents, Math.round((120 / 27) * 4900));
  assert.equal(result.volumeCents, 21778);
  assert.equal(result.minJobApplied, false);
});

test("quantity multiplies each line's cubic feet", () => {
  const result = computeQuote(
    input({ items: [item({ cubicFeetEach: 35, qty: 3 }), item({ cubicFeetEach: 15, qty: 2 })] }),
    settings,
  );

  assert.equal(result.rawCubicFeet, 35 * 3 + 15 * 2);
});

test("the packing factor is configurable per quote and clamped to 10–30", () => {
  const low = computeQuote(input({ items: [item({ cubicFeetEach: 100 })], packingPct: 10 }), settings);
  const high = computeQuote(input({ items: [item({ cubicFeetEach: 100 })], packingPct: 30 }), settings);

  assert.ok(Math.abs(low.packedCubicFeet - 110) < 1e-9);
  assert.ok(Math.abs(high.packedCubicFeet - 130) < 1e-9);

  assert.equal(clampPackingPct(0), 10);
  assert.equal(clampPackingPct(5), 10);
  assert.equal(clampPackingPct(45), 30);
  assert.equal(clampPackingPct(22), 22);
  assert.equal(clampPackingPct(Number.NaN), settings.packingPct);

  // Out-of-range values on the input are clamped, not honoured.
  const clamped = computeQuote(
    input({ items: [item({ cubicFeetEach: 100 })], packingPct: 500 }),
    settings,
  );
  assert.ok(Math.abs(clamped.packedCubicFeet - 130) < 1e-9);
});

// --- Minimum job floor -----------------------------------------------------

test("a tiny load is floored at the minimum job", () => {
  // 5 ft³ + 20% = 6 ft³ = 0.22 yd³ × $49 = $10.89, well under the $125 floor.
  const result = computeQuote(input({ items: [item({ cubicFeetEach: 5 })] }), settings);

  assert.equal(result.minJobApplied, true);
  assert.equal(result.volumeCents, settings.minJobCents);
  assert.equal(result.subtotalCents, settings.minJobCents);
});

test("an empty item list still prices at the minimum job, not zero", () => {
  const result = computeQuote(input(), settings);

  assert.equal(result.rawCubicFeet, 0);
  assert.equal(result.minJobApplied, true);
  assert.equal(result.subtotalCents, settings.minJobCents);
  assert.ok(result.lowCents > 0);
});

test("the floor stops applying once volume overtakes it", () => {
  // The crossover is at minJob / rate = 2.551 yd³ = 68.9 ft³ packed.
  const under = computeQuote(input({ items: [item({ cubicFeetEach: 55 })] }), settings);
  const over = computeQuote(input({ items: [item({ cubicFeetEach: 60 })] }), settings);

  assert.equal(under.minJobApplied, true);
  assert.equal(over.minJobApplied, false);
  assert.ok(over.volumeCents > under.volumeCents);
});

// --- Capacity and multi-load ----------------------------------------------

test("a load inside capacity is a single load", () => {
  const result = computeQuote(input({ items: [item({ cubicFeetEach: 300 })] }), settings);

  // 300 + 20% = 360 ft³, under the 400 ft³ capacity.
  assert.equal(result.multiLoad, false);
  assert.equal(result.loads, 1);
});

test("packed volume past capacity marks multi-load and scales proportionally", () => {
  // 500 ft³ raw + 20% = 600 ft³ packed against a 400 ft³ truck: 1.5 loads.
  const result = computeQuote(input({ items: [item({ cubicFeetEach: 500 })] }), settings);

  assert.equal(result.multiLoad, true);
  assert.equal(result.loads, 2, "1.5 loads rounds up to 2 trips");

  const oneLoadCents = Math.round((400 / 27) * settings.ratePerYd3Cents);
  assert.equal(result.volumeCents, Math.round(oneLoadCents * 1.5));

  // Proportional scaling means the price stays linear in volume.
  const half = computeQuote(input({ items: [item({ cubicFeetEach: 250 })] }), settings);
  assert.ok(Math.abs(result.volumeCents - half.volumeCents * 2) <= 2);
});

test("exactly one truckload is not flagged as multi-load", () => {
  // 400 ft³ packed = capacity exactly, from 333.33 ft³ raw.
  const result = computeQuote(input({ items: [item({ cubicFeetEach: 400 / 1.2 })] }), settings);

  assert.equal(result.multiLoad, false);
  assert.equal(result.loads, 1);
});

// --- Surcharges ------------------------------------------------------------

test("each flag contributes its configured surcharge", () => {
  for (const flag of ["mattress", "freon", "tire", "tv", "piano"] as const) {
    const result = computeQuote(
      input({ items: [item({ cubicFeetEach: 100, flags: [flag] })] }),
      settings,
    );
    assert.equal(
      result.surchargeCents,
      settings.surchargeCents[flag],
      `${flag} surcharge missing`,
    );
  }
});

test("every declared flag has a surcharge entry", () => {
  for (const flag of ITEM_FLAGS) {
    assert.equal(
      typeof settings.surchargeCents[flag],
      "number",
      `no surcharge row for ${flag}`,
    );
  }
});

test("surcharges stack across flags and multiply by quantity", () => {
  const line = item({ cubicFeetEach: 20, qty: 3, flags: ["mattress", "tv"] as ItemFlag[] });
  const expectedPerUnit = settings.surchargeCents.mattress + settings.surchargeCents.tv;

  assert.equal(lineSurchargeCents(line, settings), expectedPerUnit * 3);

  const result = computeQuote(input({ items: [line] }), settings);
  assert.equal(result.surchargeCents, expectedPerUnit * 3);
});

test("an explicit per-line surcharge overrides the flags, including zero", () => {
  const overridden = item({ flags: ["piano"], surchargeCents: 500, qty: 2 });
  assert.equal(lineSurchargeCents(overridden, settings), 1000);

  const waived = item({ flags: ["piano"], surchargeCents: 0 });
  assert.equal(lineSurchargeCents(waived, settings), 0);
});

test("surcharges land in the subtotal on top of volume", () => {
  const plain = computeQuote(input({ items: [item({ cubicFeetEach: 100 })] }), settings);
  const flagged = computeQuote(
    input({ items: [item({ cubicFeetEach: 100, flags: ["freon"] })] }),
    settings,
  );

  assert.equal(flagged.subtotalCents - plain.subtotalCents, settings.surchargeCents.freon);
});

// --- Labor adders ----------------------------------------------------------

test("labor adders price per flight, per long carry, and per disassembly", () => {
  const result = computeQuote(
    input({
      items: [item({ cubicFeetEach: 100 })],
      labor: { stairsFlights: 2, carryDistance: "long", disassembly: 3 },
    }),
    settings,
  );

  const expected =
    2 * settings.laborCents.stairsPerFlight +
    settings.laborCents.longCarry +
    3 * settings.laborCents.disassembly;

  assert.equal(result.laborCents, expected);
});

test("a standard carry adds nothing", () => {
  const result = computeQuote(
    input({
      items: [item({ cubicFeetEach: 100 })],
      labor: { stairsFlights: 0, carryDistance: "standard", disassembly: 0 },
    }),
    settings,
  );

  assert.equal(result.laborCents, 0);
});

// --- Heavy mode ------------------------------------------------------------

test("heavy mode bypasses volume pricing entirely", () => {
  const result = computeQuote(
    input({
      items: [item({ cubicFeetEach: 400, flags: ["mattress"] })],
      heavyMode: true,
      heavy: { materialType: "concrete", estWeightKg: 2000 },
    }),
    settings,
  );

  assert.equal(result.volumeCents, 0, "volume must not be charged in heavy mode");
  assert.equal(result.surchargeCents, 0, "item surcharges do not apply in heavy mode");
  assert.equal(result.heavyCents, 2 * settings.heavyRatePerTonneCents);
  assert.equal(result.subtotalCents, settings.minJobCents + 2 * settings.heavyRatePerTonneCents);
});

test("heavy mode still adds the labor adders", () => {
  const result = computeQuote(
    input({
      items: [],
      heavyMode: true,
      heavy: { materialType: "soil", estWeightKg: 1000 },
      labor: { stairsFlights: 1, carryDistance: "long", disassembly: 0 },
    }),
    settings,
  );

  const labor = settings.laborCents.stairsPerFlight + settings.laborCents.longCarry;
  assert.equal(result.laborCents, labor);
  assert.equal(
    result.subtotalCents,
    settings.minJobCents + settings.heavyRatePerTonneCents + labor,
  );
});

test("heavy mode weighs the declared tonnage, not the volume estimate", () => {
  const result = computeQuote(
    input({
      items: [item({ cubicFeetEach: 100 })],
      heavyMode: true,
      heavy: { materialType: "tile", estWeightKg: 1500 },
    }),
    settings,
  );

  assert.equal(result.internal.estWeightKg, 1500);
  assert.equal(
    result.internal.disposalCents,
    Math.round(1.5 * settings.tippingFeePerTonneCents),
  );
});

test("heavy mode with no weight entered still charges the minimum job", () => {
  const result = computeQuote(input({ heavyMode: true, heavy: null }), settings);

  assert.equal(result.heavyCents, 0);
  assert.equal(result.subtotalCents, settings.minJobCents);
});

// --- Range and rounding ----------------------------------------------------

test("the range is the spread either side of subtotal, rounded to $5", () => {
  const result = computeQuote(input({ items: [item({ cubicFeetEach: 100 })] }), settings);

  assert.equal(result.subtotalCents, 21778);
  assert.equal(result.lowCents, roundToNearestFiveDollars(21778 * 0.92));
  assert.equal(result.highCents, roundToNearestFiveDollars(21778 * 1.08));
  assert.equal(result.lowCents % 500, 0);
  assert.equal(result.highCents % 500, 0);
  assert.ok(result.lowCents < result.subtotalCents);
  assert.ok(result.highCents > result.subtotalCents);
});

test("rounding goes to the nearest $5 in both directions and floors at zero", () => {
  assert.equal(roundToNearestFiveDollars(0), 0);
  assert.equal(roundToNearestFiveDollars(-500), 0);
  assert.equal(roundToNearestFiveDollars(249), 0);
  assert.equal(roundToNearestFiveDollars(250), 500);
  assert.equal(roundToNearestFiveDollars(749), 500);
  assert.equal(roundToNearestFiveDollars(751), 1000);
  assert.equal(roundToNearestFiveDollars(12_345), 12_500);
});

test("a zero spread collapses the range onto the subtotal", () => {
  const flat: PricingSettings = { ...settings, rangeSpreadPct: 0 };
  const result = computeQuote(input({ items: [item({ cubicFeetEach: 100 })] }), flat);

  assert.equal(result.lowCents, result.highCents);
  assert.equal(result.midpointCents, result.lowCents);
});

// --- Discount and margin ---------------------------------------------------

test("a percent discount comes off both ends of the range", () => {
  const base = computeQuote(input({ items: [item({ cubicFeetEach: 200 })] }), settings);
  const discounted = computeQuote(
    input({
      items: [item({ cubicFeetEach: 200 })],
      discount: { type: "percent", value: 10, reason: "Repeat customer" },
    }),
    settings,
  );

  assert.equal(discounted.lowCents, roundToNearestFiveDollars(base.subtotalCents * 0.92 * 0.9));
  assert.equal(discounted.highCents, roundToNearestFiveDollars(base.subtotalCents * 1.08 * 0.9));
  assert.ok(discounted.lowCents < base.lowCents);
  assert.ok(discounted.highCents < base.highCents);
});

test("a fixed-amount discount comes off both ends unscaled", () => {
  const base = computeQuote(input({ items: [item({ cubicFeetEach: 200 })] }), settings);
  const discounted = computeQuote(
    input({
      items: [item({ cubicFeetEach: 200 })],
      discount: { type: "amount", value: 5000, reason: "Goodwill" },
    }),
    settings,
  );

  assert.equal(
    discounted.lowCents,
    roundToNearestFiveDollars(base.subtotalCents * 0.92 - 5000),
  );
  assert.equal(
    discounted.highCents,
    roundToNearestFiveDollars(base.subtotalCents * 1.08 - 5000),
  );
  assert.equal(discounted.discountCents, 5000);
});

test("a discount cannot drive the range below zero", () => {
  const result = computeQuote(
    input({
      items: [item({ cubicFeetEach: 5 })],
      discount: { type: "amount", value: 999_999, reason: "Written off" },
    }),
    settings,
  );

  assert.equal(result.lowCents, 0);
  assert.equal(result.highCents, 0);
  assert.ok(result.internal.marginCents < 0, "a written-off job runs at a loss");
});

test("a percent discount is clamped to 0–100", () => {
  const over = computeQuote(
    input({
      items: [item({ cubicFeetEach: 200 })],
      discount: { type: "percent", value: 250, reason: "Typo" },
    }),
    settings,
  );

  assert.equal(over.lowCents, 0);
  assert.equal(over.highCents, 0);
});

test("internal cost sums disposal, crew hours, and fuel", () => {
  const result = computeQuote(input({ items: [item({ cubicFeetEach: 270 })] }), settings);

  // 270 + 20% = 324 ft³ = 12 yd³ × 120 kg = 1440 kg.
  assert.ok(Math.abs(result.internal.estWeightKg - 1440) < 1e-6);
  assert.equal(
    result.internal.disposalCents,
    Math.round(1.44 * settings.tippingFeePerTonneCents),
  );
  assert.equal(
    result.internal.laborCostCents,
    Math.round(result.internal.laborHoursEst * settings.laborRatePerHourCents),
  );
  assert.equal(result.internal.fuelCents, settings.fuelFlatCents);
  assert.equal(
    result.internal.totalCents,
    result.internal.disposalCents + result.internal.laborCostCents + result.internal.fuelCents,
  );
});

test("margin is measured against the post-discount midpoint", () => {
  const base = computeQuote(input({ items: [item({ cubicFeetEach: 200 })] }), settings);
  const discounted = computeQuote(
    input({
      items: [item({ cubicFeetEach: 200 })],
      discount: { type: "percent", value: 20, reason: "Neighbour rate" },
    }),
    settings,
  );

  assert.equal(base.internal.marginCents, base.midpointCents - base.internal.totalCents);
  assert.equal(
    discounted.internal.marginCents,
    discounted.midpointCents - discounted.internal.totalCents,
  );
  assert.ok(
    discounted.internal.marginCents < base.internal.marginCents,
    "discounting must reduce margin",
  );
  assert.ok(
    Math.abs(discounted.internal.marginPct - (discounted.internal.marginCents / discounted.midpointCents) * 100) < 1e-9,
  );
  // Cost is unchanged by a discount — only the revenue side moves.
  assert.equal(discounted.internal.totalCents, base.internal.totalCents);
});

test("crew-hour estimate grows with volume, stairs, carry, and disassembly", () => {
  const bare = estimateLaborHours({
    cubicYards: 0,
    labor: { stairsFlights: 0, carryDistance: "standard", disassembly: 0 },
  });
  const loaded = estimateLaborHours({
    cubicYards: 8,
    labor: { stairsFlights: 2, carryDistance: "long", disassembly: 1 },
  });

  assert.equal(bare, 1);
  assert.equal(loaded, 1 + 8 * 0.25 + 2 * 0.25 + 0.5 + 0.5);
  assert.equal((loaded * 100) % 25, 0, "hours land on a quarter-hour");
});

// --- Consistency with the published site pricing ---------------------------

test("a full truckload quotes inside the site's advertised $649–799", () => {
  // The site publishes a full load at $649–799. A full truck is the capacity
  // in packed volume, so the raw items are capacity / (1 + packing).
  const rawForFullTruck = settings.truckCapacityFt3 / (1 + settings.packingPct / 100);
  const result = computeQuote(input({ items: [item({ cubicFeetEach: rawForFullTruck })] }), settings);

  assert.equal(result.loads, 1);
  assert.equal(result.multiLoad, false);
  assert.ok(
    result.lowCents >= 64_900,
    `full-load low ${formatCents(result.lowCents)} is under the advertised $649`,
  );
  assert.ok(
    result.highCents <= 79_900,
    `full-load high ${formatCents(result.highCents)} is over the advertised $799`,
  );
});

test("a minimum job quotes inside the site's advertised $99–150", () => {
  const result = computeQuote(input({ items: [item({ cubicFeetEach: 2 })] }), settings);

  assert.equal(result.minJobApplied, true);
  assert.ok(result.lowCents >= 9_900, `minimum low ${formatCents(result.lowCents)} is under $99`);
  assert.ok(result.highCents <= 15_000, `minimum high ${formatCents(result.highCents)} is over $150`);
});

// --- Breakdown and formatting ---------------------------------------------

test("the breakdown itemizes what the subtotal is made of", () => {
  const result = computeQuote(
    input({
      items: [item({ cubicFeetEach: 200, flags: ["mattress"] })],
      labor: { stairsFlights: 1, carryDistance: "standard", disassembly: 0 },
      discount: { type: "percent", value: 10, reason: "Repeat" },
    }),
    settings,
  );

  const labels = result.breakdown.map((line) => line.label);
  assert.deepEqual(labels, ["Volume", "Item surcharges", "Labor adders", "Discount"]);
  assert.equal(result.breakdown[0].amountCents, result.volumeCents);
  assert.ok(result.breakdown[3].amountCents < 0, "the discount line is negative");
});

test("the heavy-mode breakdown leads with the minimum job and the tonnage", () => {
  const result = computeQuote(
    input({ heavyMode: true, heavy: { materialType: "shingles", estWeightKg: 800 } }),
    settings,
  );

  assert.deepEqual(
    result.breakdown.map((line) => line.label),
    ["Minimum job", "Heavy material"],
  );
  assert.match(result.breakdown[1].detail ?? "", /shingles/);
});

test("money formats as whole CAD dollars", () => {
  assert.equal(formatCents(0), "$0");
  assert.equal(formatCents(12_500), "$125");
  assert.equal(formatCents(123_456), "$1,234.56");
  assert.equal(formatRange(67_000, 78_500), "$670–$785");
});

// --- Defensive input handling ---------------------------------------------

test("negative and non-finite inputs are treated as zero rather than crashing", () => {
  const result = computeQuote(
    input({
      items: [
        item({ cubicFeetEach: -50, qty: 2 }),
        item({ cubicFeetEach: Number.NaN, qty: 1 }),
        item({ cubicFeetEach: 30, qty: -4 }),
      ],
      labor: { stairsFlights: -3, carryDistance: "standard", disassembly: Number.NaN },
    }),
    settings,
  );

  assert.equal(result.rawCubicFeet, 0);
  assert.equal(result.laborCents, 0);
  assert.equal(result.subtotalCents, settings.minJobCents);
  assert.ok(Number.isFinite(result.lowCents));
  assert.ok(Number.isFinite(result.internal.marginPct));
});

test("the engine is a pure function of its inputs", () => {
  const args = input({ items: [item({ cubicFeetEach: 123, qty: 2, flags: ["tv"] })] });
  const snapshot = JSON.stringify(args);

  const first = computeQuote(args, settings);
  const second = computeQuote(args, settings);

  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(args), snapshot, "input must not be mutated");
});
