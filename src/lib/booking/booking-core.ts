import { computeQuote, type PricingSettings } from "@/lib/quote-engine";
import { getVolumeLevel, volumeLevels, type VolumeLevelId } from "@/content/truck";

/**
 * Online booking — pure helpers.
 *
 * No I/O and no framework imports, so the same functions run on the public
 * page (to show an instant estimate), in the server action (to re-derive it
 * without trusting the client), and in tests. Everything a booking needs to
 * price and schedule itself is here.
 *
 * A booking is the "Reserve / online booking" door Workiz has and the estimate
 * form did not: the customer picks a load size and a real date and time
 * window, sees an honest range, and the request lands as a lead *and* a job on
 * the calendar — pending the owner's confirmation in the Control Center.
 */

export type BookingWindowId = "morning" | "midday" | "afternoon";

export interface BookingWindow {
  id: BookingWindowId;
  label: string;
  hint: string;
  /** Local (America/Vancouver) wall-clock start and end hours, 24h. */
  startHour: number;
  endHour: number;
}

export const BOOKING_WINDOWS: readonly BookingWindow[] = [
  { id: "morning", label: "Morning", hint: "8:00 – 11:00 AM", startHour: 8, endHour: 11 },
  { id: "midday", label: "Midday", hint: "11:00 AM – 2:00 PM", startHour: 11, endHour: 14 },
  { id: "afternoon", label: "Afternoon", hint: "2:00 – 5:00 PM", startHour: 14, endHour: 17 },
] as const;

export const BOOKING_TIMEZONE = "America/Vancouver";

export function getBookingWindow(id: string): BookingWindow | undefined {
  return BOOKING_WINDOWS.find((w) => w.id === id);
}

export function isBookingWindowId(value: string): value is BookingWindowId {
  return BOOKING_WINDOWS.some((w) => w.id === value);
}

/** `YYYY-MM-DD`, the shape an `<input type="date">` submits. */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidBookingDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime());
}

/**
 * The instant whose America/Vancouver wall-clock time is `dateStr` at `hour`.
 *
 * Built without a timezone library (none can be installed here) using only
 * `Intl`, and correct across daylight-saving changes: it reads back what the
 * zone calls a UTC guess, measures the offset from that, and corrects.
 */
export function zonedInstant(dateStr: string, hour: number, timeZone = BOOKING_TIMEZONE): Date {
  const hh = String(Math.max(0, Math.min(23, Math.floor(hour)))).padStart(2, "0");
  const guess = new Date(`${dateStr}T${hh}:00:00Z`);

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(guess);

  const map: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = Number(part.value);
  }
  // 24:00 is emitted by some engines for midnight; normalise to 0.
  const asUtc = Date.UTC(
    map.year,
    (map.month ?? 1) - 1,
    map.day ?? 1,
    (map.hour ?? 0) % 24,
    map.minute ?? 0,
    map.second ?? 0,
  );
  const offset = asUtc - guess.getTime();
  return new Date(guess.getTime() - offset);
}

export interface BookingSlot {
  start: Date;
  end: Date;
}

/** Resolves a booking's date + window into a scheduled start/end instant. */
export function bookingSlot(dateStr: string, windowId: BookingWindowId): BookingSlot | null {
  const window = getBookingWindow(windowId);
  if (!window || !isValidBookingDate(dateStr)) return null;
  return {
    start: zonedInstant(dateStr, window.startHour),
    end: zonedInstant(dateStr, window.endHour),
  };
}

const dateLabelFormat = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: BOOKING_TIMEZONE,
});

/** Human slot label for notes and confirmations, e.g. "Tue, Oct 14, 2026 · Morning (8:00 – 11:00 AM)". */
export function slotLabel(dateStr: string, windowId: BookingWindowId): string {
  const window = getBookingWindow(windowId);
  if (!window || !isValidBookingDate(dateStr)) return "";
  const day = dateLabelFormat.format(new Date(`${dateStr}T12:00:00Z`));
  return `${day} · ${window.label} (${window.hint})`;
}

export interface EstimateRange {
  lowCents: number;
  highCents: number;
}

/**
 * An honest range for a load of `cubicFeet`, straight from the live pricing
 * engine, so the public figure can never drift from what the admin quotes.
 */
export function estimateForCubicFeet(cubicFeet: number, settings: PricingSettings): EstimateRange {
  const items =
    cubicFeet > 0
      ? [
          {
            catalogId: null,
            label: "Online booking load",
            qty: 1,
            cubicFeetEach: cubicFeet,
            surchargeCents: null,
            flags: [],
          },
        ]
      : [];

  const computed = computeQuote(
    {
      items,
      labor: { stairsFlights: 0, carryDistance: "standard", disassembly: 0 },
      heavyMode: false,
      heavy: null,
      discount: null,
    },
    settings,
  );

  return { lowCents: computed.lowCents, highCents: computed.highCents };
}

export interface BookingLevelEstimate {
  id: VolumeLevelId;
  label: string;
  tabTitle: string;
  blurb: string;
  cubicFeet: number;
  lowCents: number;
  highCents: number;
}

/**
 * Per-load-size estimates for the booking picker. Computed once on the server
 * and handed to the client, so the wizard shows a live range with no engine
 * and no round trip. The empty bed is dropped — there is nothing to book.
 */
export function bookingLevelEstimates(settings: PricingSettings): BookingLevelEstimate[] {
  return volumeLevels
    .filter((level) => level.cubicFeet > 0)
    .map((level) => {
      const range = estimateForCubicFeet(level.cubicFeet, settings);
      return {
        id: level.id,
        label: level.label,
        tabTitle: level.tabTitle,
        blurb: level.blurb,
        cubicFeet: level.cubicFeet,
        lowCents: range.lowCents,
        highCents: range.highCents,
      };
    });
}

export function bookableLevelIds(): VolumeLevelId[] {
  return volumeLevels.filter((level) => level.cubicFeet > 0).map((level) => level.id);
}

export function isBookableLevelId(value: string): boolean {
  return bookableLevelIds().includes(value as VolumeLevelId) && getVolumeLevel(value).cubicFeet > 0;
}
