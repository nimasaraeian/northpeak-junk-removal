/** NorthPeak dump bed — Snake River DMP712-14K 36 (2014). */
export const northPeakTrailer = {
  vehicleType: "trailer" as const,
  manufacturer: "Snake River Trailer Co.",
  manufactureDate: "07/2014",
  vin: "5PTBD1221F1021839",
  model: "DMP712-14K 36",
  gvwrLb: 14000,
  gvwrKg: 6350,
  frontGawrKg: 3175,
  rearGawrKg: 3175,
  tireSize: "ST235/80R16E",
  rimSize: '16×6"',
  tirePressurePsi: 80,
  tirePressureKpa: 552,
  bed: {
    /** Marketing length — 7×12 dump box. */
    lengthFt: 12,
    /** Outside / nominal width. */
    widthFt: 7,
    /**
     * Usable side-wall height, in feet. The plate model code carries the 36"
     * factory sides; the unit runs 12" side extensions, so the real usable
     * height to the top rail is 48" (4 ft). This is the number the published
     * pricing (/pricing) and the quote engine both measure from. Re-measure
     * if the extensions change.
     */
    wallHeightFt: 4,
    /** Typical inside width on SRTC 7-wide dumps. */
    insideWidthIn: 82,
  },
} as const;

/** Usable box volume to top of side walls (7′ × 12′ × 4′ = 336 ft³ ≈ 12.44 yd³). */
export const bedCapacityCuFt =
  northPeakTrailer.bed.lengthFt *
  northPeakTrailer.bed.widthFt *
  northPeakTrailer.bed.wallHeightFt;

export function cubicFeetForFillPercent(fillPercent: number): number {
  if (fillPercent <= 0) return 0;
  return Math.round((bedCapacityCuFt * fillPercent) / 100);
}
