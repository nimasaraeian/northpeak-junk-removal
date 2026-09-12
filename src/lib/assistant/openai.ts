import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { extractPostalCodes, toModelInput } from "@/lib/assistant/conversation";
import {
  assistantResponseSchema,
  type ParsedAssistantResponse,
} from "@/lib/assistant/response-schema";
import {
  runCheckServiceAreaTool,
  serviceAreaToolDefinition,
} from "@/lib/assistant/service-area-tool";
import { buildSystemPrompt } from "@/lib/assistant/system-prompt";
import type { AssistantChatMessage } from "@/lib/assistant/types";

export const OPENAI_TIMEOUT_MS = 25_000;
export const DEFAULT_OPENAI_MODEL = "gpt-5.6-luna";

export function getOpenAiModel() {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

export function getOpenAiClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return new OpenAI({ apiKey, timeout: OPENAI_TIMEOUT_MS, maxRetries: 0 });
}

function buildPostalContext(messages: AssistantChatMessage[]): string {
  const latestUser = [...messages].reverse().find((message) => message.role === "user");
  if (!latestUser) return "";

  const codes = extractPostalCodes(latestUser.content);
  if (codes.length === 0) return "";

  const lookups = codes.map((code) => runCheckServiceAreaTool(code));
  return `\nPRE-COMPUTED SERVICE AREA LOOKUPS:\n${lookups.join("\n")}`;
}

type ResponseOutputItem = OpenAI.Responses.ResponseOutputItem;

function collectFunctionCalls(output: ResponseOutputItem[]) {
  return output.filter(
    (item): item is OpenAI.Responses.ResponseFunctionToolCall =>
      item.type === "function_call" && item.name === "check_service_area",
  );
}

export async function generateAssistantReply(
  messages: AssistantChatMessage[],
  client: OpenAI = getOpenAiClient()!,
): Promise<ParsedAssistantResponse> {
  const instructions = buildSystemPrompt(buildPostalContext(messages));
  let input: OpenAI.Responses.ResponseInput = toModelInput(messages);

  for (let round = 0; round < 2; round += 1) {
    const response = await client.responses.create({
      model: getOpenAiModel(),
      instructions,
      input,
      tools: [serviceAreaToolDefinition],
      parallel_tool_calls: false,
      max_output_tokens: 500,
      tool_choice: round === 0 ? "auto" : "none",
    });

    const functionCalls = collectFunctionCalls(response.output);
    if (functionCalls.length === 0) {
      break;
    }

    const toolOutputs: OpenAI.Responses.ResponseInputItem[] = [];

    for (const call of functionCalls) {
      let postalCode = "";
      try {
        const args = JSON.parse(call.arguments) as { postalCode?: string };
        postalCode = String(args.postalCode ?? "");
      } catch {
        postalCode = "";
      }

      toolOutputs.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: runCheckServiceAreaTool(postalCode),
      });
    }

    input = [
      ...input,
      ...(response.output as OpenAI.Responses.ResponseInputItem[]),
      ...toolOutputs,
    ];
  }

  const parsed = await client.responses.parse({
    model: getOpenAiModel(),
    instructions,
    input,
    max_output_tokens: 700,
    text: {
      format: zodTextFormat(assistantResponseSchema, "assistant_response"),
    },
  });

  if (!parsed.output_parsed) {
    throw new Error("Assistant response could not be parsed");
  }

  return parsed.output_parsed;
}

export const FALLBACK_ASSISTANT_RESPONSE: ParsedAssistantResponse = {
  message:
    "Sorry — I can't answer that right now. You can still request an estimate or contact our team.",
  actions: ["estimate", "contact"],
};
