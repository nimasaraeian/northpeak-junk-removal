import type { ItemFlag } from "@/lib/quote-engine";

/**
 * The starting items catalog.
 *
 * Cubic-feet figures are the industry working estimates a junk removal crew
 * quotes from — the space a piece occupies in the box, not its bounding box.
 * They are deliberately round: the packing factor in the engine absorbs the
 * air between pieces, so a figure being 10% out on one item does not move a
 * quote meaningfully.
 *
 * This module is the source of truth. `drizzle/0000_northpeak_ops.sql` seeds
 * the same rows, and `catalog-seed.test.ts` asserts the two agree, so an item
 * added here without a matching migration row fails the suite.
 */
export interface CatalogSeedItem {
  name: string;
  category: string;
  cubicFeet: number;
  /** Overrides the flag-derived surcharge when set. Null means "use flags". */
  defaultSurchargeCents: number | null;
  flags: ItemFlag[];
}

export const CATALOG_CATEGORIES = [
  "Furniture",
  "Mattresses & Bedding",
  "Appliances",
  "Electronics",
  "Outdoor & Recreation",
  "Fitness",
  "Renovation & Fixtures",
  "Boxes & Bags",
  "Specialty & Hazardous",
] as const;

export const CATALOG_SEED: CatalogSeedItem[] = [
  // --- Furniture -----------------------------------------------------------
  { name: "Sofa (3-seat)", category: "Furniture", cubicFeet: 45, defaultSurchargeCents: null, flags: [] },
  { name: "Loveseat", category: "Furniture", cubicFeet: 30, defaultSurchargeCents: null, flags: [] },
  { name: "Sectional (full)", category: "Furniture", cubicFeet: 90, defaultSurchargeCents: null, flags: [] },
  { name: "Sectional piece", category: "Furniture", cubicFeet: 40, defaultSurchargeCents: null, flags: [] },
  { name: "Armchair", category: "Furniture", cubicFeet: 20, defaultSurchargeCents: null, flags: [] },
  { name: "Recliner", category: "Furniture", cubicFeet: 25, defaultSurchargeCents: null, flags: [] },
  { name: "Ottoman", category: "Furniture", cubicFeet: 6, defaultSurchargeCents: null, flags: [] },
  { name: "Coffee table", category: "Furniture", cubicFeet: 10, defaultSurchargeCents: null, flags: [] },
  { name: "End table", category: "Furniture", cubicFeet: 5, defaultSurchargeCents: null, flags: [] },
  { name: "Dining table", category: "Furniture", cubicFeet: 25, defaultSurchargeCents: null, flags: [] },
  { name: "Dining chair", category: "Furniture", cubicFeet: 6, defaultSurchargeCents: null, flags: [] },
  { name: "Bar stool", category: "Furniture", cubicFeet: 5, defaultSurchargeCents: null, flags: [] },
  { name: "Dresser (small)", category: "Furniture", cubicFeet: 20, defaultSurchargeCents: null, flags: [] },
  { name: "Dresser (large)", category: "Furniture", cubicFeet: 35, defaultSurchargeCents: null, flags: [] },
  { name: "Nightstand", category: "Furniture", cubicFeet: 6, defaultSurchargeCents: null, flags: [] },
  { name: "Wardrobe / armoire", category: "Furniture", cubicFeet: 45, defaultSurchargeCents: null, flags: [] },
  { name: "Bookshelf (small)", category: "Furniture", cubicFeet: 12, defaultSurchargeCents: null, flags: [] },
  { name: "Bookshelf (large)", category: "Furniture", cubicFeet: 25, defaultSurchargeCents: null, flags: [] },
  { name: "Desk (office)", category: "Furniture", cubicFeet: 25, defaultSurchargeCents: null, flags: [] },
  { name: "Desk (writing)", category: "Furniture", cubicFeet: 14, defaultSurchargeCents: null, flags: [] },
  { name: "Office chair", category: "Furniture", cubicFeet: 10, defaultSurchargeCents: null, flags: [] },
  { name: "Filing cabinet (4-drawer)", category: "Furniture", cubicFeet: 12, defaultSurchargeCents: null, flags: [] },
  { name: "China cabinet", category: "Furniture", cubicFeet: 40, defaultSurchargeCents: null, flags: [] },
  { name: "Entertainment centre", category: "Furniture", cubicFeet: 30, defaultSurchargeCents: null, flags: [] },
  { name: "Crib", category: "Furniture", cubicFeet: 15, defaultSurchargeCents: null, flags: [] },
  { name: "Shelving unit (metal)", category: "Furniture", cubicFeet: 15, defaultSurchargeCents: null, flags: [] },
  { name: "Mirror (large)", category: "Furniture", cubicFeet: 5, defaultSurchargeCents: null, flags: [] },
  { name: "Area rug (rolled)", category: "Furniture", cubicFeet: 12, defaultSurchargeCents: null, flags: [] },
  { name: "Floor lamp", category: "Furniture", cubicFeet: 4, defaultSurchargeCents: null, flags: [] },
  { name: "Grandfather clock", category: "Furniture", cubicFeet: 15, defaultSurchargeCents: null, flags: [] },
  { name: "Safe (small)", category: "Furniture", cubicFeet: 8, defaultSurchargeCents: null, flags: [] },

  // --- Mattresses & bedding ------------------------------------------------
  { name: "Mattress (twin)", category: "Mattresses & Bedding", cubicFeet: 18, defaultSurchargeCents: null, flags: ["mattress"] },
  { name: "Mattress (full)", category: "Mattresses & Bedding", cubicFeet: 25, defaultSurchargeCents: null, flags: ["mattress"] },
  { name: "Mattress (queen)", category: "Mattresses & Bedding", cubicFeet: 30, defaultSurchargeCents: null, flags: ["mattress"] },
  { name: "Mattress (king)", category: "Mattresses & Bedding", cubicFeet: 40, defaultSurchargeCents: null, flags: ["mattress"] },
  { name: "Box spring (twin)", category: "Mattresses & Bedding", cubicFeet: 15, defaultSurchargeCents: null, flags: ["mattress"] },
  { name: "Box spring (queen)", category: "Mattresses & Bedding", cubicFeet: 25, defaultSurchargeCents: null, flags: ["mattress"] },
  { name: "Box spring (king)", category: "Mattresses & Bedding", cubicFeet: 32, defaultSurchargeCents: null, flags: ["mattress"] },
  { name: "Futon", category: "Mattresses & Bedding", cubicFeet: 25, defaultSurchargeCents: null, flags: ["mattress"] },
  { name: "Bed frame (queen)", category: "Mattresses & Bedding", cubicFeet: 15, defaultSurchargeCents: null, flags: [] },
  { name: "Headboard", category: "Mattresses & Bedding", cubicFeet: 8, defaultSurchargeCents: null, flags: [] },

  // --- Appliances ----------------------------------------------------------
  { name: "Fridge (standard)", category: "Appliances", cubicFeet: 35, defaultSurchargeCents: null, flags: ["freon"] },
  { name: "Fridge (French door)", category: "Appliances", cubicFeet: 45, defaultSurchargeCents: null, flags: ["freon"] },
  { name: "Chest freezer", category: "Appliances", cubicFeet: 30, defaultSurchargeCents: null, flags: ["freon"] },
  { name: "Upright freezer", category: "Appliances", cubicFeet: 28, defaultSurchargeCents: null, flags: ["freon"] },
  { name: "Washer", category: "Appliances", cubicFeet: 20, defaultSurchargeCents: null, flags: [] },
  { name: "Dryer", category: "Appliances", cubicFeet: 20, defaultSurchargeCents: null, flags: [] },
  { name: "Dishwasher", category: "Appliances", cubicFeet: 15, defaultSurchargeCents: null, flags: [] },
  { name: "Stove / range", category: "Appliances", cubicFeet: 25, defaultSurchargeCents: null, flags: [] },
  { name: "Microwave", category: "Appliances", cubicFeet: 4, defaultSurchargeCents: null, flags: [] },
  { name: "Range hood", category: "Appliances", cubicFeet: 5, defaultSurchargeCents: null, flags: [] },
  { name: "Water heater", category: "Appliances", cubicFeet: 20, defaultSurchargeCents: null, flags: [] },
  { name: "Furnace", category: "Appliances", cubicFeet: 30, defaultSurchargeCents: null, flags: [] },
  { name: "Air conditioner (window)", category: "Appliances", cubicFeet: 8, defaultSurchargeCents: null, flags: ["freon"] },
  { name: "Dehumidifier", category: "Appliances", cubicFeet: 6, defaultSurchargeCents: null, flags: ["freon"] },
  { name: "Water cooler", category: "Appliances", cubicFeet: 8, defaultSurchargeCents: null, flags: ["freon"] },

  // --- Electronics ---------------------------------------------------------
  { name: 'TV (32" or smaller)', category: "Electronics", cubicFeet: 5, defaultSurchargeCents: null, flags: ["tv"] },
  { name: 'TV (33–55")', category: "Electronics", cubicFeet: 10, defaultSurchargeCents: null, flags: ["tv"] },
  { name: 'TV (56" or larger)', category: "Electronics", cubicFeet: 18, defaultSurchargeCents: null, flags: ["tv"] },
  { name: "TV (CRT / tube)", category: "Electronics", cubicFeet: 15, defaultSurchargeCents: null, flags: ["tv"] },
  { name: "Computer monitor", category: "Electronics", cubicFeet: 3, defaultSurchargeCents: null, flags: ["tv"] },
  { name: "Desktop computer", category: "Electronics", cubicFeet: 3, defaultSurchargeCents: null, flags: [] },
  { name: "Printer", category: "Electronics", cubicFeet: 4, defaultSurchargeCents: null, flags: [] },
  { name: "Stereo / speaker pair", category: "Electronics", cubicFeet: 8, defaultSurchargeCents: null, flags: [] },
  { name: "E-waste (per box)", category: "Electronics", cubicFeet: 3, defaultSurchargeCents: null, flags: [] },

  // --- Outdoor & recreation ------------------------------------------------
  { name: "BBQ (propane)", category: "Outdoor & Recreation", cubicFeet: 25, defaultSurchargeCents: null, flags: [] },
  { name: "Patio set (table + 4 chairs)", category: "Outdoor & Recreation", cubicFeet: 50, defaultSurchargeCents: null, flags: [] },
  { name: "Patio umbrella", category: "Outdoor & Recreation", cubicFeet: 6, defaultSurchargeCents: null, flags: [] },
  { name: "Hot tub", category: "Outdoor & Recreation", cubicFeet: 250, defaultSurchargeCents: null, flags: ["piano"] },
  { name: "Lawn mower (push)", category: "Outdoor & Recreation", cubicFeet: 15, defaultSurchargeCents: null, flags: [] },
  { name: "Snow blower", category: "Outdoor & Recreation", cubicFeet: 20, defaultSurchargeCents: null, flags: [] },
  { name: "Bicycle", category: "Outdoor & Recreation", cubicFeet: 12, defaultSurchargeCents: null, flags: [] },
  { name: "Kayak / canoe", category: "Outdoor & Recreation", cubicFeet: 30, defaultSurchargeCents: null, flags: [] },
  { name: "Fence panel", category: "Outdoor & Recreation", cubicFeet: 8, defaultSurchargeCents: null, flags: [] },
  { name: "Garden shed (dismantled)", category: "Outdoor & Recreation", cubicFeet: 120, defaultSurchargeCents: null, flags: [] },

  // --- Fitness -------------------------------------------------------------
  { name: "Treadmill", category: "Fitness", cubicFeet: 45, defaultSurchargeCents: null, flags: [] },
  { name: "Elliptical", category: "Fitness", cubicFeet: 40, defaultSurchargeCents: null, flags: [] },
  { name: "Exercise bike", category: "Fitness", cubicFeet: 20, defaultSurchargeCents: null, flags: [] },
  { name: "Weight bench", category: "Fitness", cubicFeet: 15, defaultSurchargeCents: null, flags: [] },
  { name: "Weight set (plates)", category: "Fitness", cubicFeet: 8, defaultSurchargeCents: null, flags: [] },
  { name: "Home gym (multi-station)", category: "Fitness", cubicFeet: 70, defaultSurchargeCents: null, flags: [] },

  // --- Renovation & fixtures ----------------------------------------------
  { name: "Carpet roll (per room)", category: "Renovation & Fixtures", cubicFeet: 30, defaultSurchargeCents: null, flags: [] },
  { name: "Carpet underlay roll", category: "Renovation & Fixtures", cubicFeet: 15, defaultSurchargeCents: null, flags: [] },
  { name: "Plywood sheet", category: "Renovation & Fixtures", cubicFeet: 2, defaultSurchargeCents: null, flags: [] },
  { name: "Drywall sheet", category: "Renovation & Fixtures", cubicFeet: 2, defaultSurchargeCents: null, flags: [] },
  { name: "Lumber (bundle)", category: "Renovation & Fixtures", cubicFeet: 10, defaultSurchargeCents: null, flags: [] },
  { name: "Interior door", category: "Renovation & Fixtures", cubicFeet: 6, defaultSurchargeCents: null, flags: [] },
  { name: "Exterior door", category: "Renovation & Fixtures", cubicFeet: 10, defaultSurchargeCents: null, flags: [] },
  { name: "Window (standard)", category: "Renovation & Fixtures", cubicFeet: 8, defaultSurchargeCents: null, flags: [] },
  { name: "Toilet", category: "Renovation & Fixtures", cubicFeet: 10, defaultSurchargeCents: null, flags: [] },
  { name: "Bathroom sink", category: "Renovation & Fixtures", cubicFeet: 6, defaultSurchargeCents: null, flags: [] },
  { name: "Kitchen sink", category: "Renovation & Fixtures", cubicFeet: 8, defaultSurchargeCents: null, flags: [] },
  { name: "Bathtub", category: "Renovation & Fixtures", cubicFeet: 40, defaultSurchargeCents: null, flags: [] },
  { name: "Vanity", category: "Renovation & Fixtures", cubicFeet: 20, defaultSurchargeCents: null, flags: [] },
  { name: "Kitchen cabinet (upper)", category: "Renovation & Fixtures", cubicFeet: 10, defaultSurchargeCents: null, flags: [] },
  { name: "Kitchen cabinet (base)", category: "Renovation & Fixtures", cubicFeet: 15, defaultSurchargeCents: null, flags: [] },
  { name: "Countertop section", category: "Renovation & Fixtures", cubicFeet: 12, defaultSurchargeCents: null, flags: [] },
  { name: "Scrap metal (per pile)", category: "Renovation & Fixtures", cubicFeet: 10, defaultSurchargeCents: null, flags: [] },

  // --- Boxes & bags --------------------------------------------------------
  { name: "Box (small)", category: "Boxes & Bags", cubicFeet: 1.5, defaultSurchargeCents: null, flags: [] },
  { name: "Box (medium)", category: "Boxes & Bags", cubicFeet: 3, defaultSurchargeCents: null, flags: [] },
  { name: "Box (large)", category: "Boxes & Bags", cubicFeet: 4.5, defaultSurchargeCents: null, flags: [] },
  { name: "Garbage bag (kitchen)", category: "Boxes & Bags", cubicFeet: 2, defaultSurchargeCents: null, flags: [] },
  { name: "Garbage bag (contractor)", category: "Boxes & Bags", cubicFeet: 4, defaultSurchargeCents: null, flags: [] },
  { name: "Storage tote / bin", category: "Boxes & Bags", cubicFeet: 3, defaultSurchargeCents: null, flags: [] },
  { name: "Suitcase", category: "Boxes & Bags", cubicFeet: 4, defaultSurchargeCents: null, flags: [] },

  // --- Specialty & hazardous ----------------------------------------------
  { name: "Piano (upright)", category: "Specialty & Hazardous", cubicFeet: 70, defaultSurchargeCents: null, flags: ["piano"] },
  { name: "Piano (baby grand)", category: "Specialty & Hazardous", cubicFeet: 120, defaultSurchargeCents: null, flags: ["piano"] },
  { name: "Organ", category: "Specialty & Hazardous", cubicFeet: 50, defaultSurchargeCents: null, flags: ["piano"] },
  { name: "Pool table", category: "Specialty & Hazardous", cubicFeet: 80, defaultSurchargeCents: null, flags: ["piano"] },
  { name: "Tire (car)", category: "Specialty & Hazardous", cubicFeet: 4, defaultSurchargeCents: null, flags: ["tire"] },
  { name: "Tire (truck)", category: "Specialty & Hazardous", cubicFeet: 6, defaultSurchargeCents: null, flags: ["tire"] },
  { name: "Paint can (1 gal)", category: "Specialty & Hazardous", cubicFeet: 0.5, defaultSurchargeCents: null, flags: ["hazmat"] },
  { name: "Propane tank (20 lb)", category: "Specialty & Hazardous", cubicFeet: 2, defaultSurchargeCents: null, flags: ["hazmat"] },
  { name: "Car battery", category: "Specialty & Hazardous", cubicFeet: 1.5, defaultSurchargeCents: null, flags: ["hazmat"] },
  { name: "Motor oil (jug)", category: "Specialty & Hazardous", cubicFeet: 0.5, defaultSurchargeCents: null, flags: ["hazmat"] },
  { name: "Concrete (per wheelbarrow)", category: "Specialty & Hazardous", cubicFeet: 4, defaultSurchargeCents: null, flags: ["heavy"] },
  { name: "Soil / dirt (per wheelbarrow)", category: "Specialty & Hazardous", cubicFeet: 4, defaultSurchargeCents: null, flags: ["heavy"] },
  { name: "Roofing shingles (bundle)", category: "Specialty & Hazardous", cubicFeet: 3, defaultSurchargeCents: null, flags: ["heavy"] },
  { name: "Tile (per box)", category: "Specialty & Hazardous", cubicFeet: 1.5, defaultSurchargeCents: null, flags: ["heavy"] },
  { name: "Brick / block (per pallet)", category: "Specialty & Hazardous", cubicFeet: 15, defaultSurchargeCents: null, flags: ["heavy"] },
];
