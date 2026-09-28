import { bedCapacityCuFt } from "@/content/vehicle";

/**
 * NorthPeak Ops pricing engine.
 *
 * Pure TypeScript: no framework imports, no I/O, no `Date`, no randomness.
 * The one import is `@/content/vehicle`, a leaf data module of plain
 * constants that already describes the real trailer — capacity has one source
 * of truth, and it is the same one the public site measures from.
 * Everything the engine needs arrives in `QuoteInput`, and the same input
 * always produces the same output — which is what makes it testable, and what
 * lets the admin UI recompute a live price on every keystroke without a round
 * trip.
 *
 * Money is integer cents throughout. Floats only appear for volume and weight,
 * which are physical quantities rather than amounts, and every conversion back
 * to money rounds explicitly.
 *
 * The model is the industry-standard volume model: items are measured in cubic
 * feet, padded for the air between them, converted to cubic yards, and priced
 * against a per-yard rate with a minimum job floor. Heavy material (soil,
 * concrete, tile, shingles) bypasses that entirely and prices by the tonne,
 * because that is how the disposal facility bills it.
 */

export type ItemFlag = "mattress" | "freon" | "tire" | "tv" | "piano" | "hazmat" | "heavy";

export const ITEM_FLAGS: readonly ItemFlag[] = [
  "mattress",
  "freon",
  "tire",
  "tv",
  "piano",
  "hazmat",
  "heavy",
] as const;

export type HeavyMaterial = "soil" | "concrete" | "tile" | "shingles";

export const HEAVY_MATERIALS: readonly HeavyMaterial[] = [
  "soil",
  "concrete",
  "tile",
  "shingles",
] as const;

export type CarryDistance = "standard" | "long";

/**
 * A published-tier price floor.
 *
 * The site advertises a ladder of load sizes with a price band for each. The
 * engine's linear per-yard rate is calibrated to the full-truck band, and a
 * linear model run down a ladder whose lower rungs are not linear undershoots
 * them. These brackets hold the low end of a quote up to what the tier the
 * load actually falls into is advertised at.
 */
export interface PriceFloorBracket {
  /** Tier name, as the site publishes it. Shown in Settings and in the note. */
  label: string;
  /** Upper bound of the bracket, as a fraction of truck capacity. Inclusive. */
  maxFraction: number;
  /** The lowest the range low may be for a load in this bracket. */
  floorCents: number;
}

export interface PricingSettings {
  /**
   * Usable truck volume in cubic feet.
   *
   * Seeded from the measured trailer in `@/content/vehicle`. Settings shows a
   * "verify truck dimensions" banner until `truckCapacityVerified` flips,
   * which only a manual save can do — the seeded figure is the box to the top
   * of its side walls, and the usable load height is worth confirming on the
   * real vehicle.
   */
  truckCapacityFt3: number;
  truckCapacityVerified: boolean;
  minJobCents: number;
  ratePerYd3Cents: number;
  /** Packing inefficiency, percent added to raw item volume. Clamped 10–30. */
  packingPct: number;
  /** Half-width of the quoted range, percent either side of subtotal. */
  rangeSpreadPct: number;
  /**
   * Published-tier floors, smallest bracket first. An empty list disables
   * the floor entirely.
   */
  priceFloors: PriceFloorBracket[];
  /** Per-flag surcharge, applied once per unit of a flagged item. */
  surchargeCents: Record<ItemFlag, number>;
  laborCents: {
    stairsPerFlight: number;
    longCarry: number;
    disassembly: number;
  };
  heavyRatePerTonneCents: number;
  /** Internal only — never shown to a customer. */
  tippingFeePerTonneCents: number;
  laborRatePerHourCents: number;
  fuelFlatCents: number;
  avgDensityKgPerYd3: number;
}

export interface QuoteItemLine {
  /** Catalog row this came from, or null for a custom one-off line. */
  catalogId: number | null;
  label: string;
  qty: number;
  cubicFeetEach: number;
  /**
   * Per-unit surcharge override in cents. When null, the flags below decide.
   * `0` is a deliberate "no surcharge", which is why this is nullable rather
   * than optional-and-falsy.
   */
  surchargeCents: number | null;
  flags: ItemFlag[];
}

export interface LaborInput {
  stairsFlights: number;
  carryDistance: CarryDistance;
  disassembly: number;
}

export interface HeavyInput {
  materialType: HeavyMaterial;
  estWeightKg: number;
}

export interface DiscountInput {
  type: "percent" | "amount";
  /** Percent (0–100) or cents, depending on `type`. */
  value: number;
  reason: string;
}

