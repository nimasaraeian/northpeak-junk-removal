import assert from "node:assert/strict";
import test from "node:test";
import { submitContactLead } from "@/lib/contact/submit-core";
import { submitEstimateCore } from "@/lib/estimate/submit-core";
import {
  buildLeadWebhookPayload,
  dispatchLeadWebhook,
  type LeadWebhookOptions,
  type LeadWebhookPayload,
} from "@/lib/leads/webhook";
import type { TelegramFetch } from "@/lib/telegram/client";

const ORIGINAL_ENV = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_ADMIN_CHAT_ID: process.env.TELEGRAM_ADMIN_CHAT_ID,
  LEAD_WEBHOOK_URL: process.env.LEAD_WEBHOOK_URL,
};

const WEBHOOK_URL = "https://script.google.com/macros/s/test/exec";

/** Telegram always succeeds here; these tests are about what happens after. */
function telegramOk(): TelegramFetch {
  return async () =>
    new Response(JSON.stringify({ ok: true, result: {} }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
}

interface WebhookCall {
  url: string;
  init: RequestInit;
}

/**
 * Captures webhook POSTs and the scheduled work, so a test can await delivery
 * that production deliberately never awaits.
 */
function createWebhookSpy(
  respond: () => Promise<Response> = async () => new Response("ok", { status: 200 }),
) {
  const calls: WebhookCall[] = [];
  const scheduled: Promise<void>[] = [];

  const options: LeadWebhookOptions = {
    fetchImpl: async (input, init) => {
      calls.push({ url: String(input), init: init ?? {} });
      return respond();
    },
    schedule: (work) => {
      scheduled.push(work());
    },
  };

  return {
    options,
    calls,
    /** Production returns before this settles; tests need it settled. */
    settle: () => Promise.all(scheduled),
    body(index = 0): LeadWebhookPayload {
      return JSON.parse(String(calls[index].init.body)) as LeadWebhookPayload;
    },
  };
}

function estimateFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values: Record<string, string> = {
    postalCode: "V7L 2A1",
    serviceSlug: "garage-cleanout",
    volume: "1/4 – 1/2 load",
    accessNotes: "Back lane access, steep driveway",
    description: "Old sofa, shelving, boxes and two chairs.",
    name: "  John Smith  ",
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

test.beforeEach(() => {
  process.env.TELEGRAM_BOT_TOKEN = "test-token";
  process.env.TELEGRAM_ADMIN_CHAT_ID = "test-chat";
  process.env.LEAD_WEBHOOK_URL = WEBHOOK_URL;
});

test.afterEach(() => {
  process.env.TELEGRAM_BOT_TOKEN = ORIGINAL_ENV.TELEGRAM_BOT_TOKEN;
  process.env.TELEGRAM_ADMIN_CHAT_ID = ORIGINAL_ENV.TELEGRAM_ADMIN_CHAT_ID;
  if (ORIGINAL_ENV.LEAD_WEBHOOK_URL === undefined) {
    delete process.env.LEAD_WEBHOOK_URL;
  } else {
    process.env.LEAD_WEBHOOK_URL = ORIGINAL_ENV.LEAD_WEBHOOK_URL;
  }
});

test("the payload builder emits the agreed wire format", () => {
  const payload = buildLeadWebhookPayload({
    name: " Dana Reyes ",
    phone: " 604-555-0000 ",
    email: " dana@example.com ",
    service: "Garage Cleanout",
    city: "North Vancouver",
    loadSize: "Half load",
    source: "estimate",
    submittedAt: new Date("2026-09-19T17:04:05.000Z"),
  });

  assert.deepEqual(payload, {
    name: "Dana Reyes",
    phone: "604-555-0000",
    email: "dana@example.com",
    service: "Garage Cleanout",
    city: "North Vancouver",
    load_size: "Half load",
    source: "estimate",
    submitted_at: "2026-09-19T17:04:05.000Z",
  });
});

test("absent optional fields serialize as empty strings, not undefined", () => {
  const payload = buildLeadWebhookPayload({
    name: "Dana",
    phone: "",
    email: "dana@example.com",
    source: "contact",
    submittedAt: new Date("2026-09-19T17:04:05.000Z"),
  });

  // JSON.stringify would drop undefined keys and shift the sheet's columns.
  assert.deepEqual(Object.keys(JSON.parse(JSON.stringify(payload))).sort(), [
    "city",
    "email",
    "load_size",
    "name",
    "phone",
    "service",
    "source",
    "submitted_at",
  ]);
  assert.equal(payload.service, "");
  assert.equal(payload.city, "");
  assert.equal(payload.load_size, "");
});

test("a successful estimate posts the lead once, with the service name and city", async () => {
  const webhook = createWebhookSpy();

  const result = await submitEstimateCore(estimateFormData(), {
    fetchImpl: telegramOk(),
    now: () => new Date("2026-09-19T17:04:05.000Z"),
    leadWebhook: webhook.options,
  });
  await webhook.settle();

  assert.equal(result.ok, true);
  assert.equal(webhook.calls.length, 1);
  assert.equal(webhook.calls[0].url, WEBHOOK_URL);
  assert.equal(webhook.calls[0].init.method, "POST");
  assert.equal(webhook.calls[0].init.redirect, "follow");

  assert.deepEqual(webhook.body(), {
    name: "John Smith",
    phone: "+1 604 555 1234",
    email: "john@example.com",
    service: "Garage Cleanout",
    city: "North Vancouver",
    load_size: "1/4 – 1/2 load",
    source: "estimate",
    submitted_at: "2026-09-19T17:04:05.000Z",
  });
});

test("the estimate payload carries no photos and no free text", async () => {
  const webhook = createWebhookSpy();
  const formData = estimateFormData();
  formData.append(
    "photos",
    new File([new Uint8Array(64)], "garage.jpg", { type: "image/jpeg" }),
  );

  await submitEstimateCore(formData, {
    fetchImpl: telegramOk(),
    leadWebhook: webhook.options,
  });
  await webhook.settle();

  const raw = String(webhook.calls[0].init.body);
  assert.equal(raw.includes("garage.jpg"), false);
  assert.equal(raw.includes("Old sofa"), false, "description must not be sent");
  assert.equal(raw.includes("Back lane"), false, "access notes must not be sent");
  assert.equal(raw.includes("V7L"), false, "postal code must not be sent");
});

test("a successful contact submission posts with empty service, city and load size", async () => {
  const webhook = createWebhookSpy();

  const result = await submitContactLead(
    {
      name: "Dana Reyes",
      email: "dana@example.com",
      phone: "604-555-0000",
      message: "Need a sofa and two chairs gone this week.",
    },
    {
      fetchImpl: telegramOk(),
      now: () => new Date("2026-09-19T17:04:05.000Z"),
      leadWebhook: webhook.options,
    },
  );
  await webhook.settle();

  assert.equal(result.ok, true);
  assert.equal(webhook.calls.length, 1);
  assert.deepEqual(webhook.body(), {
    name: "Dana Reyes",
    phone: "604-555-0000",
    email: "dana@example.com",
    service: "",
    city: "",
    load_size: "",
    source: "contact",
    submitted_at: "2026-09-19T17:04:05.000Z",
  });
  assert.equal(String(webhook.calls[0].init.body).includes("sofa"), false);
});

test("no webhook fires when LEAD_WEBHOOK_URL is unset", async () => {
  delete process.env.LEAD_WEBHOOK_URL;
  const webhook = createWebhookSpy();

  const estimate = await submitEstimateCore(estimateFormData(), {
    fetchImpl: telegramOk(),
    leadWebhook: { fetchImpl: webhook.options.fetchImpl, schedule: webhook.options.schedule },
  });
  const contact = await submitContactLead(
    {
      name: "Dana Reyes",
      email: "dana@example.com",
      phone: "604-555-0000",
      message: "Need a sofa and two chairs gone this week.",
    },
    {
      fetchImpl: telegramOk(),
      leadWebhook: { fetchImpl: webhook.options.fetchImpl, schedule: webhook.options.schedule },
    },
  );
  await webhook.settle();

  assert.equal(estimate.ok, true);
  assert.equal(contact.ok, true);
  assert.equal(webhook.calls.length, 0);
});

test("an empty or whitespace LEAD_WEBHOOK_URL is treated as unset", async () => {
  process.env.LEAD_WEBHOOK_URL = "   ";
  const webhook = createWebhookSpy();

  const result = await submitEstimateCore(estimateFormData(), {
    fetchImpl: telegramOk(),
    leadWebhook: { fetchImpl: webhook.options.fetchImpl, schedule: webhook.options.schedule },
  });
  await webhook.settle();

  assert.equal(result.ok, true);
  assert.equal(webhook.calls.length, 0);
});

test("no webhook fires when the submission itself is rejected", async () => {
  const webhook = createWebhookSpy();

  const result = await submitEstimateCore(estimateFormData({ email: "not-an-email" }), {
    fetchImpl: telegramOk(),
    leadWebhook: webhook.options,
  });
  await webhook.settle();

  assert.equal(result.ok, false);
  assert.equal(webhook.calls.length, 0);
});

test("no webhook fires when Telegram delivery fails", async () => {
  const webhook = createWebhookSpy();
  const telegramFails: TelegramFetch = async () =>
    new Response(JSON.stringify({ ok: false, description: "chat not found" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });

  const result = await submitEstimateCore(estimateFormData(), {
    fetchImpl: telegramFails,
    leadWebhook: webhook.options,
  });
  await webhook.settle();

  assert.equal(result.ok, false);
  assert.equal(webhook.calls.length, 0, "a lead the customer must resubmit is not filed");
});

test("a rejecting webhook does not change the submission result", async () => {
  const webhook = createWebhookSpy(async () => new Response("boom", { status: 500 }));

  const result = await submitEstimateCore(estimateFormData(), {
    fetchImpl: telegramOk(),
    leadWebhook: webhook.options,
  });
  await webhook.settle();

  assert.equal(result.ok, true);
  assert.match(result.message, /received your estimate request/);
});

test("a throwing webhook does not reject the scheduled work or the submission", async () => {
  const webhook = createWebhookSpy(async () => {
    throw new Error("ECONNREFUSED");
  });

  const result = await submitContactLead(
    {
      name: "Dana Reyes",
      email: "dana@example.com",
      phone: "604-555-0000",
      message: "Need a sofa and two chairs gone this week.",
    },
    { fetchImpl: telegramOk(), leadWebhook: webhook.options },
  );

  // Would reject if postLead let the error escape — which would surface as an
  // unhandled rejection and could take the serverless invocation down.
  await webhook.settle();

  assert.equal(result.ok, true);
  assert.equal(result.message, "Message received. We will reply within one business day.");
});

test("a webhook that never answers is abandoned, not awaited", async () => {
  let aborted = false;
  let pending: Promise<void> = Promise.resolve();

  const options: LeadWebhookOptions = {
    timeoutMs: 20,
    fetchImpl: (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          aborted = true;
          reject(new DOMException("aborted", "AbortError"));
        });
      }),
    schedule: (work) => {
      pending = work();
    },
  };

  dispatchLeadWebhook(
    {
      name: "Dana Reyes",
      phone: "604-555-0000",
      email: "dana@example.com",
      source: "contact",
      submittedAt: new Date(),
    },
    { ...options, url: WEBHOOK_URL },
  );

  await pending;
  assert.equal(aborted, true, "the timeout must abort a hung request");
});
