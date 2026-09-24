import assert from "node:assert/strict";
import test from "node:test";
import { blogPosts, getPost } from "@/content/blog";
import { getLocation, locations } from "@/content/locations";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { extractLinks, toPlainText } from "@/lib/blog/rich-text";
import { faqSchema, locationServiceSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const SLUG = "north-vancouver";

function location() {
  const found = getLocation(SLUG);
  assert.ok(found, "north-vancouver location is missing");
  return found;
}

function body() {
  const blocks = location().body;
  assert.ok(blocks, "north-vancouver must carry landing body content");
  return blocks;
}

function hrefs() {
  return new Set(
    body().flatMap((block) => {
      if (block.type === "paragraph" || block.type === "heading") return extractLinks(block.text);
      if (block.type === "callout") return extractLinks(block.text);
      if (block.type === "list") return block.items.flatMap(extractLinks);
      if (block.type === "cta") return [block.href];
      return [];
    }),
  );
}

function wordCount() {
  const prose = body().flatMap((block) => {
    if (block.type === "paragraph" || block.type === "heading") return [block.text];
    if (block.type === "callout") return [block.text];
    if (block.type === "list") return block.items;
    return [];
  });

  return prose.reduce((total, text) => total + toPlainText(text).split(/\s+/).filter(Boolean).length, 0);
}

test("the page keeps its route, title pattern, and rewritten description", () => {
  const item = location();
  assert.equal(item.slug, SLUG);
  assert.equal(item.seoTitle, "Junk Removal in North Vancouver, BC — Local Crew");
  assert.ok(item.seoTitle.includes("Local Crew"), "title pattern must keep the Local Crew suffix");
  assert.equal(item.deEmphasized, undefined, "the home market stays indexed");

  const description = item.seoDescription;
  assert.ok(description.length <= 155, `meta description is ${description.length} chars`);
  assert.match(description, /junk removal in North Vancouver/i);
  assert.match(description, /free estimates/i);
  assert.match(description, /local crew/i);
});

test("the quick answer is the first body block, as a callout", () => {
  const [first] = body();
  assert.equal(first.type, "callout");
  assert.ok(first.type === "callout" && first.label === "Quick answer");
  assert.ok(
    first.type === "callout" && first.text.startsWith("NorthPeak provides same-week junk removal"),
    "quick answer must keep its opening sentence",
  );
});

test("the landing copy runs long enough to answer the query", () => {
  const words = wordCount();
  assert.ok(words >= 1100, `landing copy is only ${words} words`);
});

test("the page ships text only — no article furniture", () => {
  // Prose, lists, one callout and the closing CTA. Tables and figures belong
  // in the Journal posts this page links out to.
  const allowed = new Set(["callout", "heading", "paragraph", "list", "cta"]);
  for (const block of body()) {
    assert.ok(allowed.has(block.type), `unexpected block on a landing page: ${block.type}`);
  }

  const last = body().at(-1);
  assert.ok(last?.type === "cta" && last.href === "/estimate", "the body must end on the estimate CTA");
});

test("the question headings carry the local intent", () => {
  const headings = body()
    .filter((block) => block.type === "heading")
    .map((block) => (block.type === "heading" ? block.text : ""));

  assert.equal(headings.length, 6);
  for (const heading of headings) {
    assert.ok(heading.endsWith("?"), `not a question: ${heading}`);
  }
  assert.ok(headings.some((heading) => /^How much does junk removal cost in North Vancouver\?$/.test(heading)));
  assert.ok(headings.some((heading) => /neighbourhoods/i.test(heading)));
});

test("every service line links to its own page, and the hub is linked once", () => {
  const links = hrefs();
  for (const slug of [
    "furniture-removal",
    "garage-cleanout",
    "estate-cleanout",
    "construction-cleanup",
    "commercial-cleanout",
    "junk-removal",
  ]) {
    assert.ok(links.has(`/services/${slug}`), `missing service link: ${slug}`);
  }

  const hubLinks = body()
    .flatMap((block) => (block.type === "paragraph" ? extractLinks(block.text) : []))
    .filter((href) => href === "/services");
  assert.equal(hubLinks.length, 1, "the services hub should be linked exactly once");
});

test("the four Journal guides and the nearby cities are linked in context", () => {
  const links = hrefs();
  for (const slug of [
    "junk-removal-cost-north-vancouver",
    "garage-cleanout-north-vancouver-cost",
    "how-to-get-rid-of-mattress-vancouver",
    "estate-cleanout-north-vancouver",
  ]) {
    assert.ok(links.has(`/blog/${slug}`), `missing Journal link: ${slug}`);
  }

  for (const slug of ["west-vancouver", "vancouver", "burnaby"]) {
    assert.ok(links.has(`/locations/${slug}`), `missing nearby city link: ${slug}`);
  }
});

test("the cost section summarizes without repeating the price table", () => {
  const prose = JSON.stringify(body());
  assert.ok(prose.includes("$649–799"), "full-load range must stay in the quick summary");
  assert.equal(
    body().some((block) => block.type === "table"),
    false,
    "the price table lives in the cost pillar, not here",
  );
});

test("every internal link resolves to a real route", () => {
  const staticRoutes = new Set(["/estimate", "/services"]);

  for (const href of hrefs()) {
    if (staticRoutes.has(href)) continue;

    const service = href.match(/^\/services\/(.+)$/);
    if (service) {
      assert.ok(services.some((item) => item.slug === service[1]), `unknown service link: ${href}`);
      continue;
    }

    const nearby = href.match(/^\/locations\/(.+)$/);
    if (nearby) {
      assert.ok(locations.some((item) => item.slug === nearby[1]), `unknown location link: ${href}`);
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

test("the linked Journal posts point back at this location", () => {
  const linked = blogPosts.filter((post) => hrefs().has(`/blog/${post.slug}`));
  assert.equal(linked.length, 4);
  for (const post of linked) {
    assert.ok(
      post.relatedLocationSlugs.includes(SLUG),
      `${post.slug} should list ${SLUG} among its locations`,
    );
  }
});

test("the page carries five FAQ pairs of 40 to 60 words", () => {
  const faqs = location().faqs;
  assert.equal(faqs?.length, 5);

  for (const faq of faqs!) {
    assert.ok(faq.question.endsWith("?"), `not a question: ${faq.question}`);
    const words = faq.answer.split(/\s+/).filter(Boolean).length;
    assert.ok(words >= 40 && words <= 60, `${faq.question} answers in ${words} words`);
  }

  assert.deepEqual(
    faqs!.map((faq) => faq.question),
    [
      "Do you offer free estimates in North Vancouver?",
      "Can you remove junk from condos and apartments with elevators?",
      "Do you take single items like one couch or mattress?",
      "Are you licensed and insured?",
      "Do you serve West Vancouver too?",
    ],
  );
});

test("the insurance answer claims no coverage the site cannot back", () => {
  const faq = location().faqs!.find((item) => item.question === "Are you licensed and insured?")!;
  assert.match(faq.answer, /fully insured local crew/);
  // No WorkSafeBC claim exists anywhere else in the site copy, so this page
  // does not invent one.
  assert.equal(/WorkSafe/i.test(faq.answer), false);
});

test("the disposal section stays honest about diversion", () => {
  const prose = JSON.stringify(body());
  assert.match(prose, /North Shore Recycling & Waste Centre/);
  assert.match(prose, /donation/i);
  assert.equal(/\d+\s?% of (every )?load/i.test(prose), false, "no unbacked diversion percentage");
});

test("FAQ JSON-LD mirrors the five pairs", () => {
  const schema = faqSchema(location().faqs!);
  assert.equal(schema["@type"], "FAQPage");
  assert.equal(schema.mainEntity.length, 5);
  assert.equal(schema.mainEntity[0].name, location().faqs![0].question);
});

test("Service JSON-LD names North Vancouver and the West Keith Rd address", () => {
  const schema = locationServiceSchema(location());

  assert.equal(schema.areaServed["@type"], "City");
  assert.equal(schema.areaServed.name, "North Vancouver");
  assert.equal(schema.provider.address.streetAddress, site.address.streetAddress);
  assert.equal(schema.provider.address.addressLocality, "North Vancouver");
  assert.equal(schema.provider.address.addressRegion, site.address.addressRegion);
  assert.equal(schema.provider["@id"], `${site.url}/#localbusiness`);
});

test("the canonical stays on the existing route", () => {
  const metadata = pageMetadata({
    title: location().seoTitle,
    description: location().seoDescription,
    path: `/locations/${SLUG}`,
  });

  assert.equal(metadata.alternates?.canonical, `${site.url}/locations/${SLUG}`);
});

test("landing copy is reserved for the cities we compete for", () => {
  // Indexed cities earn the long-form treatment; the de-emphasized ones are
  // served `noindex, follow` and keep the stock template, so writing landing
  // copy for them would be work nobody reads.
  for (const item of locations) {
    if (item.deEmphasized) {
      assert.equal(item.body, undefined, `${item.slug} is de-emphasized and needs no landing copy`);
      assert.equal(item.faqs, undefined, `${item.slug} is de-emphasized and needs no FAQ block`);
      continue;
    }

    assert.ok(item.body, `${item.slug} is indexed but still on the stock template`);
    assert.equal(item.faqs?.length, 5, `${item.slug} should carry five FAQ pairs`);
    assert.ok(
      item.seoDescription.length <= 155,
      `${item.slug} meta description is ${item.seoDescription.length} chars`,
    );
  }
});
