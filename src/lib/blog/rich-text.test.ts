import assert from "node:assert/strict";
import test from "node:test";
import {
  extractLinks,
  isInternalHref,
  parseInline,
  toPlainText,
} from "@/lib/blog/rich-text";

test("parseInline returns a single text token for plain prose", () => {
  assert.deepEqual(parseInline("Mattresses are banned from garbage collection."), [
    { type: "text", value: "Mattresses are banned from garbage collection." },
  ]);
});

test("parseInline splits a link out of the surrounding sentence", () => {
  assert.deepEqual(parseInline("We serve [North Vancouver](/locations/north-vancouver) daily."), [
    { type: "text", value: "We serve " },
    { type: "link", value: "North Vancouver", href: "/locations/north-vancouver" },
    { type: "text", value: " daily." },
  ]);
});

test("parseInline handles a bold lead-in at the start of a paragraph", () => {
  assert.deepEqual(parseInline("**Quick answer:** You have three options."), [
    { type: "bold", value: "Quick answer:" },
    { type: "text", value: " You have three options." },
  ]);
});

test("parseInline handles several links in one paragraph", () => {
  const tokens = parseInline(
    "[Furniture removal](/services/furniture-removal) across [North Vancouver](/locations/north-vancouver).",
  );
  assert.deepEqual(tokens.filter((t) => t.type === "link"), [
    { type: "link", value: "Furniture removal", href: "/services/furniture-removal" },
    { type: "link", value: "North Vancouver", href: "/locations/north-vancouver" },
  ]);
});

test("parseInline leaves unmatched markup as literal text", () => {
  // An unclosed bold run must not swallow the rest of the sentence.
  assert.deepEqual(parseInline("A **stray marker stays put."), [
    { type: "text", value: "A **stray marker stays put." },
  ]);
  assert.deepEqual(parseInline("Brackets [like this] are fine."), [
    { type: "text", value: "Brackets [like this] are fine." },
  ]);
});

test("parseInline does not treat prose punctuation as markup", () => {
  const text = "A queen box spring is a rigid 60″ × 80″ frame — it doesn’t fold.";
  assert.deepEqual(parseInline(text), [{ type: "text", value: text }]);
});

test("extractLinks lists hrefs in document order", () => {
  assert.deepEqual(
    extractLinks("See [a](/services/furniture-removal) then [b](/estimate)."),
    ["/services/furniture-removal", "/estimate"],
  );
});

test("isInternalHref distinguishes site paths from external URLs", () => {
  assert.equal(isInternalHref("/estimate"), true);
  assert.equal(isInternalHref("https://metrovancouver.org"), false);
});

test("toPlainText strips markup but keeps the words", () => {
  assert.equal(
    toPlainText("**Quick answer:** book a [pickup](/estimate) today."),
    "Quick answer: book a pickup today.",
  );
});