export interface QuoteInput {
  items: QuoteItemLine[];
  /** Overrides `settings.packingPct` when set. Clamped to 10–30. */
  packingPct?: number;
  labor: LaborInput;
  heavyMode: boolean;
  heavy?: HeavyInput | null;
  discount?: DiscountInput | null;
}

export interface BreakdownLine {
  label: string;
  amountCents: number;
  /** Detail for the operator, e.g. "3 × 35 ft³". */
  detail?: string;
}

export interface InternalCost {
  estWeightKg: number;
  disposalCents: number;
  laborHoursEst: number;
  laborCostCents: number;
  fuelCents: number;
  totalCents: number;
  /** Against the post-discount range midpoint. */
  marginCents: number;
  marginPct: number;
}

export interface QuoteComputation {
  rawCubicFeet: number;
  packedCubicFeet: number;
  cubicYards: number;
  /** Truckloads this job needs, rounded up. Always at least 1. */
  loads: number;
  multiLoad: boolean;
  volumeCents: number;
  /** True when the volume price fell below the minimum and was floored. */
  minJobApplied: boolean;
  surchargeCents: number;
  laborCents: number;
  heavyMode: boolean;
  heavyCents: number;
  /** After any tier-floor uplift, so the breakdown adds up to it. */
  subtotalCents: number;
  /** True when a published-tier floor lifted the low end. */
  floorApplied: boolean;
  /** The tier that did it, for the note in the UI. */
  floorLabel: string | null;
  discountCents: number;
  lowCents: number;
  highCents: number;
  midpointCents: number;
  breakdown: BreakdownLine[];
  internal: InternalCost;
}

const CUBIC_FEET_PER_YARD = 27;
const ROUNDING_INCREMENT_CENTS = 500;
const MIN_PACKING_PCT = 10;
const MAX_PACKING_PCT = 30;

/**
 * Crew-hour heuristic for the internal cost estimate.
 *
 * Nothing in the brief pinned these down, so they are a first pass the team
 * should tune once a few real jobs have been timed. They only ever move the
 * internal margin figure — never the customer-facing range.
 */
const LABOR_HOURS = {
  base: 1,
  perCubicYard: 0.25,
  perStairFlight: 0.25,
  longCarry: 0.5,
  perDisassembly: 0.5,
  /** Hours are estimated to the nearest quarter. */
  increment: 0.25,
} as const;

/**
 * Defaults derived from the published site pricing, which stays the source of
 * truth: a full load is advertised at $649–799, a single item from roughly
 * $99–150.
 *
 * - `truckCapacityFt3` is `bedCapacityCuFt` — the 7 × 12 × 3 ft dump box the
 *   site already publishes, 252 ft³. Not a placeholder: the same number the
 *   public load-size pages are drawn from.
 * - `ratePerYd3Cents` 7800 is calibrated to that capacity. A full load is
 *   252 ft³ packed = 9.33 yd³, which divides exactly: 9.33 × $78 = $728.00,
 *   quoting as $670–785 — inside the advertised full-load band.
 * - `minJobCents` 12500 is the midpoint of the $99–150 minimum-load band,
 *   rounded to the $5 the engine rounds to, and quotes as $115–135.
 *
 * `quote-engine.test.ts` pins both ranges to exact figures, so a capacity or
 * rate edit that would contradict the site fails the suite rather than
 * shipping.
 */
export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  truckCapacityFt3: bedCapacityCuFt,
  truckCapacityVerified: false,
  minJobCents: 12500,
  ratePerYd3Cents: 7800,
  packingPct: 20,
  rangeSpreadPct: 8,
  // The low end of each rung of the ladder the cost guide publishes. Kept in
  // step with that table by `quote-engine.test.ts`, which reads the table and
  // fails if a figure here stops matching it.
  priceFloors: [
    { label: "Quarter truck", maxFraction: 0.25, floorCents: 20_000 },
    { label: "Half truck", maxFraction: 0.5, floorCents: 30_000 },
    { label: "Three-quarter truck", maxFraction: 0.75, floorCents: 50_000 },
    { label: "Full truck", maxFraction: 1, floorCents: 60_000 },
  ],
  surchargeCents: {
    mattress: 2000,
    freon: 6000,
    tire: 1500,
    tv: 2500,
    piano: 10000,
    // Not priced by the brief. Kept at zero so every flag has a row the team
    // can fill in from Settings rather than a missing key at runtime.
    hazmat: 0,
    heavy: 0,
  },
  laborCents: {
    stairsPerFlight: 2500,
    longCarry: 2500,
    disassembly: 3000,
  },
  heavyRatePerTonneCents: 25000,
  tippingFeePerTonneCents: 15000,
  laborRatePerHourCents: 5000,
  fuelFlatCents: 2000,
  avgDensityKgPerYd3: 120,
};

