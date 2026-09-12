import { NextResponse } from "next/server";
import { validateAssistantMessages } from "@/lib/assistant/conversation";
import {
  FALLBACK_ASSISTANT_RESPONSE,
  generateAssistantReply,
  getOpenAiClient,
} from "@/lib/assistant/openai";
import { resolveAssistantActions } from "@/lib/assistant/navigation";
import type { AssistantApiRequest, AssistantApiResponse } from "@/lib/assistant/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  let body: AssistantApiRequest;

  try {
    body = (await request.json()) as AssistantApiRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateAssistantMessages(body.messages);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const client = getOpenAiClient();
  if (!client) {
    console.error("[assistant] OPENAI_API_KEY missing");
    return NextResponse.json(formatResponse(FALLBACK_ASSISTANT_RESPONSE));
  }

  try {
    const parsed = await generateAssistantReply(validation.messages, client);
    return NextResponse.json(formatResponse(parsed));
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown error";
    console.error("[assistant] OpenAI request failed:", reason);
    return NextResponse.json(formatResponse(FALLBACK_ASSISTANT_RESPONSE));
  }
}

function formatResponse(parsed: { message: string; actions: string[] }): AssistantApiResponse {
  const actions = resolveAssistantActions(parsed.actions).map((action) => action.key);
  return {
    message: parsed.message,
    actions,
  };
}
