import assert from "node:assert/strict";
import test from "node:test";
import { blogPosts, getPost } from "@/content/blog";
import { getService } from "@/content/services";
import { site } from "@/content/site";
import { extractLinks } from "@/lib/blog/rich-text";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import sitemap from "@/app/sitemap";

const SLUG = "estate-cleanout-north-vancouver";

function post() {
  const found = getPost(SLUG);
  assert.ok(found, "estate cleanout post is missing");
  return found;
}

function hrefs() {
  return new Set(
    post().body.flatMap((block) => {
      if (block.type === "paragraph" || block.type === "heading") return extractLinks(block.text);
      if (block.type === "callout") return extractLinks(block.text);
      if (block.type === "list") return block.items.flatMap(extractLinks);
      if (block.type === "cta") return [block.href];
      return [];
    }),
  );
}

test("the estate post carries the required metadata", () => {
  const item = post();
  assert.equal(item.seoTitle, "Estate Cleanout in North Vancouver: A Family’s Guide (2026)");
  assert.equal(
    item.seoDescription,
    "What an estate cleanout involves, what it costs in North Vancouver, and a step-by-step checklist for families and executors. Local crew, donation-first.",
  );
  assert.equal(item.category, "Local Guide");
  assert.deepEqual(item.relatedServiceSlugs, ["estate-cleanout"]);
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
    first.type === "callout" && first.text.startsWith("An estate cleanout in North Vancouver"),
    "quick answer must keep its opening sentence",
  );
});

test("the post ships text only", () => {
  // Text blocks and the CTA button, nothing that renders an image or an SVG.
  const allowed = new Set(["callout", "heading", "paragraph", "list", "cta"]);
  for (const block of post().body) {
    assert.ok(allowed.has(block.type), `unexpected block type: ${block.type}`);
  }
  assert.equal(post().heroImage, undefined);
});

test("every H2 is phrased as a question", () => {
  const headings = post().body.filter((block) => block.type === "heading");
  assert.equal(headings.length, 7);
  // The checklist heading is the one statement: it names a deliverable, not a
  // question the reader is asking.
  const questions = headings.filter(
    (block) => block.type === "heading" && block.text.endsWith("?"),
  );
  assert.equal(questions.length, 6);
});

test("the checklist is an ordered list of eight to ten steps", () => {
  const ordered = post().body.filter((block) => block.type === "list" && block.ordered);
  assert.equal(ordered.length, 1, "the checklist is the post's only ordered list");
  const [checklist] = ordered;
  assert.ok(checklist.type === "list" && checklist.items.length >= 8);
  assert.ok(checklist.type === "list" && checklist.items.length <= 10);
});

test("the post links to the service, the estimate, and the two cost guides", () => {
  const found = hrefs();
  assert.ok(found.has("/services/estate-cleanout"));
  assert.ok(found.has("/locations/north-vancouver"));
  assert.ok(found.has("/estimate"));
  assert.ok(found.has("/blog/junk-removal-cost-north-vancouver"));
  assert.ok(found.has("/blog/garage-cleanout-north-vancouver-cost"));
});

test("the service is linked twice — once up top, once at the end", () => {
  const links = post().body.flatMap((block) => {
    if (block.type === "paragraph" || block.type === "heading") return extractLinks(block.text);
    if (block.type === "callout") return extractLinks(block.text);
    if (block.type === "list") return block.items.flatMap(extractLinks);
    return [];
  });

  assert.ok(
    links.filter((href) => href === "/services/estate-cleanout").length >= 2,
    "the service page should be linked from the intro and again near the CTA",
  );
});

test("the closing CTA points at the estimate", () => {
  const ctas = post().body.filter((block) => block.type === "cta");
  assert.equal(ctas.length, 1);
  const [cta] = ctas;
  assert.ok(cta.type === "cta" && cta.href === "/estimate");
  assert.ok(cta.type === "cta" && cta.label.startsWith("Get a Free Estimate"));
});

test("price figures stay approximate", () => {
  // Market ranges, not quotes. A later edit must not turn "roughly $400-1,800"
  // into a number a grieving family could hold us to.
  const prose = JSON.stringify(post());
  assert.ok(prose.includes("roughly $400–1,800"), "the 2026 range must stay approximate");
  assert.ok(prose.includes("roughly $250"), "the single-room figure must stay approximate");
  assert.ok(prose.includes("exceed $2,500"), "the upper figure must stay an open bound");
  assert.ok(prose.includes("1–3 days"), "the duration must stay a range");
});

test("the post does not restate the cost pillar's load table", () => {
  // The truck-load price table lives in one place. This post links to it.
  assert.equal(post().body.some((block) => block.type === "table"), false);
});

test("the post carries exactly five FAQ pairs, each 40-60 words", () => {
  const item = post();
  assert.equal(item.faqs?.length, 5);
  for (const faq of item.faqs!) {
    assert.ok(faq.question.endsWith("?"), `not a question: ${faq.question}`);
    const words = faq.answer.split(/\s+/).length;
    assert.ok(words >= 40 && words <= 60, `answer is ${words} words: ${faq.question}`);
  }
});

test("Article, FAQPage, and BreadcrumbList JSON-LD all serialize", () => {
  const item = post();
  const article = articleSchema(item);

  assert.equal(article["@type"], "Article");
  assert.equal(article.headline, item.title);
  assert.equal(article.datePublished, item.date);
  assert.equal(article.author["@type"], "Organization");
  assert.equal(article.author.name, site.name);

  const faq = faqSchema(item.faqs!);
  assert.equal(faq["@type"], "FAQPage");
  assert.equal(faq.mainEntity.length, 5);
  assert.equal(faq.mainEntity[0].name, item.faqs![0].question);

  const crumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Journal", path: "/blog" },
    { name: item.title, path: `/blog/${item.slug}` },
  ]);
  assert.equal(crumbs["@type"], "BreadcrumbList");
  assert.equal(crumbs.itemListElement.length, 3);
  assert.equal(crumbs.itemListElement[2].item, `${site.url}/blog/${SLUG}`);

  // Review and rating markup stays excluded, as everywhere else in the Journal.
  const serialized = JSON.stringify([article, faq, crumbs]);
  assert.equal(serialized.includes("AggregateRating"), false);
  assert.equal(serialized.includes("Review"), false);
});

test("the cost pillar links back to this post", () => {
  const pillar = getPost("junk-removal-cost-north-vancouver")!;
  const found = pillar.body.flatMap((block) => {
    if (block.type === "paragraph" || block.type === "heading") return extractLinks(block.text);
    if (block.type === "callout") return extractLinks(block.text);
    if (block.type === "list") return block.items.flatMap(extractLinks);
    if (block.type === "table") return block.rows.flatMap((row) => row.flatMap(extractLinks));
    return [];
  });

  assert.ok(found.includes(`/blog/${SLUG}`), "the cost pillar needs a backlink to the estate guide");
});

test("the estate cleanout service points at this guide", () => {
  const service = getService("estate-cleanout")!;
  assert.equal(service.guidePostSlug, SLUG);
  assert.ok(getPost(service.guidePostSlug!), "guidePostSlug must resolve to a real post");
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

test("the Journal index stays in descending date order", () => {
  const dates = blogPosts.map((item) => item.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
  assert.equal(blogPosts[0].slug, SLUG, "the newest post leads the index");
});

test("the post appears in the sitemap", () => {
  assert.ok(sitemap().map((entry) => entry.url).includes(`${site.url}/blog/${SLUG}`));
});
