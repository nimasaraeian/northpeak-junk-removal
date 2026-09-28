import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { getPost } from "@/content/blog";
import { CATALOG_CATEGORIES, CATALOG_SEED } from "@/lib/admin/catalog-seed";
import { buildCustomerText } from "@/lib/admin/customer-text";
import {
  buildVisionSystemPrompt,
  MAX_IMAGES,
  visionRequestSchema,
  visionResultSchema,
  VISION_TOOL_SCHEMA,
} from "@/lib/admin/vision";
import {
  computeQuote,
  DEFAULT_PRICING_SETTINGS,
  ITEM_FLAGS,
  type ItemFlag,
} from "@/lib/quote-engine";

// --- Catalog seed ----------------------------------------------------------

test("the catalog covers the requested breadth", () => {
  assert.ok(CATALOG_SEED.length >= 80, `only ${CATALOG_SEED.length} items seeded`);
});

test("every catalog item is well formed", () => {
  for (const item of CATALOG_SEED) {
    assert.ok(item.name.trim().length > 0, "item with no name");
    assert.ok(
      (CATALOG_CATEGORIES as readonly string[]).includes(item.category),
      `${item.name} has an unlisted category: ${item.category}`,
    );
    assert.ok(item.cubicFeet > 0, `${item.name} has no volume`);
    assert.ok(item.cubicFeet <= 300, `${item.name} at ${item.cubicFeet} ft³ looks like a typo`);
    for (const flag of item.flags) {
      assert.ok(ITEM_FLAGS.includes(flag), `${item.name} carries unknown flag ${flag}`);
    }
  }
});

test("catalog names are unique, so a photo match cannot be ambiguous", () => {
  const names = CATALOG_SEED.map((item) => item.name.toLowerCase());
  assert.equal(new Set(names).size, names.length);
});

test("the items the brief named by hand are all present", () => {
  const names = CATALOG_SEED.map((item) => item.name.toLowerCase());
  const required = [
    "sofa",
    "sectional",
    "mattress",
    "box spring",
    "fridge",
    "freezer",
    "washer",
    "dryer",
    "dishwasher",
    "stove",
    "bbq",
    "hot tub",
    "tv",
    "desk",
    "dresser",
    "table",
    "chair",
    "bookshelf",
    "treadmill",
    "bicycle",
    "carpet",
    "box (",
    "garbage bag",
    "plywood",
    "door",
    "toilet",
    "sink",
    "e-waste",
    "paint can",
    "tire",
    "piano",
  ];

  for (const term of required) {
    assert.ok(
      names.some((name) => name.includes(term)),
      `nothing in the catalog matches "${term}"`,
    );
  }
});

test("the flagged categories carry the right flags", () => {
  function flagsFor(term: string): ItemFlag[][] {
    return CATALOG_SEED.filter((item) => item.name.toLowerCase().includes(term)).map(
      (item) => item.flags,
    );
  }

  for (const flags of flagsFor("mattress")) assert.ok(flags.includes("mattress"));
  for (const flags of flagsFor("box spring")) assert.ok(flags.includes("mattress"));
  for (const flags of flagsFor("fridge")) assert.ok(flags.includes("freon"));
  for (const flags of flagsFor("freezer")) assert.ok(flags.includes("freon"));
  for (const flags of flagsFor("tire (")) assert.ok(flags.includes("tire"));
  for (const flags of flagsFor("paint can")) assert.ok(flags.includes("hazmat"));
  for (const flags of flagsFor("piano (")) assert.ok(flags.includes("piano"));
  // The brief asked for the hot tub to price at piano tier.
  for (const flags of flagsFor("hot tub")) assert.ok(flags.includes("piano"));
});

// --- Tier floors stay in step with the published ladder --------------------

/**
 * The cost guide's table is where the site publishes its price ladder, and
 * `llms.txt` already reads it rather than retyping it. The seeded floors are
 * the low end of each rung, so they are checked against the same table: edit
 * the guide and this fails until the floors follow.
 */
function publishedLadder(): Map<string, number> {
  const post = getPost("junk-removal-cost-north-vancouver");
  const table = post?.body.find((block) => block.type === "table");
  assert.ok(table && table.type === "table", "the cost guide must still publish its table");

  const ladder = new Map<string, number>();
  for (const [tier, range] of table.rows) {
    // "roughly $200–300" / "roughly $600–1,000+" -> the low end, in cents.
    const low = range.match(/\$([\d,]+)/);
    if (low) ladder.set(tier, Number(low[1].replace(/,/g, "")) * 100);
  }
  return ladder;
}

test("each seeded floor is the low end of its published tier", () => {
  const ladder = publishedLadder();

  for (const bracket of DEFAULT_PRICING_SETTINGS.priceFloors) {
    const published = ladder.get(bracket.label);
    assert.ok(
      published !== undefined,
      `"${bracket.label}" is not a row in the cost guide's table`,
    );
    assert.equal(
      bracket.floorCents,
      published,
      `${bracket.label} floor is ${bracket.floorCents}¢, the guide publishes ${published}¢`,
    );
  }
});

