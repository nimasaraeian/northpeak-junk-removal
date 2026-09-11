import assert from "node:assert/strict";
import test from "node:test";
import {
  extractPostalCodes,
  sanitizeMessageContent,
  validateAssistantMessages,
} from "@/lib/assistant/conversation";
import { resolveAssistantActions } from "@/lib/assistant/navigation";
import { assistantResponseSchema } from "@/lib/assistant/response-schema";
import { runCheckServiceAreaTool } from "@/lib/assistant/service-area-tool";
import { buildSiteContext } from "@/lib/assistant/site-context";
import { buildSystemPrompt } from "@/lib/assistant/system-prompt";
import {
  FALLBACK_ASSISTANT_RESPONSE,
  getOpenAiClient,
} from "@/lib/assistant/openai";

test("buildSiteContext includes services, pricing, and FAQs", () => {
  const context = buildSiteContext();
  assert.match(context, /Garage Cleanout/);
  assert.match(context, /estimate range/i);
  assert.match(context, /Hazardous materials/);
});

test("buildSystemPrompt includes PEAK behavior and site context", () => {
  const prompt = buildSystemPrompt();
  assert.match(prompt, /PEAK/);
  assert.match(prompt, /Never invent prices/);
  assert.match(prompt, /Services catalog/);
});

test("resolveAssistantActions rejects arbitrary href keys", () => {
  const actions = resolveAssistantActions([
    "estimate",
    "evilExternal",
    "contact",
    "javascript:alert(1)" as never,
  ]);
  assert.deepEqual(
    actions.map((action) => action.key),
    ["estimate", "contact"],
  );
  assert.equal(actions[0]?.href, "/estimate");
});

test("validateAssistantMessages rejects oversized user messages", () => {
  const result = validateAssistantMessages([
    { role: "user", content: "a".repeat(2001) },
  ]);
  assert.equal(result.ok, false);
});

test("validateAssistantMessages requires trailing user message", () => {
  const result = validateAssistantMessages([
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi" },
  ]);
  assert.equal(result.ok, false);
});

test("extractPostalCodes finds Canadian postal codes", () => {
  const codes = extractPostalCodes("Do you serve V7L 2A1?");
  assert.deepEqual(codes, ["V7L 2A1"]);
});

test("runCheckServiceAreaTool uses real NorthPeak postal logic", () => {
  const payload = JSON.parse(runCheckServiceAreaTool("V7L 2A1")) as {
    ok: boolean;
    tier?: string;
  };
  assert.equal(payload.ok, true);
  assert.equal(payload.tier, "core");
});

test("assistantResponseSchema rejects invalid action keys", () => {
  const parsed = assistantResponseSchema.safeParse({
    message: "Hello",
    actions: ["estimate", "notAllowed"],
  });
  assert.equal(parsed.success, false);
});

test("sanitizeMessageContent strips null bytes", () => {
  assert.equal(sanitizeMessageContent(" hello\u0000 "), "hello");
});

test("getOpenAiClient returns null without API key", () => {
  const original = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  assert.equal(getOpenAiClient(), null);
  process.env.OPENAI_API_KEY = original;
});

test("fallback assistant response offers estimate and contact", () => {
  assert.deepEqual(FALLBACK_ASSISTANT_RESPONSE.actions, ["estimate", "contact"]);
});
