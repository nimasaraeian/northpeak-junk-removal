import assert from "node:assert/strict";
import test from "node:test";
import { readTelegramConfig, TelegramClient } from "@/lib/telegram/client";

const ORIGINAL_ENV = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_ADMIN_CHAT_ID: process.env.TELEGRAM_ADMIN_CHAT_ID,
};

test.afterEach(() => {
  process.env.TELEGRAM_BOT_TOKEN = ORIGINAL_ENV.TELEGRAM_BOT_TOKEN;
  process.env.TELEGRAM_ADMIN_CHAT_ID = ORIGINAL_ENV.TELEGRAM_ADMIN_CHAT_ID;
});

test("readTelegramConfig reports missing token and chat id", () => {
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_ADMIN_CHAT_ID;
  assert.equal(readTelegramConfig().ok, false);

  process.env.TELEGRAM_BOT_TOKEN = "token";
  assert.equal(readTelegramConfig().ok, false);

  delete process.env.TELEGRAM_BOT_TOKEN;
  process.env.TELEGRAM_ADMIN_CHAT_ID = "123";
  assert.equal(readTelegramConfig().ok, false);
});

test("TelegramClient treats ok:false responses as failures", async () => {
  const fetchImpl = async () =>
    new Response(JSON.stringify({ ok: false, description: "bad request" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const client = new TelegramClient(
    { token: "secret-token", chatId: "123" },
    fetchImpl,
  );

  const result = await client.sendMessage("hello", "NP-TEST01");
  assert.equal(result.ok, false);
});

test("TelegramClient sendMediaGroup uses attach references", async () => {
  let body: FormData | undefined;
  const fetchImpl = async (_input: RequestInfo | URL, init?: RequestInit) => {
    body = init?.body as FormData;
    return new Response(JSON.stringify({ ok: true, result: [] }), { status: 200 });
  };

  const client = new TelegramClient(
    { token: "secret-token", chatId: "123" },
    fetchImpl,
  );

  const files = [
    new File([new Uint8Array([1])], "one.jpg", { type: "image/jpeg" }),
    new File([new Uint8Array([2])], "two.jpg", { type: "image/jpeg" }),
  ];

  const result = await client.sendMediaGroup(files, "caption", "NP-TEST02");
  assert.equal(result.ok, true);
  assert.ok(body instanceof FormData);
  assert.match(String(body?.get("media")), /attach:\/\/photo0/);
  assert.match(String(body?.get("media")), /attach:\/\/photo1/);
});
