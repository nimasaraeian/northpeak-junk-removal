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

export interface VolumeLevel {
  id: string;
  label: string;
  blurb: string;
  fill: number;
  cubicFeet: number;
  visitLabel: string;
  fillSrc: string | null;
}

export const volumeLevels: VolumeLevel[] = [
  {
    id: "empty",
    label: "Empty",
    blurb: "Hydraulic dump — bed raised",
    fill: 0,
    cubicFeet: 0,
    visitLabel: "Bed tilted — ready to unload",
    fillSrc: null,
  },
  {
    id: "few",
    label: "A few items",
    blurb: "Floor load",
    fill: 25,
    cubicFeet: 40,
    visitLabel: "Short visit",
    fillSrc: "/truck/junk-fill-25.jpg?v=3",
  },
  {
    id: "room",
    label: "A single room",
    blurb: "Mid bay",
    fill: 50,
    cubicFeet: 110,
    visitLabel: "Standard visit",
    fillSrc: "/truck/junk-fill-50.jpg?v=3",
  },
  {
    id: "garage",
    label: "A garage or storage space",
    blurb: "Upper bay load",
    fill: 75,
    cubicFeet: 200,
    visitLabel: "Full crew visit",
    fillSrc: "/truck/junk-fill-75.jpg?v=3",
  },
  {
    id: "home",
    label: "A full home or commercial suite",
    blurb: "Packed to the roof",
    fill: 100,
    cubicFeet: 300,
    visitLabel: "Extended visit",
    fillSrc: "/truck/junk-fill-100.jpg?v=3",
  },
];

export function getVolumeLevel(id: string) {
  return volumeLevels.find((level) => level.id === id) ?? volumeLevels[0];
}

export interface LoadSummary {
  levelId: string;
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