test("the seeded brackets cover the ladder's truck-fraction rungs in order", () => {
  const fractions = DEFAULT_PRICING_SETTINGS.priceFloors.map((b) => b.maxFraction);

  assert.deepEqual(fractions, [0.25, 0.5, 0.75, 1]);
  assert.deepEqual(
    DEFAULT_PRICING_SETTINGS.priceFloors.map((b) => b.label),
    ["Quarter truck", "Half truck", "Three-quarter truck", "Full truck"],
  );
  // The ladder's first rung is the minimum job, which min_job covers and the
  // engine deliberately excludes from the brackets.
  assert.ok(publishedLadder().has("Single item / minimum"));
  assert.equal(
    DEFAULT_PRICING_SETTINGS.priceFloors.some((b) => b.label.includes("Single item")),
    false,
  );
});

test("every published truck tier is quoted inside its advertised band", () => {
  const ladder = publishedLadder();
  const s = DEFAULT_PRICING_SETTINGS;
  const labor = { stairsFlights: 0, carryDistance: "standard" as const, disassembly: 0 };

  for (const bracket of s.priceFloors) {
    const raw = (s.truckCapacityFt3 * bracket.maxFraction) / (1 + s.packingPct / 100);
    const result = computeQuote(
      {
        items: [
          {
            catalogId: null,
            label: bracket.label,
            qty: 1,
            cubicFeetEach: raw,
            surchargeCents: null,
            flags: [],
          },
        ],
        labor,
        heavyMode: false,
      },
      s,
    );

    assert.ok(
      result.lowCents >= ladder.get(bracket.label)!,
      `${bracket.label} quotes ${result.lowCents}¢ low, under the published tier`,
    );
  }
});

// --- Migration stays in step with the TypeScript ---------------------------

const MIGRATION = readFileSync(
  path.join(process.cwd(), "drizzle", "0000_northpeak_ops.sql"),
  "utf8",
);

test("the migration creates the three tables the schema declares", () => {
  for (const table of ["settings", "items_catalog", "quotes"]) {
    assert.match(MIGRATION, new RegExp(`CREATE TABLE IF NOT EXISTS "${table}"`));
  }
});

test("the migration seeds exactly the pricing defaults the engine ships", () => {
  const match = MIGRATION.match(/INSERT INTO "settings"[\s\S]*?VALUES \(1, '(.+?)'::jsonb\)/);
  assert.ok(match, "no settings seed found in the migration");

  const seeded = JSON.parse(match[1].replace(/''/g, "'"));
  assert.deepEqual(seeded, DEFAULT_PRICING_SETTINGS);
});

test("the seeded truck capacity is marked unverified, so Settings warns", () => {
  assert.equal(DEFAULT_PRICING_SETTINGS.truckCapacityVerified, false);
});

