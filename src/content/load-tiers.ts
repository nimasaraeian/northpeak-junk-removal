import {
  bedCapacityCuFt,
  cubicFeetForFillPercent,
  northPeakTrailer,
} from "@/content/vehicle";

export type LoadTierId = "small" | "medium" | "large" | "max";

export interface LoadTier {
  id: LoadTierId;
  tabRange: string;
  tabSubtitle: string;
  headline: string;
  label: string;
  tagline: string;
  moment: string;
  visualSrc: string;
  glow: number;
  loadLengthFt: number;
  loadFillPercent: number;
  volumeCuFt: number;
  volumeMinCuFt: number;
  volumeMaxCuFt: number;
  volumeRange: string;
  greatFor: string[];
  visitFeel: string;
  estimateVolumeId: string;
  approxLine: string;
}

const bedLength = northPeakTrailer.bed.lengthFt;

function volumeRangeLabel(min: number, max: number) {
  return `${min} ft\u00b3 \u2013 ${max} ft\u00b3`;
}

export const loadTiers: LoadTier[] = [
  {
    id: "small",
    tabRange: "Minimum – \u00bc",
    tabSubtitle: "Small load",
    headline: "Minimum load – \u00bc load",
    label: "Small Load",
    tagline: "Great for a few pieces, leftover boxes, or one appliance you\u2019re replacing.",
    moment: "Seasonal tidy-up or post-move overflow handled in one stop.",
    visualSrc: "/truck/junk-fill-25.jpg",
    glow: 0.55,
    loadLengthFt: Math.round(bedLength * 0.25),
    loadFillPercent: 25,
    volumeCuFt: cubicFeetForFillPercent(25),
    volumeMinCuFt: 0,
    volumeMaxCuFt: cubicFeetForFillPercent(25),
    volumeRange: volumeRangeLabel(0, cubicFeetForFillPercent(25)),
    greatFor: [
      "Seasonal cleanups and leftover boxes",
      "Making space for new furniture",
      "A sofa, mattress, or appliance you\u2019re replacing",
      "Unsold or leftover items after a move-out",
    ],
    visitFeel: "Short visit \u2014 we load while you point.",
    estimateVolumeId: "few",
    approxLine: "Approximately a minimum to \u00bc load.",
  },
  {
    id: "medium",
    tabRange: "\u00bc – \u00bd",
    tabSubtitle: "Medium load",
    headline: "\u00bc load – \u00bd load",
    label: "Medium Load",
    tagline: "Great for a garage, storage room, or room cleanout.",
    moment: "Bedroom, office, or garage corner \u2014 reset in a single visit.",
    visualSrc: "/truck/junk-fill-50.jpg",
    glow: 0.68,
    loadLengthFt: Math.round(bedLength * 0.5),
    loadFillPercent: 50,
    volumeCuFt: cubicFeetForFillPercent(50),
    volumeMinCuFt: cubicFeetForFillPercent(25),
    volumeMaxCuFt: cubicFeetForFillPercent(50),
    volumeRange: volumeRangeLabel(
      cubicFeetForFillPercent(25),
      cubicFeetForFillPercent(50),
    ),
    greatFor: [
      "Garage, basement, or storage-room cleanouts",
      "Tools, old equipment, shelving, and sports gear",
      "The bulk of items left in a small rental",
      "A selective cleanout of large items in 2\u20133 rooms",
    ],
    visitFeel: "Standard visit \u2014 calm crew, clear outcome.",
    estimateVolumeId: "room",
    approxLine: "Approximately a \u00bc to \u00bd load.",
  },
  {
    id: "large",
    tabRange: "\u00bd – \u00be",
    tabSubtitle: "Large load",
    headline: "\u00bd load – \u00be load",
    label: "Large Load",
    tagline: "Great for a full garage, storage unit, or several accumulated rooms.",
    moment: "Full garage, storage unit, or multi-room push in one crew visit.",
    visualSrc: "/truck/junk-fill-75.jpg",
    glow: 0.82,
    loadLengthFt: Math.round(bedLength * 0.75),
    loadFillPercent: 75,
    volumeCuFt: cubicFeetForFillPercent(75),
    volumeMinCuFt: cubicFeetForFillPercent(50),
    volumeMaxCuFt: cubicFeetForFillPercent(75),
    volumeRange: volumeRangeLabel(
      cubicFeetForFillPercent(50),
      cubicFeetForFillPercent(75),
    ),
    greatFor: [
      "Full garage or storage-unit cleanouts",
      "Estate or downsizing \u2014 part of the home",
      "Renovation furnishings and debris",
      "A major cleanout across a few accumulated rooms",
    ],
    visitFeel: "Full crew \u2014 thorough, respectful, on schedule.",
    estimateVolumeId: "garage",
    approxLine: "Approximately a \u00bd to \u00be load.",
  },
  {
    id: "max",
    tabRange: "Full load",
    tabSubtitle: "Maximum",
    headline: "Full load",
    label: "Full Load",
    tagline: "Great for a whole-home move-out, renovation, or complete clear-out.",
    moment: "Whole-home, move-out, or commercial suite \u2014 handled end to end.",
    visualSrc: "/truck/junk-fill-100.jpg",
    glow: 0.95,
    loadLengthFt: bedLength,
    loadFillPercent: 100,
    volumeCuFt: bedCapacityCuFt,
    volumeMinCuFt: cubicFeetForFillPercent(75),
    volumeMaxCuFt: bedCapacityCuFt,
    volumeRange: volumeRangeLabel(cubicFeetForFillPercent(75), bedCapacityCuFt),
    greatFor: [
      "Complete home move-outs or renovations",
      "Whole 3\u20134 bedroom downsizing",
      "All major furnishings from an entire home",
      "A major cleanout across the property",
    ],
    visitFeel: "Extended visit \u2014 we stay until it\u2019s right.",
    estimateVolumeId: "home",
    approxLine: "Approximately a full load.",
  },
];

export const defaultLoadTierId: LoadTierId = "medium";

export function getLoadTier(id: string): LoadTier {
  const resolved = resolveLoadTierId(id);
  return loadTiers.find((tier) => tier.id === resolved) ?? loadTiers[1];
}

export function isLoadTierId(value: string): value is LoadTierId {
  return loadTiers.some((tier) => tier.id === value);
}

const legacyTierMap: Record<string, LoadTierId> = {
  min: "small",
  few: "small",
  small: "small",
  empty: "small",
  room: "medium",
  medium: "medium",
  large: "large",
  garage: "large",
  full: "max",
  max: "max",
  home: "max",
};

export function resolveLoadTierId(param?: string | null): LoadTierId {
  if (!param) return defaultLoadTierId;
  if (isLoadTierId(param)) return param;
  return legacyTierMap[param] ?? defaultLoadTierId;
}
