import assert from "node:assert/strict";
import test from "node:test";
import { submitEstimateCore } from "@/lib/estimate/submit-core";
import { MAX_PHOTO_BYTES } from "@/lib/estimate/photos";
import type { TelegramFetch } from "@/lib/telegram/client";

const ORIGINAL_ENV = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_ADMIN_CHAT_ID: process.env.TELEGRAM_ADMIN_CHAT_ID,
};

function restoreEnv() {
  process.env.TELEGRAM_BOT_TOKEN = ORIGINAL_ENV.TELEGRAM_BOT_TOKEN;
  process.env.TELEGRAM_ADMIN_CHAT_ID = ORIGINAL_ENV.TELEGRAM_ADMIN_CHAT_ID;
}

function makeFile(name: string, type: string, size: number) {
  return new File([new Uint8Array(size)], name, { type });
}

function baseFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values: Record<string, string> = {
    postalCode: "V7L 2A1",
    serviceSlug: "garage-cleanout",
    volume: "1/4 – 1/2 load",
    accessNotes: "Back lane access",
    description: "Old sofa, shelving, boxes and two chairs.",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 604 555 1234",
    preferredContact: "text",
    loadManifest: "[]",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

function createTelegramFetch(
  handlers: Partial<{
    sendMessage: () => TelegramApiLike;
    sendPhoto: () => TelegramApiLike;
    sendMediaGroup: () => TelegramApiLike;
  }> = {},
): { fetchImpl: TelegramFetch; calls: string[] } {
  const calls: string[] = [];

  const fetchImpl: TelegramFetch = async (input) => {
    const url = String(input);
    const method = url.split("/").pop() ?? "unknown";
    calls.push(method);

    const handler =
      method === "sendMessage"
        ? handlers.sendMessage
        : method === "sendPhoto"
          ? handlers.sendPhoto
          : method === "sendMediaGroup"
            ? handlers.sendMediaGroup
            : undefined;

    const payload = handler?.() ?? { ok: true, result: {} };
    return new Response(JSON.stringify(payload), {
      status: payload.ok ? 200 : 400,
      headers: { "Content-Type": "application/json" },
    });
  };

  return { fetchImpl, calls };
}

type TelegramApiLike = { ok: boolean; description?: string; result?: unknown };

test.beforeEach(() => {
  process.env.TELEGRAM_BOT_TOKEN = "test-token";
  process.env.TELEGRAM_ADMIN_CHAT_ID = "123456789";
});

test.afterEach(() => {
  restoreEnv();
});

test("submitEstimateCore delivers valid lead with no photos", async () => {
  const { fetchImpl, calls } = createTelegramFetch();
  const result = await submitEstimateCore(baseFormData(), {
    fetchImpl,
    createRequestId: () => "NP-TEST01",
    now: () => new Date("2026-09-12T21:14:00.000Z"),
  });

  assert.equal(result.ok, true);
  assert.equal(result.requestId, "NP-TEST01");
  assert.equal(result.photosDelivered, true);
  assert.deepEqual(calls, ["sendMessage"]);
});

test("submitEstimateCore delivers one photo via sendPhoto", async () => {
  const { fetchImpl, calls } = createTelegramFetch();
  const formData = baseFormData();
  formData.append("photos", makeFile("one.jpg", "image/jpeg", 1024));

  const result = await submitEstimateCore(formData, {
    fetchImpl,
    createRequestId: () => "NP-PHOTO1",
  });

  assert.equal(result.ok, true);
  assert.equal(result.photosDelivered, true);
  assert.deepEqual(calls, ["sendMessage", "sendPhoto"]);
});

test("submitEstimateCore delivers multiple photos via sendMediaGroup", async () => {
  const { fetchImpl, calls } = createTelegramFetch();
  const formData = baseFormData();
  formData.append("photos", makeFile("one.jpg", "image/jpeg", 1024));
  formData.append("photos", makeFile("two.png", "image/png", 1024));

  const result = await submitEstimateCore(formData, { fetchImpl });

  assert.equal(result.ok, true);
  assert.equal(result.photosDelivered, true);
  assert.deepEqual(calls, ["sendMessage", "sendMediaGroup"]);
});

test("submitEstimateCore accepts 8 photos", async () => {
  const { fetchImpl } = createTelegramFetch();
  const formData = baseFormData();
  for (let index = 0; index < 8; index += 1) {
    formData.append("photos", makeFile(`photo-${index}.jpg`, "image/jpeg", 512));
  }

  const result = await submitEstimateCore(formData, { fetchImpl });
  assert.equal(result.ok, true);
});

test("submitEstimateCore rejects more than 8 photos", async () => {
  const formData = baseFormData();
  for (let index = 0; index < 9; index += 1) {
    formData.append("photos", makeFile(`photo-${index}.jpg`, "image/jpeg", 512));
  }

  const result = await submitEstimateCore(formData);
  assert.equal(result.ok, false);
});

test("submitEstimateCore rejects oversized photo", async () => {
  const formData = baseFormData();
  formData.append("photos", makeFile("large.jpg", "image/jpeg", MAX_PHOTO_BYTES + 1));

  const result = await submitEstimateCore(formData);
  assert.equal(result.ok, false);
});

test("submitEstimateCore rejects unsupported MIME type", async () => {
  const formData = baseFormData();
  formData.append("photos", makeFile("bad.svg", "image/svg+xml", 512));

  const result = await submitEstimateCore(formData);
  assert.equal(result.ok, false);
});

test("submitEstimateCore rejects invalid postal code", async () => {
  const result = await submitEstimateCore(baseFormData({ postalCode: "INVALID" }));
  assert.equal(result.ok, false);
});

test("submitEstimateCore rejects invalid phone", async () => {
  const result = await submitEstimateCore(baseFormData({ phone: "123" }));
  assert.equal(result.ok, false);
});

test("submitEstimateCore rejects invalid email", async () => {
  const result = await submitEstimateCore(baseFormData({ email: "not-an-email" }));
  assert.equal(result.ok, false);
});

test("submitEstimateCore fails when Telegram lead message fails", async () => {
  const { fetchImpl } = createTelegramFetch({
    sendMessage: () => ({ ok: false, description: "blocked" }),
  });

  const result = await submitEstimateCore(baseFormData(), { fetchImpl });
  assert.equal(result.ok, false);
  assert.match(result.message, /couldn't send your request/i);
});

test("submitEstimateCore succeeds with photo warning when photos fail after lead success", async () => {
  const { fetchImpl } = createTelegramFetch({
    sendPhoto: () => ({ ok: false, description: "photo failed" }),
  });
  const formData = baseFormData();
  formData.append("photos", makeFile("one.jpg", "image/jpeg", 1024));

  const result = await submitEstimateCore(formData, { fetchImpl });
  assert.equal(result.ok, true);
  assert.equal(result.photosDelivered, false);
  assert.match(result.message, /Some photos may not have uploaded/i);
});

test("submitEstimateCore escapes HTML in customer fields in Telegram payload", async () => {
  let capturedText = "";
  const fetchImpl: TelegramFetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith("/sendMessage") && init?.body instanceof URLSearchParams) {
      capturedText = init.body.get("text") ?? "";
    }
    return new Response(JSON.stringify({ ok: true, result: {} }), { status: 200 });
  };

  await submitEstimateCore(
    baseFormData({
      name: "Tom & Jerry",
      description: "<script>alert(1)</script>",
    }),
    { fetchImpl },
  );

  assert.match(capturedText, /Tom &amp; Jerry/);
  assert.match(capturedText, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test("submitEstimateCore fails when Telegram env vars are missing", async () => {
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_ADMIN_CHAT_ID;

  const result = await submitEstimateCore(baseFormData());
  assert.equal(result.ok, false);
});
