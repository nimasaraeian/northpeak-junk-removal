/**
 * NorthPeak public price list (owner-approved 2026-10-12).
 *
 * Two access tiers per line: Curbside (dry, ready, within ~10 ft of the
 * vehicle, no stairs) and Easy Inside (clear path up to ~30 ft, no stairs, no
 * disassembly). Stairs, long carries and disassembly are quoted first. Heavy
 * material (concrete, soil, tile, drywall) is priced by weight, not volume,
 * because disposal facilities bill it by the tonne.
 *
 * Volume is the fraction of NorthPeak's trailer (7 ft × 12 ft box) the load
 * fills. "Full" ≈ 12.4 cubic yards.
 */

export interface VolumeTier {
  tier: string;
  fits: string;
  upTo: string;
  curbside: number;
  easyInside: number;
}

export const volumeTiers: VolumeTier[] = [
  { tier: "Minimum", fits: "A single item or a few boxes", upTo: "up to ~1 yd³", curbside: 89, easyInside: 119 },
  { tier: "1/8 trailer", fits: "A small pickup-load", upTo: "up to ~1.6 yd³", curbside: 119, easyInside: 149 },
  { tier: "1/4 trailer", fits: "A small bedroom or a packed closet", upTo: "up to ~3.1 yd³", curbside: 149, easyInside: 179 },
  { tier: "1/2 trailer", fits: "A single garage or one full room", upTo: "up to ~6.2 yd³", curbside: 269, easyInside: 319 },
  { tier: "3/4 trailer", fits: "A large clear-out", upTo: "up to ~9.3 yd³", curbside: 369, easyInside: 439 },
  { tier: "Full trailer", fits: "A whole-home or renovation load (≈ 4–5 pickup loads)", upTo: "up to ~12.4 yd³", curbside: 449, easyInside: 549 },
];

export interface SingleItem {
  item: string;
  curbside: number;
  easyInside: number;
}

export const singleItems: SingleItem[] = [
  { item: "Standard chair", curbside: 89, easyInside: 119 },
  { item: "Small lightweight table", curbside: 89, easyInside: 119 },
  { item: "Desk", curbside: 99, easyInside: 129 },
  { item: "Lightweight bookcase", curbside: 99, easyInside: 129 },
  { item: "Disassembled bed frame", curbside: 99, easyInside: 129 },
  { item: "Small dresser", curbside: 99, easyInside: 129 },
  { item: "Standard loveseat", curbside: 109, easyInside: 149 },
  { item: "Lightweight sofa (non-sleeper)", curbside: 119, easyInside: 159 },
  { item: "Compact appliance (no refrigerant)", curbside: 99, easyInside: 129 },
  { item: "Mattress", curbside: 99, easyInside: 129 },
  { item: "Box spring", curbside: 99, easyInside: 129 },
  { item: "Mattress + box spring", curbside: 149, easyInside: 179 },
];

export const pricingTerms: { title: string; body: string }[] = [
  {
    title: "Curbside",
    body: "Items dry and ready within about 10 ft of the vehicle, on the ground floor, with no stairs and a clear public route.",
  },
  {
    title: "Easy Inside",
    body: "A clear, obstacle-free path up to about 30 ft from the vehicle — no stairs and nothing to take apart. Pricing covers items a crew can carry out safely.",
  },
  {
    title: "Stairs & difficult access",
    body: "Stairs, long carries and disassembly add crew time and are quoted first — always confirmed with you before any work starts.",
  },
  {
    title: "Special & heavy items",
    body: "Concrete, soil, tile, drywall and other dense material is priced by weight, not volume. Fridges, freezers and a few large items need extra care and are quoted separately.",
  },
  {
    title: "Mattress recycling",
    body: "Recycling for up to two mattresses or box springs is included. Each additional piece is $25.",
  },
  {
    title: "One flat service area",
    body: "The same pricing across North Vancouver and West Vancouver — no travel surcharge, no postcode premium.",
  },
];
