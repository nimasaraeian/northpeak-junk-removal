import assert from "node:assert/strict";
import test from "node:test";
import { blogPosts, getPost } from "@/content/blog";
import { locations } from "@/content/locations";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { extractLinks, isInternalHref } from "@/lib/blog/rich-text";
import { articleSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import sitemap from "@/app/sitemap";

const SLUG = "how-to-get-rid-of-mattress-vancouver";

// Mirrors the static entries in src/app; dynamic segments are checked against
// their content collections below.
const STATIC_ROUTES = new Set([
  "/",
  "/about",
  "/blog",
  "/contact",
  "/estimate",
  "/how-it-works",
  "/locations",
  "/services",
]);

function everyInternalHref() {
  const hrefs: string[] = [];

  for (const post of blogPosts) {
    for (const block of post.body) {
      if (block.type === "heading" || block.type === "paragraph") {
        hrefs.push(...extractLinks(block.text));
      } else if (block.type === "list") {
        for (const item of block.items) hrefs.push(...extractLinks(item));
      } else if (block.type === "table") {
        for (const row of block.rows) {
          for (const cell of row) hrefs.push(...extractLinks(cell));
        }
      } else if (block.type === "cta") {
        hrefs.push(block.href);
      }
    }
  }

  return hrefs.filter(isInternalHref);
}

test("every internal link in the Journal resolves to a real route", () => {
  // `typedRoutes` cannot check hrefs parsed out of content strings at runtime,
  // so this test stands in for that compile-time guarantee.
  const hrefs = everyInternalHref();
  assert.ok(hrefs.length > 0, "expected the Journal to contain internal links");

  for (const href of hrefs) {
    if (STATIC_ROUTES.has(href)) continue;

    const service = href.match(/^\/services\/(.+)$/);
    if (service) {
      assert.ok(
        services.some((item) => item.slug === service[1]),
        `unknown service link: ${href}`,
      );
      continue;
    }

    const location = href.match(/^\/locations\/(.+)$/);
    if (location) {
      assert.ok(
        locations.some((item) => item.slug === location[1]),
        `unknown location link: ${href}`,
      );
      continue;
    }

    const post = href.match(/^\/blog\/(.+)$/);
    if (post) {
      assert.ok(getPost(post[1]), `unknown post link: ${href}`);
      continue;
    }

    assert.fail(`link does not match any known route: ${href}`);
  }
});

test("blog slugs are unique", () => {
  const slugs = blogPosts.map((post) => post.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("the mattress post carries the required metadata", () => {
  const post = getPost(SLUG);
  assert.ok(post, "mattress post is missing");
  assert.equal(post.seoTitle, "How to Get Rid of a Mattress in Vancouver (2026 Guide)");
  assert.equal(
    post.seoDescription,
    "Every legal way to dispose of a mattress in Vancouver & the North Shore: free city options, recycling depots, and pickup — with real costs and rules.",
  );
  assert.deepEqual(post.relatedServiceSlugs, ["furniture-removal"]);
  assert.deepEqual(post.relatedLocationSlugs, ["north-vancouver"]);
  assert.ok(
    blogPosts.some((other) => other.category === post.category && other.slug !== post.slug),
    "category should reuse an existing convention",
  );
});

test("the quick answer is the first body content after the h1", () => {
  const post = getPost(SLUG)!;
  const [first] = post.body;
  assert.equal(first.type, "paragraph");
  assert.ok(
    first.type === "paragraph" && first.text.startsWith("**Quick answer:**"),
    "first block must be the quick answer paragraph",
  );
});

test("the post links to the service, location, and estimate routes", () => {
  const post = getPost(SLUG)!;
  const hrefs = new Set(
    post.body.flatMap((block) => {
      if (block.type === "paragraph" || block.type === "heading") return extractLinks(block.text);
      if (block.type === "list") return block.items.flatMap(extractLinks);
      if (block.type === "cta") return [block.href];
      return [];
    }),
  );

  assert.ok(hrefs.has("/services/furniture-removal"));
  assert.ok(hrefs.has("/locations/north-vancouver"));
  assert.ok(hrefs.has("/estimate"));
});

test("fee figures stay approximate", () => {
  const post = getPost(SLUG)!;
  const prose = JSON.stringify(post);
  assert.ok(prose.includes("roughly $15–30"), "self-haul range must stay approximate");
  assert.ok(prose.includes("around $25 per piece"), "recycler fee must stay approximate");
  assert.ok(prose.includes("~8 years"), "mattress age guidance must stay approximate");
});

test("the post carries exactly the six FAQ pairs", () => {
  const post = getPost(SLUG)!;
  assert.equal(post.faqs?.length, 6);
  for (const faq of post.faqs!) {
    assert.ok(faq.question.endsWith("?"), `not a question: ${faq.question}`);
    assert.ok(faq.answer.length > 40, `answer too short: ${faq.question}`);
  }
});

test("Article JSON-LD carries headline, datePublished, and an Organization author", () => {
  const post = getPost(SLUG)!;
  const schema = articleSchema(post);

  assert.equal(schema["@type"], "Article");
  assert.equal(schema.headline, post.title);
  assert.equal(schema.datePublished, post.date);
  assert.equal(schema.author["@type"], "Organization");
  assert.equal(schema.author.name, site.name);

  // Review and rating markup was explicitly excluded.
  const serialized = JSON.stringify(schema);
  assert.equal(serialized.includes("AggregateRating"), false);
  assert.equal(serialized.includes("Review"), false);
});

test("FAQ JSON-LD mirrors the six pairs", () => {
  const post = getPost(SLUG)!;
  const schema = faqSchema(post.faqs!);

  assert.equal(schema["@type"], "FAQPage");
  assert.equal(schema.mainEntity.length, 6);
  assert.equal(schema.mainEntity[0].name, post.faqs![0].question);
  assert.equal(schema.mainEntity[0].acceptedAnswer.text, post.faqs![0].answer);
});

test("the post canonical matches the required URL", () => {
  const post = getPost(SLUG)!;
  const metadata = pageMetadata({
    title: post.seoTitle,
    description: post.seoDescription,
    path: `/blog/${post.slug}`,
  });

  assert.equal(
    metadata.alternates?.canonical,
    `${site.url}/blog/${SLUG}`,
  );
});

test("the post appears in the sitemap", () => {
  const urls = sitemap().map((entry) => entry.url);
  assert.ok(urls.includes(`${site.url}/blog/${SLUG}`));
});
