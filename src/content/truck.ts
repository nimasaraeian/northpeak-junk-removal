/** Number of drag-to-rotate steps (cab-over junk truck views). */
export const truckFrameCount = 7;

/** Frame index for rear / tailgate-open load inspection. */
export const truckRearFrameIndex = 5;

export interface VolumeLevel {
  id: string;
  label: string;
  blurb: string;
  fill: number;
  cubicFeet: number;
  visitLabel: string;
}

export const volumeLevels: VolumeLevel[] = [
  {
    id: "empty",
    label: "Empty",
    blurb: "Nothing staged yet",
    fill: 0,
    cubicFeet: 0,
    visitLabel: "Drag to inspect the bay",
  },
  {
    id: "few",
    label: "A few items",
    blurb: "Floor load",
    fill: 25,
    cubicFeet: 40,
    visitLabel: "Short visit",
  },
  {
    id: "room",
    label: "A single room",
    blurb: "Mid bay",
    fill: 50,
    cubicFeet: 110,
    visitLabel: "Standard visit",
  },
  {
    id: "garage",
    label: "A garage or storage space",
    blurb: "Upper bay load",
    fill: 75,
    cubicFeet: 200,
    visitLabel: "Full crew visit",
  },
  {
    id: "home",
    label: "A full home or commercial suite",
    blurb: "Packed to the roof",
    fill: 100,
    cubicFeet: 300,
    visitLabel: "Extended visit",
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
