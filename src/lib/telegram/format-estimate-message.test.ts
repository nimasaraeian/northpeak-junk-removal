import assert from "node:assert/strict";
import test from "node:test";
import { formatEstimateTelegramMessage } from "@/lib/telegram/format-estimate-message";
import type { EstimateDraft } from "@/types";

const draft: EstimateDraft = {
  postalCode: "V7L 2A1",
  serviceSlug: "garage-cleanout",
  volume: "1/4 – 1/2 load",
  accessNotes: "Back lane <stairs>",
  description: 'Old sofa & "shelving"',
  name: "John Smith",
  email: "john@example.com",
  phone: "+1 604 555 1234",
  preferredContact: "text",
};

test("formatEstimateTelegramMessage escapes user-controlled HTML", () => {
  const message = formatEstimateTelegramMessage({
    draft,
    requestId: "NP-A7F29C",
    submittedAt: new Date("2026-09-12T21:14:00.000Z"),
    areaCity: "North Vancouver",
    areaFsa: "V7L",
    areaTier: "core",
    areaTierLabel: "Standard Service Area",
    photoCount: 2,
    loadManifest: [{ id: "medium", name: "Medium load", quantity: 1, cubicFeet: 90 }],
  });

  assert.match(message, /NP-A7F29C/);
  assert.match(message, /Garage Cleanout/);
  assert.match(message, /Old sofa &amp; &quot;shelving&quot;/);
  assert.match(message, /Back lane &lt;stairs&gt;/);
  assert.match(message, /2 attached/);
  assert.match(message, /CORE — Standard Service Area/);
  assert.match(message, /North Vancouver/);
  assert.match(message, /V7L 2A1/);
});

test("formatEstimateTelegramMessage includes extended coverage tier", () => {
  const message = formatEstimateTelegramMessage({
    draft: { ...draft, postalCode: "V3X 1A1" },
    requestId: "NP-EXT001",
    submittedAt: new Date("2026-09-12T21:14:00.000Z"),
    areaCity: "Surrey",
    areaFsa: "V3X",
    areaTier: "extended",
    areaTierLabel: "Extended Service Area",
    photoCount: 0,
    loadManifest: [],
  });

  assert.match(message, /EXTENDED — Extended Service Area/);
  assert.match(message, /Surrey/);
});
