import assert from "node:assert/strict";
import test from "node:test";
import {
  isEligibleTransitionHref,
  isExternalHref,
  isHashOnlyHref,
  shouldBypassTransitionClick,
} from "@/lib/motion/navigation";

test("isExternalHref detects external protocols", () => {
  assert.equal(isExternalHref("https://example.com"), true);
  assert.equal(isExternalHref("mailto:hello@example.com"), true);
  assert.equal(isExternalHref("tel:+16045550100"), true);
  assert.equal(isExternalHref("/services"), false);
});

test("isHashOnlyHref detects in-page anchors", () => {
  assert.equal(isHashOnlyHref("#quick-access"), true);
  assert.equal(isHashOnlyHref("/contact"), false);
});

test("isEligibleTransitionHref allows internal routes only", () => {
  assert.equal(isEligibleTransitionHref("/services", "/"), true);
  assert.equal(isEligibleTransitionHref("/services", "/services"), false);
  assert.equal(isEligibleTransitionHref("#quick-access", "/"), false);
  assert.equal(isEligibleTransitionHref("mailto:hello@example.com", "/"), false);
  assert.equal(isEligibleTransitionHref("https://example.com", "/"), false);
});

test("shouldBypassTransitionClick respects modifier and non-primary clicks", () => {
  assert.equal(
    shouldBypassTransitionClick({
      defaultPrevented: false,
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    }),
    false,
  );

  assert.equal(
    shouldBypassTransitionClick({
      defaultPrevented: false,
      button: 0,
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    }),
    true,
  );

  assert.equal(
    shouldBypassTransitionClick({
      defaultPrevented: false,
      button: 1,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    }),
    true,
  );
});
