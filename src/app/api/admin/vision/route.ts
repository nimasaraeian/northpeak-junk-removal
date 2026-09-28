import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { operatorOrNull } from "@/lib/admin/auth";
import { anthropicApiKey, visionModel } from "@/lib/admin/config";
import { loadCatalog } from "@/lib/admin/data";
import {
  buildVisionSystemPrompt,
  visionRequestSchema,
  visionResultSchema,
  VISION_TOOL_NAME,
  VISION_TOOL_SCHEMA,
  VISION_USER_PROMPT,
} from "@/lib/admin/vision";

/**
 * Photo assist.
 *
 * Reads up to four base64 images and returns editable item suggestions. The
 * photos are never persisted — no blob storage in v1 — so they exist only for
 * the life of this request.
 *
 * Strict JSON comes from a forced tool call rather than `output_config.format`:
 * structured outputs are not available on Sonnet 4.5, which is the model the
 * brief pins. The tool guarantees a call; Zod guarantees the shape. If either
 * fails the UI simply shows no suggestions and the operator picks from the
 * catalog, which is the standalone path anyway.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  // `proxy.ts` already 401s an unauthenticated call. Checked again here
  // because a matcher edit must not be able to open this quietly.
  const operator = await operatorOrNull();
  if (!operator) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const apiKey = anthropicApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Photo assist is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = visionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Those photos did not validate." },
      { status: 400 },
    );
  }

  const catalog = await loadCatalog();
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
      return NextResponse.json(
        { error: "The model did not return any suggestions." },
        { status: 502 },
      );
    }

    const result = visionResultSchema.safeParse(toolUse.input);
    if (!result.success) {
      return NextResponse.json(
        { error: "The model's response did not match the expected shape." },
        { status: 502 },
      );
    }

    // A complex job is not something to auto-fill; the banner in the UI takes
    // over and the item list is left alone.
    return NextResponse.json({
      items: result.data.overall.complexJob ? [] : result.data.items,
      overall: result.data.overall,
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Photo assist is rate limited right now. Try again shortly." },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "The Anthropic API key was rejected." }, { status: 502 });
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Photo assist failed (${error.status}).` },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: "Photo assist failed." }, { status: 502 });
  }
}
