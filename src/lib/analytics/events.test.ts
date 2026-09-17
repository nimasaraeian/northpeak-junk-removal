import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyContactHref,
  contactClickEvent,
  estimateCtaClickEvent,
  generateLeadEvent,
  isEstimateHref,
  toPagePath,
} from "@/lib/analytics/events";
import { formatPhoneHref, telegramHref, whatsAppHref } from "@/lib/utils";

const ORIGIN = "https://northpeakjunk.com";

test("classifyContactHref recognizes the hrefs the site actually builds", () => {
  assert.equal(classifyContactHref(formatPhoneHref("+1 (778) 900-5060")), "phone");
  assert.equal(classifyContactHref(whatsAppHref("+1 (778) 900-5060")), "whatsapp");
  assert.equal(classifyContactHref(telegramHref("+1 (778) 900-5060")), "telegram");
  assert.equal(
    classifyContactHref(whatsAppHref("+1 (778) 900-5060", "Hi NorthPeak")),
    "whatsapp",
  );
});

test("classifyContactHref handles mail, sms, and app schemes", () => {
  assert.equal(classifyContactHref("mailto:info@northpeakjunk.com"), "email");
  assert.equal(classifyContactHref("MAILTO:Info@NorthPeakJunk.com"), "email");
  assert.equal(classifyContactHref("sms:+17789005060"), "phone");
  assert.equal(classifyContactHref("whatsapp://send?phone=17789005060"), "whatsapp");
  assert.equal(classifyContactHref("tg://resolve?domain=northpeak"), "telegram");
});

test("classifyContactHref accepts alternate hosts and www prefixes", () => {
  assert.equal(classifyContactHref("https://api.whatsapp.com/send?phone=1"), "whatsapp");
  assert.equal(classifyContactHref("https://www.wa.me/17789005060"), "whatsapp");
  assert.equal(classifyContactHref("https://telegram.me/northpeak"), "telegram");
});

test("classifyContactHref ignores everything that is not a contact channel", () => {
  assert.equal(classifyContactHref("/estimate"), null);
  assert.equal(classifyContactHref("https://northpeakjunk.com/services"), null);
  assert.equal(classifyContactHref("https://instagram.com/northpeak"), null);
  assert.equal(classifyContactHref("#top"), null);
  assert.equal(classifyContactHref(""), null);
  assert.equal(classifyContactHref(null), null);
  assert.equal(classifyContactHref(undefined), null);
});

test("classifyContactHref does not treat a lookalike host as WhatsApp", () => {
  assert.equal(classifyContactHref("https://wa.me.evil.example/17789005060"), null);
  assert.equal(classifyContactHref("https://nott.me/northpeak"), null);
});

test("isEstimateHref matches our own estimate routes only", () => {
  assert.equal(isEstimateHref("/estimate", ORIGIN), true);
  assert.equal(isEstimateHref("/estimate?service=garage", ORIGIN), true);
  assert.equal(isEstimateHref("/estimate/step-2", ORIGIN), true);
  assert.equal(isEstimateHref("https://northpeakjunk.com/estimate", ORIGIN), true);

  assert.equal(isEstimateHref("/services", ORIGIN), false);
  assert.equal(isEstimateHref("/estimates-are-free", ORIGIN), false);
  assert.equal(isEstimateHref("https://competitor.example/estimate", ORIGIN), false);
  assert.equal(isEstimateHref("tel:+17789005060", ORIGIN), false);
  assert.equal(isEstimateHref("", ORIGIN), false);
  assert.equal(isEstimateHref(null, ORIGIN), false);
});

test("toPagePath drops query strings and hashes", () => {
  // The estimate flow accepts ?postal=, which is close enough to a home
  // address that it must never reach an analytics payload.
  assert.equal(toPagePath("/estimate?postal=V7M1M4"), "/estimate");
  assert.equal(toPagePath("/contact#form"), "/contact");
  assert.equal(toPagePath("/estimate?postal=V7M1M4#contact"), "/estimate");
  assert.equal(toPagePath("/"), "/");
  assert.equal(toPagePath(""), "/");
});

test("contact click events carry only the channel, the spot, and the path", () => {
  const event = contactClickEvent("whatsapp", "header", "/estimate?postal=V7M1M4");
  assert.equal(event.name, "contact_click");
  assert.deepEqual(event.params, {
    contact_method: "whatsapp",
    link_location: "header",
    page_path: "/estimate",
  });
});

test("estimate CTA events carry no query parameters", () => {
  const event = estimateCtaClickEvent("footer", "/services/garage-cleanout?ref=x");
  assert.equal(event.name, "estimate_cta_click");
  assert.deepEqual(event.params, {
    link_location: "footer",
    page_path: "/services/garage-cleanout",
  });
});

test("generate_lead names the form and nothing about the person", () => {
  const event = generateLeadEvent("estimate", "/estimate?postal=V7M1M4");
  assert.equal(event.name, "generate_lead");
  assert.deepEqual(event.params, { form: "estimate", page_path: "/estimate" });
});

test("no event payload leaks a name, email, phone, or postal code", () => {
  const payloads = [
    contactClickEvent("phone", "header", "/contact?email=someone@example.com"),
    contactClickEvent("email", "footer", "/"),
    estimateCtaClickEvent("body", "/estimate?postal=V7M1M4&name=Jane"),
    generateLeadEvent("contact", "/contact?phone=7789005060"),
  ];

  for (const payload of payloads) {
    const serialized = JSON.stringify(payload).toLowerCase();
    assert.equal(serialized.includes("@"), false, `${payload.name} leaked an email`);
    assert.equal(serialized.includes("jane"), false, `${payload.name} leaked a name`);
    assert.equal(serialized.includes("v7m"), false, `${payload.name} leaked a postal code`);
    assert.equal(serialized.includes("7789005060"), false, `${payload.name} leaked a phone`);
  }
});
