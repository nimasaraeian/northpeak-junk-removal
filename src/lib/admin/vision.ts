import { z } from "zod";
import { ITEM_FLAGS } from "@/lib/quote-engine";

/**
 * Shapes and prompt for the photo-assist call.
 *
 * Kept out of the route handler so the schema and the prompt can be unit
 * tested without an API key or a request.
 *
 * The model is an assistant, never the decider: everything it returns lands
 * in the item list as an editable row that the operator confirms, edits or
 * deletes. Nothing is priced from a suggestion alone.
 */

export const MAX_IMAGES = 4;
/** Roughly 4 MB of decoded image; base64 inflates by about a third. */
export const MAX_IMAGE_BASE64_CHARS = Math.ceil((4 * 1024 * 1024 * 4) / 3);

export const SUPPORTED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const visionRequestSchema = z.object({
  images: z
    .array(
      z.object({
        mediaType: z.enum(SUPPORTED_MEDIA_TYPES),
        data: z.string().min(1).max(MAX_IMAGE_BASE64_CHARS),
      }),
    )
    .min(1)
    .max(MAX_IMAGES),
});

export const visionSuggestionSchema = z.object({
  label: z.string().trim().min(1).max(120),
  matchedCatalogName: z.string().trim().max(120).nullable(),
  qty: z.number().int().min(1).max(200),
  estCubicFeetEach: z.number().min(0).max(2000),
  confidence: z.number().min(0).max(1),
  flags: z.array(z.enum(ITEM_FLAGS)).max(ITEM_FLAGS.length),
});

export const visionResultSchema = z.object({
  items: z.array(visionSuggestionSchema).max(60),
  overall: z.object({
    complexJob: z.boolean(),
    reason: z.string().trim().max(400),
  }),
});

export type VisionSuggestion = z.infer<typeof visionSuggestionSchema>;
export type VisionResult = z.infer<typeof visionResultSchema>;

/** JSON Schema for the tool the model is made to call. */
export const VISION_TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    items: {
      type: "array",
      description: "One entry per distinct item type visible across the photos.",
      items: {
        type: "object",
        properties: {
          label: { type: "string", description: "Short human name, e.g. 'Sofa (3-seat)'." },
          matchedCatalogName: {
            type: ["string", "null"],
            description:
              "Exact name from the supplied catalog list when one clearly matches, otherwise null.",
          },
          qty: { type: "integer", minimum: 1 },
          estCubicFeetEach: {
            type: "number",
            description: "Estimated cubic feet for ONE of this item.",
          },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          flags: {
            type: "array",
            items: { type: "string", enum: [...ITEM_FLAGS] },
          },
        },
        required: [
          "label",
          "matchedCatalogName",
          "qty",
          "estCubicFeetEach",
          "confidence",
          "flags",
        ],
        additionalProperties: false,
      },
    },
    overall: {
      type: "object",
      properties: {
        complexJob: { type: "boolean" },
        reason: { type: "string" },
      },
      required: ["complexJob", "reason"],
      additionalProperties: false,
    },
  },
  required: ["items", "overall"],
  additionalProperties: false,
};

export const VISION_TOOL_NAME = "report_items";

export function buildVisionSystemPrompt(catalogNames: string[]): string {
  return [
    "You are helping a junk removal estimator in North Vancouver, BC read job photos.",
    "",
    `Call the ${VISION_TOOL_NAME} tool exactly once. Do not write prose.`,
    "",
    "Rules:",
    "- List each distinct item type once, with a quantity — not one entry per photo.",
    "- Do not double-count an item that appears in more than one photo of the same space.",
    "- estCubicFeetEach is the space ONE of that item takes in a truck, not its bounding box.",
    "- matchedCatalogName must be copied character for character from the catalog list below, or be null. Never invent a name.",
    "- Set flags from what the item is: mattress for mattresses and box springs, freon for fridges, freezers and AC units, tire for tires, tv for televisions and monitors, piano for pianos, hot tubs and pool tables, hazmat for paint, propane, chemicals and batteries, heavy for concrete, soil, tile and shingles.",
    "- confidence is your own certainty, 0 to 1. Be honest; a low number is more useful than a confident guess.",
    "",
    "Typical truck volume for ONE item, as anchors — scale up or down for the size you actually see:",
    "- 3-seat sofa ~50 ft3, loveseat ~35, armchair or recliner ~20",
    "- Mattress ~20 (king ~30), box spring ~15, bed frame ~15",
    "- Fridge ~35, washer or dryer ~25 each, stove or oven ~20, dishwasher ~15, microwave ~3",
    "- Dresser ~25, wardrobe or armoire ~40, nightstand ~8, bookshelf ~20, filing cabinet ~12",
    "- Dining table ~30, dining chair ~6, office desk ~25, office chair ~10, coffee table ~12",
    "- TV ~6, treadmill ~30, exercise bike ~12, bicycle ~10, BBQ ~20",
    "- Standard moving box or kitchen trash bag ~3, 32-gallon bin ~5",
    "- Hot tub ~120, upright piano ~70, pool table ~60",
    "Do not undercount bulky items, or things stacked behind or under others; estimate the realistic total volume, not just what is perfectly in frame.",
    "",
    "Set overall.complexJob to true — and return an empty items array — when the photos show:",
    "- an estate cleanout or a whole-home clear-out,",
    "- a construction or demolition debris pile,",
    "- hoarding conditions,",
    "- or photos too dark, blurry or cropped to read.",
    "In those cases a human prices it. Say why in one short sentence.",
    "",
    "Catalog names available for matching:",
    catalogNames.join(", "),
  ].join("\n");
}

export const VISION_USER_PROMPT =
  "Identify the removable items in these photos and report them with the tool.";
