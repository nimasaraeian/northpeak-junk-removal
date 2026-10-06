import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { operatorOrNull } from "@/lib/admin/auth";
import { anthropicApiKey, visionModel } from "@/lib/admin/config";
import {
  buildIntakeSystemPrompt,
  intakeRequestSchema,
  intakeResultSchema,
  INTAKE_TOOL_NAME,
  INTAKE_TOOL_SCHEMA,
} from "@/lib/admin/intake";

/**
 * Intake assist.
 *
 * Reads a customer's inbound message and returns the stated facts plus one
 * drafted clarifying question. Like the photo-assist route, the session is
 * checked before the API client is constructed, so an unauthenticated call
 * can never spend a request.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const operator = await operatorOrNull();
  if (!operator) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const apiKey = anthropicApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Intake assist is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = intakeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "That message did not validate." },
      { status: 400 },
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: visionModel(),
      max_tokens: 2048,
      system: buildIntakeSystemPrompt(),
      tools: [
        {
          name: INTAKE_TOOL_NAME,
          description: "Report the facts stated in the customer's message.",
          input_schema: INTAKE_TOOL_SCHEMA,
        },
      ],
      tool_choice: { type: "tool", name: INTAKE_TOOL_NAME },
      messages: [{ role: "user", content: parsed.data.message }],
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock =>
        block.type === "tool_use" && block.name === INTAKE_TOOL_NAME,
    );

    if (!toolUse) {
      return NextResponse.json({ error: "The model did not return a summary." }, { status: 502 });
    }

    const result = intakeResultSchema.safeParse(toolUse.input);
    if (!result.success) {
      return NextResponse.json(
        { error: "The model's response did not match the expected shape." },
        { status: 502 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Intake assist is rate limited right now. Try again shortly." },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "The Anthropic API key was rejected." }, { status: 502 });
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `Intake assist failed (${error.status}).` }, { status: 502 });
    }
    return NextResponse.json({ error: "Intake assist failed." }, { status: 502 });
  }
}
