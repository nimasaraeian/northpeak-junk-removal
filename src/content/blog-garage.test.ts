import assert from "node:assert/strict";
import test from "node:test";
import { blogPosts, getPost } from "@/content/blog";
import { site } from "@/content/site";
import { extractLinks } from "@/lib/blog/rich-text";
import { articleSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import sitemap from "@/app/sitemap";

const SLUG = "garage-cleanout-north-vancouver-cost";

function post() {
  const found = getPost(SLUG);
  assert.ok(found, "garage cleanout post is missing");
  return found;
}

test("the garage post carries the required metadata", () => {
  const item = post();
  assert.equal(item.seoTitle, "Garage Cleanout in North Vancouver: Cost & Process (2026)");
  assert.equal(
    item.seoDescription,
    "What a garage cleanout costs in North Vancouver, how the process works, what’s worth donating, and when DIY beats hiring a crew — real 2026 ranges.",
  );
  assert.deepEqual(item.relatedServiceSlugs, ["garage-cleanout"]);
  assert.deepEqual(item.relatedLocationSlugs, ["north-vancouver"]);
  assert.ok(
    blogPosts.some((other) => other.category === item.category && other.slug !== item.slug),
    "category should reuse an existing convention",
  );
});

test("the quick answer is the first body content, as a callout", () => {
  const [first] = post().body;
  assert.equal(first.type, "callout");
  assert.ok(first.type === "callout" && first.label === "Quick answer");
  assert.ok(
    first.type === "callout" && first.text.startsWith("In Metro Vancouver"),
    "quick answer must keep its opening sentence",
  );
});

test("the post ships text only", () => {
  // Text blocks and the CTA button, nothing that renders an image.
  const allowed = new Set(["callout", "heading", "paragraph", "list", "cta"]);
  for (const block of post().body) {
    assert.ok(allowed.has(block.type), `unexpected block type: ${block.type}`);
  }
});

test("the post links to the service, location, and estimate routes", () => {
  const hrefs = new Set(
    post().body.flatMap((block) => {
      if (block.type === "paragraph" || block.type === "heading") return extractLinks(block.text);
      if (block.type === "callout") return extractLinks(block.text);
      if (block.type === "list") return block.items.flatMap(extractLinks);
      if (block.type === "cta") return [block.href];
      return [];
    }),
  );

  assert.ok(hrefs.has("/services/garage-cleanout"));
  assert.ok(hrefs.has("/locations/north-vancouver"));
  assert.ok(hrefs.has("/estimate"));
});

test("price figures stay approximate", () => {
  // These are market ranges, not quotes. A later edit must not turn "roughly
  // $300-500" into a number a customer could hold us to.
  const prose = JSON.stringify(post());
  assert.ok(prose.includes("roughly $100–150"), "minimum-load figure must stay approximate");
  assert.ok(prose.includes("roughly $100–300"));
  assert.ok(prose.includes("roughly $300–500"));
  assert.ok(prose.includes("roughly $600–1,000+"));
  assert.ok(prose.includes("roughly between $300 and $500"), "FAQ range must stay approximate");
});

test("the post carries exactly the six FAQ pairs", () => {
  const item = post();
  assert.equal(item.faqs?.length, 6);
  for (const faq of item.faqs!) {
    assert.ok(faq.question.endsWith("?"), `not a question: ${faq.question}`);
    assert.ok(faq.answer.length > 40, `answer too short: ${faq.question}`);
  }
});

test("Article JSON-LD carries headline, datePublished, and an Organization author", () => {
  const item = post();
  const schema = articleSchema(item);

  assert.equal(schema["@type"], "Article");
  assert.equal(schema.headline, item.title);
  assert.equal(schema.datePublished, item.date);
  assert.equal(schema.author["@type"], "Organization");
  assert.equal(schema.author.name, site.name);

  const serialized = JSON.stringify(schema);
  assert.equal(serialized.includes("AggregateRating"), false);
  assert.equal(serialized.includes("Review"), false);
});

test("FAQ JSON-LD mirrors the six pairs", () => {
  const item = post();
  const schema = faqSchema(item.faqs!);

  assert.equal(schema["@type"], "FAQPage");
  assert.equal(schema.mainEntity.length, 6);
  assert.equal(schema.mainEntity[5].name, item.faqs![5].question);
});

test("the post canonical matches the required URL", () => {
  const item = post();
  const metadata = pageMetadata({
    title: item.seoTitle,
    description: item.seoDescription,
    path: `/blog/${item.slug}`,
  });

  assert.equal(metadata.alternates?.canonical, `${site.url}/blog/${SLUG}`);
});

test("the post appears in the sitemap", () => {
  assert.ok(sitemap().map((entry) => entry.url).includes(`${site.url}/blog/${SLUG}`));
});
