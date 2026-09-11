import { bedCapacityCuFt, cubicFeetForFillPercent, northPeakTrailer } from "@/content/vehicle";

export const truckFrames = [
  "/truck/junk-00.jpg",
  "/truck/junk-01.jpg",
  "/truck/junk-02.jpg",
  "/truck/junk-03.jpg",
  "/truck/junk-04.jpg",
  "/truck/junk-05.jpg",
  "/truck/junk-06.jpg",
] as const;

/** Frame index — open rear dump box (fill overlays apply here). */
export const truckRearFrameIndex = 3;

export const truckFrameCount = truckFrames.length;

export type VolumeLevelId = "empty" | "few" | "room" | "garage" | "home";

export interface VolumeLevel {
  id: VolumeLevelId;
  label: string;
  blurb: string;
  /** Tab card — primary line */
  tabTitle: string;
  /** Tab card — secondary line */
  tabSubtitle: string;
  /** Detail panel headline */
  headline: string;
  fill: number;
  cubicFeet: number;
  /** How far junk extends into the bed (feet), for dimension callout */
  loadLengthFt: number;
  visitLabel: string;
  fillSrc: string | null;
  greatFor: string[];
}

export const volumeLevels: VolumeLevel[] = [
  {
    id: "empty",
    label: "Empty bed",
    tabTitle: "Empty",
    tabSubtitle: "Open bay",
    headline: "Empty bed — ready to load",
    blurb: "Hydraulic dump — point to what goes",
    fill: 0,
    cubicFeet: 0,
    loadLengthFt: 0,
    visitLabel: "Arrival — bay open",
    fillSrc: null,
    greatFor: [
      "Compare your project to an open 7×12 box",
      "See full bed dimensions before you book",
    ],
  },
  {
    id: "few",
    label: "A few items",
    tabTitle: "¼ load",
    tabSubtitle: "Few items",
    headline: "Minimum load — ¼ bay",
    blurb: "Floor load near the cab",
    fill: 25,
    cubicFeet: cubicFeetForFillPercent(25),
    loadLengthFt: 3,
    visitLabel: "Short visit",
    fillSrc: "/truck/junk-fill-25.jpg",
    greatFor: [
      "Single sofa, mattress, or appliance",
      "A few boxes after a small move",
      "Replacing one large piece of furniture",
      "Seasonal cleanup — one area only",
    ],
  },
  {
    id: "room",
    label: "A single room",
    tabTitle: "½ load",
    tabSubtitle: "One room",
    headline: "Mid load — ½ bay",
    blurb: "Half the box — standard visit",
    fill: 50,
    cubicFeet: cubicFeetForFillPercent(50),
    loadLengthFt: 6,
    visitLabel: "Standard visit",
    fillSrc: "/truck/junk-fill-50.jpg",
    greatFor: [
      "Bedroom or home office cleanout",
      "Garage corner or storage refresh",
      "Leftover items from a small renovation",
      "Selective cleanout across 2–3 rooms",
    ],
  },
  {
    id: "garage",
    label: "A garage or storage space",
    tabTitle: "¾ load",
    tabSubtitle: "Garage scale",
    headline: "Upper load — ¾ bay",
    blurb: "Most of the box — full crew",
    fill: 75,
    cubicFeet: cubicFeetForFillPercent(75),
    loadLengthFt: 9,
    visitLabel: "Full crew visit",
    fillSrc: "/truck/junk-fill-75.jpg",
    greatFor: [
      "Full garage or storage unit cleanout",
      "Multi-room selective cleanout",
      "Estate or downsizing — partial home",
      "Bulk of items from a rental turnover",
    ],
  },
  {
    id: "home",
    label: "A full home or commercial suite",
    tabTitle: "Full load",
    tabSubtitle: "Whole home",
    headline: "Full load — packed bay",
    blurb: "To the sidewalls — extended visit",
    fill: 100,
    cubicFeet: bedCapacityCuFt,
    loadLengthFt: northPeakTrailer.bed.lengthFt,
    visitLabel: "Extended visit",
    fillSrc: "/truck/junk-fill-100.jpg",
    greatFor: [
      "Whole-home or commercial suite clear-out",
      "Major renovation debris and furnishings",
      "Multiple rooms across the property",
      "Complete move-out or downsizing",
    ],
  },
];

export const defaultVolumeLevelId: VolumeLevelId = "room";

export function getVolumeLevel(id: string): VolumeLevel {
  return volumeLevels.find((level) => level.id === id) ?? volumeLevels[2];
}

export function isVolumeLevelId(value: string): value is VolumeLevelId {
  return volumeLevels.some((level) => level.id === value);
}

/** Legacy load-tier slugs from earlier homepage links. */
const legacyLoadMap: Record<string, VolumeLevelId> = {
  few: "few",
  room: "room",
  large: "garage",
};

export function resolveVolumeLevelId(param?: string | null): VolumeLevelId {
  if (!param) return defaultVolumeLevelId;
  if (isVolumeLevelId(param)) return param;
  return legacyLoadMap[param] ?? defaultVolumeLevelId;
}

export interface LoadSummary {
  levelId: VolumeLevelId;
  cubicFeet: number;
  fill: number;
  volumeLabel: string;
  visitLabel: string;
  itemLine: string;
  manifest: Array<{ id: string; name: string; quantity: number; cubicFeet: number }>;
}

export function summarizeVolume(levelId: string): LoadSummary {
  const level = getVolumeLevel(levelId);
  return {
    levelId: level.id,
    cubicFeet: level.cubicFeet,
    fill: level.fill,
    volumeLabel: level.id === "empty" ? "Not filled yet" : level.label,
    visitLabel: level.visitLabel,
    itemLine:
      level.id === "empty"
        ? "Choose a fill level to size the visit."
        : `${level.label} · ~${level.cubicFeet} cu ft`,
    manifest:
      level.id === "empty"
        ? []
        : [{ id: level.id, name: level.label, quantity: 1, cubicFeet: level.cubicFeet }],
  };
}

export { bedCapacityCuFt, northPeakTrailer };