/** Rounds a cent amount to the nearest $5, never below zero. */
export function roundToNearestFiveDollars(cents: number): number {
  if (!Number.isFinite(cents) || cents <= 0) return 0;
  return Math.round(cents / ROUNDING_INCREMENT_CENTS) * ROUNDING_INCREMENT_CENTS;
}

export function clampPackingPct(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PRICING_SETTINGS.packingPct;
  return Math.min(MAX_PACKING_PCT, Math.max(MIN_PACKING_PCT, value));
}

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function wholeCount(value: number): number {
  return Math.max(0, Math.floor(nonNegative(value)));
}

/**
 * Snaps a value that is a whole number to within floating-point noise.
 *
 * Items summing to exactly one truckload divide out as 1.0000000000000002,
 * which would otherwise round up to two trips and tell the operator the job
 * needs a second run. A hair over is not a second trip.
 */
function snapToWhole(value: number): number {
  const nearest = Math.round(value);
  return Math.abs(value - nearest) < 1e-9 ? nearest : value;
}

/** Per-unit surcharge for a line: explicit override first, then flags. */
export function lineSurchargeCents(line: QuoteItemLine, settings: PricingSettings): number {
  const perUnit =
    line.surchargeCents !== null
      ? nonNegative(line.surchargeCents)
      : line.flags.reduce((sum, flag) => sum + nonNegative(settings.surchargeCents[flag] ?? 0), 0);

  return Math.round(perUnit * wholeCount(line.qty));
}

export function estimateLaborHours(input: {
  cubicYards: number;
  labor: LaborInput;
}): number {
  const raw =
    LABOR_HOURS.base +
    nonNegative(input.cubicYards) * LABOR_HOURS.perCubicYard +
    wholeCount(input.labor.stairsFlights) * LABOR_HOURS.perStairFlight +
    (input.labor.carryDistance === "long" ? LABOR_HOURS.longCarry : 0) +
    wholeCount(input.labor.disassembly) * LABOR_HOURS.perDisassembly;

  return Math.round(raw / LABOR_HOURS.increment) * LABOR_HOURS.increment;
}

function laborAddersCents(labor: LaborInput, settings: PricingSettings): number {
  return (
    wholeCount(labor.stairsFlights) * nonNegative(settings.laborCents.stairsPerFlight) +
    (labor.carryDistance === "long" ? nonNegative(settings.laborCents.longCarry) : 0) +
    wholeCount(labor.disassembly) * nonNegative(settings.laborCents.disassembly)
  );
}

/**
 * The bracket a load falls in, or null when it is past the last one.
 *
 * Brackets are editable in Settings, so they are sorted here rather than
 * trusted to arrive in order. A load bigger than the largest bracket — a
 * multi-load job — gets no floor: it is already past the end of the
 * published ladder.
 */
export function findFloorBracket(
  packedCubicFeet: number,
  capacityFt3: number,
  brackets: PriceFloorBracket[],
): PriceFloorBracket | null {
  if (capacityFt3 <= 0 || brackets.length === 0) return null;

  const fraction = packedCubicFeet / capacityFt3;
  const sorted = [...brackets].sort((a, b) => a.maxFraction - b.maxFraction);

  return sorted.find((bracket) => fraction <= bracket.maxFraction) ?? null;
}

function discountOffCents(amountCents: number, discount: DiscountInput | null | undefined): number {
  if (!discount) return 0;
  if (discount.type === "percent") {
    const pct = Math.min(100, Math.max(0, nonNegative(discount.value)));
    return Math.round((amountCents * pct) / 100);
  }
  return Math.min(amountCents, Math.round(nonNegative(discount.value)));
}

/**
 * Prices a quote.
 *
 * The steps map one-to-one onto the brief so the two can be read side by side:
 * volume → capacity → surcharges → labor → heavy override → range → internal
 * cost → discount.
 */
