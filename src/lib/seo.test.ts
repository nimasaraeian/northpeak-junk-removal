import assert from "node:assert/strict";
import test from "node:test";
import { services } from "@/content/services";
import { indexedLocations } from "@/content/locations";
import { site } from "@/content/site";
import { localBusinessSchema, organizationSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

test("every page gets a share image, not just the homepage", () => {
  // `opengraph-image.tsx` only reaches routes that do not declare `openGraph`
  // themselves, which this helper always does — so the default is named here.
  const metadata = pageMetadata({
    title: "Junk Removal Burnaby",
    description: "…",
    path: "/locations/burnaby",
  });

  const og = metadata.openGraph?.images;
  assert.ok(Array.isArray(og) && og.length === 1, "og:image is missing");
  assert.equal((og[0] as { url: string }).url, `${site.url}/opengraph-image`);

  const twitter = metadata.twitter?.images;
  assert.ok(Array.isArray(twitter) && twitter.length === 1, "twitter:image is missing");
});

test("a page with its own art keeps it", () => {
  const image = { url: "/brand/hero-desktop.jpg", width: 1200, height: 630, alt: "Hero" };
  const metadata = pageMetadata({ title: "t", description: "d", path: "/p", image });
  const og = metadata.openGraph?.images as Array<{ url: string }>;
  assert.equal(og[0].url, `${site.url}/brand/hero-desktop.jpg`);
});

test("answer-engine crawlers are named rather than left to the wildcard", () => {
  const rules = robots().rules;
  assert.ok(Array.isArray(rules), "expected per-agent rules");

  const agents = rules.map((rule) => rule.userAgent);
  for (const agent of ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
    assert.ok(agents.includes(agent), `${agent} is not addressed`);
  }

  for (const rule of rules) {
    assert.equal(rule.allow, "/", `${rule.userAgent} is not allowed through`);
    assert.deepEqual(rule.disallow, ["/api/"]);
  }
});

test("the sitemap points at the live domain and skips de-emphasized cities", () => {
  const urls = sitemap().map((entry) => entry.url);

  for (const service of services) {
    assert.ok(urls.includes(`${site.url}/services/${service.slug}`), service.slug);
  }
  for (const location of indexedLocations) {
    assert.ok(urls.includes(`${site.url}/locations/${location.slug}`), location.slug);
  }
  assert.equal(urls.includes(`${site.url}/locations/richmond`), false, "richmond is noindex");

  // Nothing retired should still be advertised.
  assert.equal(urls.includes(`${site.url}/blog/garage-cleanout-north-shore-homes`), false);
});

test("opening hours are emitted in the typed form as well as the string", () => {
  const schema = localBusinessSchema();
  assert.equal(schema.openingHoursSpecification["@type"], "OpeningHoursSpecification");
  assert.equal(schema.openingHoursSpecification.opens, "08:00");
  assert.equal(schema.openingHoursSpecification.dayOfWeek.length, 7);
});

test("sameAs is omitted rather than filled with empty profiles", () => {
  const configured = Object.values(site.social).filter(Boolean);
  for (const schema of [organizationSchema(), localBusinessSchema()] as Array<
    Record<string, unknown>
  >) {
    if (configured.length === 0) {
      assert.equal("sameAs" in schema, false, "empty sameAs would be a broken entity link");
    } else {
      assert.deepEqual(schema.sameAs, configured);
    }
  }
});

test("the address on the business schema matches the one we publish everywhere", () => {
  const schema = localBusinessSchema();
  assert.equal(schema.address.streetAddress, "564 West Keith Rd");
  assert.equal(schema.address.addressLocality, "North Vancouver");
  assert.equal(schema.address.addressRegion, "BC");
});
