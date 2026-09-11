import assert from "node:assert/strict";
import test from "node:test";
import { submitContactCore } from "@/lib/contact/submit-core";
import type { TelegramFetch } from "@/lib/telegram/client";

const ORIGINAL_ENV = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_ADMIN_CHAT_ID: process.env.TELEGRAM_ADMIN_CHAT_ID,
};

function restoreEnv() {
  process.env.TELEGRAM_BOT_TOKEN = ORIGINAL_ENV.TELEGRAM_BOT_TOKEN;
  process.env.TELEGRAM_ADMIN_CHAT_ID = ORIGINAL_ENV.TELEGRAM_ADMIN_CHAT_ID;
}

function baseFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values: Record<string, string> = {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+1 604 555 0100",
    message: "Can you remove office furniture next week?",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

function createTelegramFetch(): { fetchImpl: TelegramFetch; calls: string[] } {
  const calls: string[] = [];

  const fetchImpl: TelegramFetch = async (input) => {
    const url = String(input);
    calls.push(url.split("/").pop() ?? "unknown");
    return new Response(JSON.stringify({ ok: true, result: {} }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  return { fetchImpl, calls };
}

test.beforeEach(() => {
  process.env.TELEGRAM_BOT_TOKEN = "test-token";
  process.env.TELEGRAM_ADMIN_CHAT_ID = "123456";
});

test.afterEach(restoreEnv);

test("submitContactCore delivers valid contact message", async () => {
  const { fetchImpl, calls } = createTelegramFetch();
  const result = await submitContactCore(baseFormData(), {
    fetchImpl,
    createRequestId: () => "NP-TEST01",
  });

  assert.equal(result.ok, true);
  assert.equal(result.requestId, "NP-TEST01");
  assert.deepEqual(calls, ["sendMessage"]);
});

test("submitContactCore rejects invalid email", async () => {
  const result = await submitContactCore(
    baseFormData({ email: "not-an-email" }),
    { createRequestId: () => "NP-TEST02" },
  );

  assert.equal(result.ok, false);
});

test("submitContactCore fails when Telegram env vars are missing", async () => {
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_ADMIN_CHAT_ID;

  const result = await submitContactCore(baseFormData(), {
    createRequestId: () => "NP-TEST03",
  });

  assert.equal(result.ok, false);
});
