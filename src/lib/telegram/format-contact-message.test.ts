import assert from "node:assert/strict";
import test from "node:test";
import {
  formatContactTelegramMessage,
  type ContactNotificationContext,
} from "@/lib/telegram/format-contact-message";

const baseContext: ContactNotificationContext = {
  draft: {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+1 604 555 0100",
    message: "Do you handle commercial cleanouts downtown?",
  },
  requestId: "NP-ABC123",
  submittedAt: new Date("2026-09-12T18:00:00.000Z"),
  photoCount: 2,
};

test("formatContactTelegramMessage includes contact fields and escapes HTML", () => {
  const message = formatContactTelegramMessage({
    ...baseContext,
    draft: {
      ...baseContext.draft,
      name: "Jane <script>alert(1)</script>",
    },
  });

  assert.match(message, /NEW NORTHPEAK CONTACT MESSAGE/);
  assert.match(message, /NP-ABC123/);
  assert.match(message, /Jane &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(message, /2 attached/);
});

test("formatContactTelegramMessage omits phone section when empty", () => {
  const message = formatContactTelegramMessage({
    ...baseContext,
    draft: { ...baseContext.draft, phone: "" },
    photoCount: 0,
  });

  assert.doesNotMatch(message, /📞 <b>Phone<\/b>/);
  assert.match(message, /None attached/);
});
