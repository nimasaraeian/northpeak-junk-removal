import assert from "node:assert/strict";
import test from "node:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { site } from "@/content/site";
import { localBusinessSchema, organizationSchema } from "@/lib/schema";

/**
 * Every source file under src/, so a claim cannot hide in an unread corner —
 * except this file, which necessarily spells out the strings it is hunting.
 */
const SELF = join("src", "content", "reviews.test.ts");

function sourceFiles(dir = "src"): string[] {
  return readdirSync(dir)
    .flatMap((entry) => {
      const path = join(dir, entry);
      return statSync(path).isDirectory() ? sourceFiles(path) : [path];
    })
    .filter((path) => path !== SELF);
}

const FABRICATED = [
  "Sarah M.",
  "James T.",
  "Priya K.",
  "They treated the house like it was theirs",
  "no theatre on the driveway",
  "They booked the elevator, protected the lobby",
];

test("no invented review text survives anywhere in the source", () => {
  // The homepage shipped three placeholder testimonials — names, quotes and
  // five-star rows for customers who do not exist. Deleting the component that
  // rendered them is not enough; the strings must be gone, or they come back.
  for (const path of sourceFiles()) {
    const contents = readFileSync(path, "utf8");
    for (const phrase of FABRICATED) {
      assert.equal(
        contents.includes(phrase),
        false,
        `${path} still contains fabricated review text: ${phrase}`,
      );
    }
  }
});

test("the CRM promise is gone", () => {
  for (const path of sourceFiles()) {
    assert.equal(
      readFileSync(path, "utf8").includes("Reviews will later sync from the CRM"),
      false,
      `${path} still promises CRM review sync`,
    );
  }
});

test("the rating and count come from one constant", () => {
  assert.equal(site.google.rating, "5.0");
  assert.equal(typeof site.google.reviewCount, "number");
  assert.ok(site.google.reviewCount >= 1);

  const source = readFileSync("src/components/home/Reviews.tsx", "utf8");
  assert.match(source, /site\.google/, "the section must read the constant, not a literal");
  // Neither number may be typed into the component.
  assert.equal(/>\s*5\.0\s*</.test(source), false, "rating is hardcoded in the markup");
  assert.equal(/\b3 reviews\b/.test(source), false, "count is hardcoded in the markup");
});

test("the Google link opens safely in a new tab", () => {
  assert.equal(site.google.reviewUrl, "https://g.page/r/CQpStjbMaZkzEBM/review");

  const source = readFileSync("src/components/home/Reviews.tsx", "utf8");
  assert.match(source, /externalHref=\{reviewUrl\}/);
  assert.match(source, /externalRel="noopener"/);

  // `Button` opens external links in a new tab and keeps the safe default for
  // every other caller.
  const button = readFileSync("src/components/ui/Button.tsx", "utf8");
  assert.match(button, /target="_blank"/);
  assert.match(button, /rel=\{externalRel \?\? "noopener noreferrer"\}/);
});

test("the rating is never emitted as structured data", () => {
  // A rating published about yourself on your own domain is not counted for a
  // local business and invites a manual action. It stays plain text.
  for (const schema of [organizationSchema(), localBusinessSchema()]) {
    const serialized = JSON.stringify(schema);
    assert.equal(serialized.includes("AggregateRating"), false);
    assert.equal(serialized.includes("ratingValue"), false);
    assert.equal(serialized.includes("reviewCount"), false);
  }
});

test("the testimonial module and its type are gone, not just unused", () => {
  const paths = sourceFiles();
  assert.ok(paths.length > 0, "the source scan found nothing, so it proves nothing");
  assert.equal(
    paths.includes(join("src", "content", "testimonials.ts")),
    false,
    "the fabricated testimonial data is still in the repo",
  );
  for (const path of paths) {
    assert.equal(
      /\bTestimonial\b/.test(readFileSync(path, "utf8")),
      false,
      `${path} still references the removed Testimonial type`,
    );
  }
});