export function computeQuote(input: QuoteInput, settings: PricingSettings): QuoteComputation {
  const packingPct = clampPackingPct(input.packingPct ?? settings.packingPct);
  const capacityFt3 = nonNegative(settings.truckCapacityFt3);

  // 1) Volume path.
  const rawCubicFeet = input.items.reduce(
    (sum, line) => sum + nonNegative(line.cubicFeetEach) * wholeCount(line.qty),
    0,
  );
  const packedCubicFeet = rawCubicFeet * (1 + packingPct / 100);

  // 2) Capacity. Pricing is linear in volume, so capping one load and scaling
  // by the number of loads gives the same number as pricing the whole volume —
  // except when the minimum job floor bites, which is the case this ordering
  // gets right. `loads` and `multiLoad` exist so the operator sees that the job
  // is more than one trip.
  const loadsExact = snapToWhole(capacityFt3 > 0 ? packedCubicFeet / capacityFt3 : 1);
  const multiLoad = loadsExact > 1;
  const loads = Math.max(1, Math.ceil(loadsExact));
  const cappedCubicFeet = capacityFt3 > 0 ? Math.min(packedCubicFeet, capacityFt3) : packedCubicFeet;

  const singleLoadVolumeCents = Math.round(
    (cappedCubicFeet / CUBIC_FEET_PER_YARD) * nonNegative(settings.ratePerYd3Cents),
  );
  const flooredSingleLoadCents = Math.max(nonNegative(settings.minJobCents), singleLoadVolumeCents);
  const minJobApplied =
    !input.heavyMode && flooredSingleLoadCents > singleLoadVolumeCents;
  const volumeCents = Math.round(flooredSingleLoadCents * Math.max(1, loadsExact));

  // 3) Item surcharges.
  const surchargeCents = input.items.reduce(
    (sum, line) => sum + lineSurchargeCents(line, settings),
    0,
  );

  // 4) Labor adders. These apply in both pricing paths.
  const laborCents = laborAddersCents(input.labor, settings);

  // 5) Heavy-material mode replaces the volume path entirely.
  const heavyWeightKg = input.heavyMode ? nonNegative(input.heavy?.estWeightKg ?? 0) : 0;
  const heavyCents = input.heavyMode
    ? Math.round((heavyWeightKg / 1000) * nonNegative(settings.heavyRatePerTonneCents))
    : 0;

  const subtotalCents = input.heavyMode
    ? nonNegative(settings.minJobCents) + heavyCents + laborCents
    : volumeCents + surchargeCents + laborCents;

  // 6) Range, published-tier floor, then discount off both ends, rounded to $5.
  const spread = Math.min(100, Math.max(0, nonNegative(settings.rangeSpreadPct))) / 100;
  let listSubtotalCents = subtotalCents;
  let rawLowCents = subtotalCents * (1 - spread);
  let rawHighCents = subtotalCents * (1 + spread);

  // The floor holds a quote up to the tier the site advertises. It is skipped
  // in two cases. Heavy mode is priced by the tonne and is not on the volume
  // ladder at all. And a load small enough that the minimum job binds *is*
  // the ladder's own first rung ("single item / minimum"), which sits below
  // the quarter-truck floor — applying the quarter floor there would contradict
  // the very table these brackets come from.
  const bracket =
    input.heavyMode || minJobApplied
      ? null
      : findFloorBracket(packedCubicFeet, capacityFt3, settings.priceFloors);

  const floorApplied = bracket !== null && rawLowCents < nonNegative(bracket.floorCents);
  let floorUpliftCents = 0;

  if (bracket && floorApplied) {
    // Lift the subtotal to the value that puts the low end exactly on the
    // floor, then re-derive the range from it. Doing it this way rather than
    // clamping the low alone keeps the spread intact — a clamp would collapse
    // the range, because near the bottom of a bracket the high end is below
    // the floor too. Nothing is ever lowered: the subtotal only goes up.
    const floorCents = nonNegative(bracket.floorCents);
    listSubtotalCents = spread < 1 ? floorCents / (1 - spread) : floorCents;
    floorUpliftCents = Math.round(listSubtotalCents - subtotalCents);
    rawLowCents = floorCents;
    rawHighCents = listSubtotalCents * (1 + spread);
  }

  const lowDiscountCents = discountOffCents(rawLowCents, input.discount);
  const highDiscountCents = discountOffCents(rawHighCents, input.discount);

  const lowCents = roundToNearestFiveDollars(rawLowCents - lowDiscountCents);
  const highCents = roundToNearestFiveDollars(rawHighCents - highDiscountCents);
  const midpointCents = Math.round((lowCents + highCents) / 2);
  const discountCents = Math.round((lowDiscountCents + highDiscountCents) / 2);

  // 7) Internal cost. Never rendered outside the "Internal" block.
  const cubicYards = packedCubicFeet / CUBIC_FEET_PER_YARD;
  const estWeightKg = input.heavyMode
    ? heavyWeightKg
    : cubicYards * nonNegative(settings.avgDensityKgPerYd3);
  const disposalCents = Math.round(
    (estWeightKg / 1000) * nonNegative(settings.tippingFeePerTonneCents),
  );
  const laborHoursEst = estimateLaborHours({
    cubicYards: input.heavyMode ? 0 : cubicYards,
    labor: input.labor,
  });
  const laborCostCents = Math.round(laborHoursEst * nonNegative(settings.laborRatePerHourCents));
  const fuelCents = Math.round(nonNegative(settings.fuelFlatCents));
  const totalCostCents = disposalCents + laborCostCents + fuelCents;

  // 8) Margin is measured against the midpoint the customer would accept, so
  // it already reflects the discount.
  const marginCents = midpointCents - totalCostCents;
  const marginPct = midpointCents > 0 ? (marginCents / midpointCents) * 100 : 0;

  return {
    rawCubicFeet,
    packedCubicFeet,
    cubicYards,
    loads,
    multiLoad,
    volumeCents: input.heavyMode ? 0 : volumeCents,
    minJobApplied,
    surchargeCents: input.heavyMode ? 0 : surchargeCents,
    laborCents,
    heavyMode: input.heavyMode,
    heavyCents,
    subtotalCents: Math.round(listSubtotalCents),
    floorApplied,
    floorLabel: floorApplied && bracket ? bracket.label : null,
    discountCents,
    lowCents,
    highCents,
    midpointCents,
    breakdown: buildBreakdown({
      heavyMode: input.heavyMode,
      heavy: input.heavy ?? null,
      minJobCents: nonNegative(settings.minJobCents),
      heavyCents,
      volumeCents,
      packedCubicFeet,
      cubicYards,
      loads,
      multiLoad,
      surchargeCents,
      laborCents,
      labor: input.labor,
      settings,
      discountCents,
      floorUpliftCents,
      floorLabel: floorApplied && bracket ? bracket.label : null,
    }),
    internal: {
      estWeightKg,
      disposalCents,
      laborHoursEst,
      laborCostCents,
      fuelCents,
      totalCents: totalCostCents,
      marginCents,
      marginPct,
    },
  };
}

