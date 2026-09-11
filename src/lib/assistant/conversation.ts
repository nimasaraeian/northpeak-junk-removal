import type { AssistantChatMessage } from "@/lib/assistant/types";

export const MAX_USER_MESSAGE_LENGTH = 2000;
export const MAX_MESSAGES_PER_REQUEST = 24;
export const MAX_MESSAGES_TO_MODEL = 12;
export const MAX_TOTAL_PAYLOAD_BYTES = 48_000;

const POSTAL_PATTERN =
  /\b[AABCEGHJ-NPRSTVXY]\d[AABCEGHJ-NPRSTV-Z][ -]?\d[AABCEGHJ-NPRSTV-Z]\d\b/i;

export function sanitizeMessageContent(content: string): string {
  return content.replace(/\0/g, "").trim();
}

export function validateAssistantMessages(
  messages: unknown,
): { ok: true; messages: AssistantChatMessage[] } | { ok: false; error: string } {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "Include at least one message." };
  }

  if (messages.length > MAX_MESSAGES_PER_REQUEST) {
    return { ok: false, error: "Conversation is too long. Start a fresh question." };
  }

  const normalized: AssistantChatMessage[] = [];

  for (const entry of messages) {
    if (!entry || typeof entry !== "object") {
      return { ok: false, error: "Invalid message format." };
    }

    const role = (entry as AssistantChatMessage).role;
    const content = sanitizeMessageContent(String((entry as AssistantChatMessage).content ?? ""));

    if (role !== "user" && role !== "assistant") {
      return { ok: false, error: "Invalid message role." };
    }

    if (!content) {
      return { ok: false, error: "Empty messages are not allowed." };
    }

    if (role === "user" && content.length > MAX_USER_MESSAGE_LENGTH) {
      return {
        ok: false,
        error: `Messages must be ${MAX_USER_MESSAGE_LENGTH} characters or fewer.`,
      };
    }

    normalized.push({ role, content });
  }

  const payloadSize = JSON.stringify(normalized).length;
  if (payloadSize > MAX_TOTAL_PAYLOAD_BYTES) {
    return { ok: false, error: "Request is too large. Shorten your message history." };
  }

  if (normalized.at(-1)?.role !== "user") {
    return { ok: false, error: "The latest message must be from the user." };
  }

  return { ok: true, messages: normalized };
}

export function trimConversation(messages: AssistantChatMessage[]): AssistantChatMessage[] {
  return messages.slice(-MAX_MESSAGES_TO_MODEL);
}

export function extractPostalCodes(text: string): string[] {
  const matches = text.match(new RegExp(POSTAL_PATTERN.source, "gi")) ?? [];
  return [...new Set(matches.map((value) => value.toUpperCase()))];
}

export function toModelInput(messages: AssistantChatMessage[]) {
  return trimConversation(messages).map((message) => ({
    role: message.role,
    content: message.content,
  }));
}
