import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { anthropicApiKey, visionModel } from "@/lib/admin/config";
import { loadCatalog, loadPricingSettings } from "@/lib/admin/data";
import { isOriginAllowed } from "@/lib/admin/lead-intake";
import {
  buildVisionSystemPrompt,
  visionRequestSchema,
  visionResultSchema,
  VISION_TOOL_NAME,
  VISION_TOOL_SCHEMA,
  VISION_USER_PROMPT,
} from "@/lib/admin/vision";
import { computeQuote } from "@/lib/quote-engine";

/**
 * Public photo estimate.
 *
 * The same vision + JunkQ pricing the admin uses, opened to the website so a
 * customer can upload photos and see a sharper range than the fixed buckets.
 * Unauthenticated, so it is fenced: same-origin only, a per-IP rate cap (the
 * AI call costs money), and the image count/size limits the shared schema
 * already enforces. Photos are never stored — they live only for the request.
 *
 * The result is an estimate, not a price: the booking it feeds still lands in
 * the owner's approval queue, and the final price is confirmed on site.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

// Per-IP cap. In-memory, so it resets on a cold start — a backstop against
// casual abuse and runaway cost, not a hard security boundary.
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 12;
const hits = new Map<string, { windowStart: number; count: number }>();

function rateOk(key: string, now: number): boolean {
  const current = hits.get(key);
  if (!current || now - current.windowStart >= RATE_WINDOW_MS) {
    hits.set(key, { windowStart: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= RATE_MAX;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!isOriginAllowed(origin, site.url)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (!rateOk(key, Date.now())) {
    return NextResponse.json(
      { error: "Too many estimates from here. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  const apiKey = anthropicApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Photo estimate isn't available right now." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = visionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Those photos did not validate." }, { status: 400 });
  }

  const [catalog, settings] = await Promise.all([loadCatalog(), loadPricingSettings()]);
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: visionModel(),
      max_tokens: 4096,
      system: buildVisionSystemPrompt(catalog.map((item) => item.name)),
      tools: [
        {
          name: VISION_TOOL_NAME,
          description: "Report the removable items visible in the photos.",
          input_schema: VISION_TOOL_SCHEMA,
        },
      ],
      tool_choice: { type: "tool", name: VISION_TOOL_NAME },
      messages: [
        {
          role: "user",
          content: [
            ...parsed.data.images.map((image) => ({
              type: "image" as const,
              source: {
                type: "base64" as const,
                media_type: image.mediaType,
                data: image.data,
              },
            })),
            { type: "text" as const, text: VISION_USER_PROMPT },
          ],
        },
      ],
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock =>
        block.type === "tool_use" && block.name === VISION_TOOL_NAME,
    );
    if (!toolUse) {
      return NextResponse.json({ error: "Couldn't read those photos." }, { status: 502 });
    }

    const result = visionResultSchema.safeParse(toolUse.input);
    if (!result.success) {
      return NextResponse.json({ error: "Couldn't read those photos." }, { status: 502 });
    }

    // Big/complex jobs are not auto-priced — a human quotes them.
    if (result.data.overall.complexJob) {
      return NextResponse.json({ ok: true, complexJob: true, reason: result.data.overall.reason });
    }

    const items = result.data.items;

    // When the model recognises an item as one in the owner's catalog, price it
    // at the catalog's authoritative size, surcharge and flags rather than the
    // model's own guess. Unmatched items fall back to the model's estimate.
    const catalogByName = new Map(catalog.map((entry) => [entry.name, entry]));
    const lines = items.map((it) => {
      const match = it.matchedCatalogName ? catalogByName.get(it.matchedCatalogName) : undefined;
      return {
        catalogId: match?.id ?? null,
        label: it.label,
        qty: it.qty,
        cubicFeetEach: match ? match.cubicFeet : it.estCubicFeetEach,
        surchargeCents: match ? match.defaultSurchargeCents : null,
        flags: match && match.flags.length > 0 ? match.flags : it.flags,
      };
    });

    const computed = computeQuote(
      {
        items: lines,
        labor: { stairsFlights: 0, carryDistance: "standard", disassembly: 0 },
        heavyMode: false,
        heavy: null,
        discount: null,
      },
      settings,
    );
    const cubicFeet = lines.reduce((sum, line) => sum + line.cubicFeetEach * line.qty, 0);

    return NextResponse.json({
      ok: true,
      complexJob: false,
      lowCents: computed.lowCents,
      highCents: computed.highCents,
      cubicFeet: Math.round(cubicFeet),
      items: items.map((it) => ({ label: it.label, qty: it.qty })),
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Busy right now — please try again shortly." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: "Couldn't estimate from those photos." }, { status: 502 });
    }
    return NextResponse.json({ error: "Couldn't estimate from those photos." }, { status: 502 });
  }
}