test("every catalog item reaches the migration", () => {
  for (const item of CATALOG_SEED) {
    const escaped = item.name.replace(/'/g, "''");
    assert.ok(
      MIGRATION.includes(`('${escaped}', '${item.category}', ${item.cubicFeet},`),
      `${item.name} is missing from the migration — re-run npm run db:generate`,
    );
  }
});

test("the migration inserts one row per seeded item and no more", () => {
  const rows = MIGRATION.split("\n").filter((line) => /^ {2}\('/.test(line));
  assert.equal(rows.length, CATALOG_SEED.length);
});

// --- Customer text ---------------------------------------------------------

const baseComputation = computeQuote(
  {
    items: [
      {
        catalogId: 1,
        label: "Sofa (3-seat)",
        qty: 1,
        cubicFeetEach: 45,
        surchargeCents: null,
        flags: [],
      },
    ],
    labor: { stairsFlights: 0, carryDistance: "standard", disassembly: 0 },
    heavyMode: false,
  },
  DEFAULT_PRICING_SETTINGS,
);

test("the customer message carries the range and the items", () => {
  const text = buildCustomerText({
    customerName: "Dana",
    items: [
      { label: "Sofa (3-seat)", qty: 1 },
      { label: "Box (large)", qty: 4 },
    ],
    computation: baseComputation,
    operatorName: "Sina",
  });

  assert.match(text, /^Hi Dana,/);
  assert.match(text, /Sofa \(3-seat\)/);
  assert.match(text, /Box \(large\) x4/);
  assert.match(text, /\$\d/);
  assert.match(text, /Sina, NorthPeak Junk Removal$/);
});

test("the customer message never leaks an internal figure", () => {
  const text = buildCustomerText({
    customerName: "Dana",
    items: [{ label: "Sofa (3-seat)", qty: 1 }],
    computation: baseComputation,
    operatorName: "Nima",
  });

  const internal = baseComputation.internal;
  for (const [label, cents] of [
    ["disposal", internal.disposalCents],
    ["labor", internal.laborCostCents],
    ["fuel", internal.fuelCents],
    ["cost", internal.totalCents],
    ["margin", internal.marginCents],
  ] as const) {
    const dollars = String(Math.round(cents / 100));
    // The range itself is allowed; no other internal dollar figure may appear.
    if (
      dollars === String(Math.round(baseComputation.lowCents / 100)) ||
      dollars === String(Math.round(baseComputation.highCents / 100))
    ) {
      continue;
    }
    // Anchored on the right, or "$20" of fuel matches inside the "$200" of a
    // floored range and fails on a leak that is not there.
    assert.equal(
      new RegExp(`\\$${dollars}(?!\\d)`).test(text),
      false,
      `${label} leaked into the customer text`,
    );
  }

  assert.equal(/margin|cost|tipping|disposal fee/i.test(text), false);
});

test("a nameless customer still gets a sensible greeting", () => {
  const text = buildCustomerText({
    customerName: "  ",
    items: [{ label: "Mattress (queen)", qty: 1 }],
    computation: baseComputation,
  });

  assert.match(text, /^Hi,/);
  assert.equal(text.includes("undefined"), false);
});

test("a long item list is truncated rather than pasted whole", () => {
  const items = Array.from({ length: 20 }, (_, index) => ({
    label: `Item ${index + 1}`,
    qty: 1,
  }));

  const text = buildCustomerText({
    customerName: "Dana",
    items,
    computation: baseComputation,
  });

  assert.match(text, /plus 8 more items/);
});

test("heavy-mode messages explain the weight basis instead of listing items", () => {
  const heavy = computeQuote(
    {
      items: [],
      labor: { stairsFlights: 0, carryDistance: "standard", disassembly: 0 },
      heavyMode: true,
      heavy: { materialType: "concrete", estWeightKg: 1200 },
    },
    DEFAULT_PRICING_SETTINGS,
  );

  const text = buildCustomerText({
    customerName: "Dana",
    items: [],
    computation: heavy,
    heavyMaterial: "concrete",
  });

  assert.match(text, /priced by weight for concrete/i);
  assert.equal(text.includes("What we have down for you"), false);
});

test("a multi-load job says so, since it changes the day not just the price", () => {
  const big = computeQuote(
    {
      items: [
        {
          catalogId: null,
          label: "Whole basement",
          qty: 1,
          cubicFeetEach: 700,
          surchargeCents: null,
          flags: [],
        },
      ],
      labor: { stairsFlights: 0, carryDistance: "standard", disassembly: 0 },
      heavyMode: false,
    },
    DEFAULT_PRICING_SETTINGS,
  );

  assert.equal(big.multiLoad, true);
  const text = buildCustomerText({
    customerName: "Dana",
    items: [{ label: "Whole basement", qty: 1 }],
    computation: big,
  });

  assert.match(text, /truckloads/);
});

// --- Vision contract -------------------------------------------------------

test("the vision request schema caps images at four", () => {
  const image = { mediaType: "image/jpeg" as const, data: "abc" };

  assert.equal(visionRequestSchema.safeParse({ images: [image] }).success, true);
  assert.equal(
    visionRequestSchema.safeParse({ images: Array(MAX_IMAGES).fill(image) }).success,
    true,
  );
  assert.equal(
    visionRequestSchema.safeParse({ images: Array(MAX_IMAGES + 1).fill(image) }).success,
    false,
  );
  assert.equal(visionRequestSchema.safeParse({ images: [] }).success, false);
});

test("the vision request schema rejects an unsupported media type", () => {
  assert.equal(
    visionRequestSchema.safeParse({ images: [{ mediaType: "image/heic", data: "abc" }] }).success,
    false,
  );
});

test("the vision result schema accepts a well-formed reply and rejects junk", () => {
  const good = {
    items: [
      {
        label: "Sofa",
        matchedCatalogName: "Sofa (3-seat)",
        qty: 1,
        estCubicFeetEach: 45,
        confidence: 0.8,
        flags: [],
      },
    ],
    overall: { complexJob: false, reason: "" },
  };
  assert.equal(visionResultSchema.safeParse(good).success, true);

  assert.equal(visionResultSchema.safeParse({ items: [] }).success, false, "overall is required");
  assert.equal(
    visionResultSchema.safeParse({
      items: [{ ...good.items[0], flags: ["not-a-flag"] }],
      overall: good.overall,
    }).success,
    false,
  );
  assert.equal(
    visionResultSchema.safeParse({
      items: [{ ...good.items[0], confidence: 4 }],
      overall: good.overall,
    }).success,
    false,
  );
});

test("the tool schema is strict, so the model cannot invent fields", () => {
  assert.equal(VISION_TOOL_SCHEMA.additionalProperties, false);
  assert.deepEqual(VISION_TOOL_SCHEMA.required, ["items", "overall"]);
});

test("the prompt names every complex-job case the brief listed", () => {
  const prompt = buildVisionSystemPrompt(["Sofa (3-seat)", "Mattress (queen)"]);

  for (const term of ["estate", "construction", "hoarding", "blurry"]) {
    assert.ok(prompt.toLowerCase().includes(term), `prompt does not mention ${term}`);
  }
  assert.match(prompt, /Sofa \(3-seat\)/, "the catalog must be offered for matching");
  assert.match(prompt, /never invent a name/i);
});
