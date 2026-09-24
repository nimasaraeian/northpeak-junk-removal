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

test("one set of hours, stated the same way everywhere", () => {
  // The site copy said "by appointment", the schema said 08:00–18:00, and the
  // Google Business Profile said open 24 hours. Every one of those is read by
  // something, and disagreeing with yourself is what makes a listing look
  // abandoned. The schema now derives from the copy rather than restating it.
  const schema = localBusinessSchema();

  assert.equal(schema.openingHoursSpecification["@type"], "OpeningHoursSpecification");
  assert.equal(schema.openingHoursSpecification.opens, site.opensAt);
  assert.equal(schema.openingHoursSpecification.closes, site.closesAt);
  assert.equal(schema.openingHoursSpecification.dayOfWeek.length, 7);
  assert.equal(schema.openingHours, `Mo-Su ${site.opensAt}-${site.closesAt}`);

  // The human-readable line has to describe the same window.
  assert.match(site.hours, /8:00\s?AM/);
  assert.match(site.hours, /6:00\s?PM/);

  // Pinned to the literals the Google Business Profile, Yelp and the live
  // schema all state. These are the numbers everything else derives from, so
  // a change here is a change to what four listings claim — assert them
  // outright rather than only against each other.
  assert.equal(site.opensAt, "08:00");
  assert.equal(site.closesAt, "18:00");
  assert.equal(schema.openingHoursSpecification.closes, "18:00");
  assert.equal(schema.openingHours, "Mo-Su 08:00-18:00");
});

test("sameAs lives on Organization alone and carries no empty entry", () => {
  const organization = organizationSchema() as Record<string, unknown>;
  const business = localBusinessSchema() as Record<string, unknown>;

  // One business under two @ids. Organization is the node search resolves to,
  // so the profile links live there and are not repeated on LocalBusiness.
  assert.ok(Array.isArray(organization.sameAs), "Organization should name its profiles");
  assert.equal("sameAs" in business, false, "LocalBusiness should not repeat sameAs");

  for (const url of organization.sameAs as string[]) {
    assert.ok(url.startsWith("https://"), `not a profile URL: ${url}`);
  }

  // The Google listing is deliberately absent. `site.google.listingUrl` is a
  // Maps *search* URL, not a canonical profile URL, and `sameAs` is meant to
  // name the entity's own pages — a query string is the wrong shape for that.
  // Swap in a real place URL (maps/place/… or the g.page short link) and it
  // belongs here; until then it is better omitted than wrong.
  assert.equal(
    (organization.sameAs as string[]).some((url) => url.includes("google.com/maps")),
    false,
    "a Maps search URL is not a canonical sameAs entry",
  );
});

test("sameAs is exactly the configured profiles, or absent", () => {
  // Facebook and LinkedIn default to "" and must be filtered out: an empty
  // entry is a broken entity link, which is worse than having none at all.
  const configured = Object.values(site.social).filter(Boolean);
  const organization = organizationSchema() as Record<string, unknown>;

  if (configured.length === 0) {
    assert.equal("sameAs" in organization, false, "empty sameAs would be a broken entity link");
  } else {
    assert.deepEqual(organization.sameAs, configured);
  }
});

test("the address on the business schema matches the one we publish everywhere", () => {
  const schema = localBusinessSchema();
  assert.equal(schema.address.streetAddress, "564 West Keith Rd");
  assert.equal(schema.address.addressLocality, "North Vancouver");
  assert.equal(schema.address.addressRegion, "BC");
});