function buildBreakdown(args: {
  heavyMode: boolean;
  heavy: HeavyInput | null;
  minJobCents: number;
  heavyCents: number;
  volumeCents: number;
  packedCubicFeet: number;
  cubicYards: number;
  loads: number;
  multiLoad: boolean;
  surchargeCents: number;
  laborCents: number;
  labor: LaborInput;
  settings: PricingSettings;
  discountCents: number;
  floorUpliftCents: number;
  floorLabel: string | null;
}): BreakdownLine[] {
  const lines: BreakdownLine[] = [];

  if (args.heavyMode) {
    lines.push({ label: "Minimum job", amountCents: args.minJobCents });
    lines.push({
      label: "Heavy material",
      amountCents: args.heavyCents,
      detail: `${args.heavy?.materialType ?? "heavy"} · ${Math.round(
        args.heavy?.estWeightKg ?? 0,
      )} kg`,
    });
  } else {
    lines.push({
      label: "Volume",
      amountCents: args.volumeCents,
      detail: `${args.packedCubicFeet.toFixed(0)} ft³ packed · ${args.cubicYards.toFixed(1)} yd³${
        args.multiLoad ? ` · ${args.loads} loads` : ""
      }`,
    });
    if (args.surchargeCents > 0) {
      lines.push({ label: "Item surcharges", amountCents: args.surchargeCents });
    }
  }

  if (args.laborCents > 0) {
    const parts: string[] = [];
    if (wholeCount(args.labor.stairsFlights) > 0) {
      parts.push(`${wholeCount(args.labor.stairsFlights)} flights`);
    }
    if (args.labor.carryDistance === "long") parts.push("long carry");
    if (wholeCount(args.labor.disassembly) > 0) {
      parts.push(`${wholeCount(args.labor.disassembly)} disassembly`);
    }
    lines.push({
      label: "Labor adders",
      amountCents: args.laborCents,
      detail: parts.join(" · ") || undefined,
    });
  }

  if (args.floorUpliftCents > 0 && args.floorLabel) {
    lines.push({
      label: "Published tier floor",
      amountCents: args.floorUpliftCents,
      detail: `lifted to the ${args.floorLabel.toLowerCase()} floor`,
    });
  }

  if (args.discountCents > 0) {
    lines.push({ label: "Discount", amountCents: -args.discountCents });
  }

  return lines;
}

/** `$1,234` — whole dollars, which is the only precision the engine emits. */
export function formatCents(cents: number): string {
  const dollars = Math.round(cents) / 100;
  return `$${dollars.toLocaleString("en-CA", {
    minimumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatRange(lowCents: number, highCents: number): string {
  return `${formatCents(lowCents)}–${formatCents(highCents)}`;
}
