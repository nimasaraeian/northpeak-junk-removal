import assert from "node:assert/strict";
import test from "node:test";
import { getPost } from "@/content/blog";
import { locations } from "@/content/locations";
import { services } from "@/content/services";
import { extractLinks, toPlainText } from "@/lib/blog/rich-text";
import { faqSchema } from "@/lib/schema";

const STATIC_ROUTES = new Set(["/estimate", "/services", "/locations", "/blog", "/contact"]);

function bodyOf(slug: string) {
  const service = services.find((item) => item.slug === slug)!;
  assert.ok(service.body, `${slug} is missing landing copy`);
  return service.body;
}

function hrefsIn(blocks: NonNullable<(typeof services)[number]["body"]>) {
  return blocks.flatMap((block) => {
    if (block.type === "paragraph" || block.type === "heading") return extractLinks(block.text);
    if (block.type === "callout") return extractLinks(block.text);
    if (block.type === "list") return block.items.flatMap(extractLinks);
    if (block.type === "cta") return [block.href];
    return [];
  });
}

function wordsIn(blocks: NonNullable<(typeof services)[number]["body"]>) {
  return blocks
    .flatMap((block) => {
      if (block.type === "paragraph" || block.type === "heading") return [block.text];
      if (block.type === "callout") return [block.text];
      if (block.type === "list") return block.items;
      return [];
    })
    .reduce((total, text) => total + toPlainText(text).split(/\s+/).filter(Boolean).length, 0);
}

test("every service page carries long-form copy and FAQs", () => {
  // The pages shipped at 82–104 words each, which is why this floor exists.
  for (const service of services) {
    const words = wordsIn(bodyOf(service.slug));
    assert.ok(words >= 500, `${service.slug} is only ${words} words`);
    assert.equal(service.faqs?.length, 5, `${service.slug} should carry five FAQ pairs`);
  }
});

test("each body opens on a quick answer and closes on the estimate CTA", () => {
  for (const service of services) {
    const blocks = bodyOf(service.slug);
    const [first] = blocks;
    assert.equal(first.type, "callout", `${service.slug} must open on a callout`);
    assert.ok(
      first.type === "callout" && first.label === "Quick answer",
      `${service.slug} must open on the quick answer`,
    );

    const last = blocks.at(-1);
    assert.ok(
      last?.type === "cta" && last.href === "/estimate",
      `${service.slug} must close on the estimate CTA`,
    );
  }
});

test("section headings are questions, which is what gets quoted back", () => {
  for (const service of services) {
    const headings = bodyOf(service.slug)
      .filter((block) => block.type === "heading")
      .map((block) => (block.type === "heading" ? block.text : ""));

    assert.ok(headings.length >= 4, `${service.slug} has only ${headings.length} sections`);
    for (const heading of headings) {
      assert.ok(heading.endsWith("?"), `${service.slug}: not a question — ${heading}`);
    }
  }
});

test("FAQ answers stay in the 40–60 word band", () => {
  for (const service of services) {
    for (const faq of service.faqs!) {
      assert.ok(faq.question.endsWith("?"), `${service.slug}: not a question — ${faq.question}`);
      const words = faq.answer.split(/\s+/).filter(Boolean).length;
      assert.ok(
        words >= 40 && words <= 60,
        `${service.slug}: "${faq.question}" answers in ${words} words`,
      );
    }
  }
});

test("every internal link in service copy resolves to a real route", () => {
  for (const service of services) {
    for (const href of hrefsIn(bodyOf(service.slug))) {
      if (STATIC_ROUTES.has(href)) continue;

      const other = href.match(/^\/services\/(.+)$/);
      if (other) {
        assert.ok(services.some((item) => item.slug === other[1]), `unknown service: ${href}`);
        assert.notEqual(other[1], service.slug, `${service.slug} links to itself`);
        continue;
      }

      const location = href.match(/^\/locations\/(.+)$/);
      if (location) {
        assert.ok(locations.some((item) => item.slug === location[1]), `unknown location: ${href}`);
        continue;
      }

      const post = href.match(/^\/blog\/(.+)$/);
      if (post) {
        assert.ok(getPost(post[1]), `unknown post: ${href}`);
        continue;
      }

      assert.fail(`${service.slug}: link matches no known route — ${href}`);
    }
  }
});

test("each service page links out to at least one guide and one sibling", () => {
  for (const service of services) {
    const hrefs = new Set(hrefsIn(bodyOf(service.slug)));
    assert.ok(
      [...hrefs].some((href) => href.startsWith("/blog/")),
      `${service.slug} links to no Journal guide`,
    );
    assert.ok(
      [...hrefs].some((href) => href.startsWith("/services/")),
      `${service.slug} links to no sibling service`,
    );
  }
});

test("FAQ JSON-LD is emitted for every service", () => {
  for (const service of services) {
    const schema = faqSchema(service.faqs!);
    assert.equal(schema["@type"], "FAQPage");
    assert.equal(schema.mainEntity.length, 5);
    assert.equal(schema.mainEntity[0].name, service.faqs![0].question);
  }
});

test("prices stay approximate and consistent with the cost pillar", () => {
  const prose = JSON.stringify(services.map((service) => service.body));
  // Every figure on these pages is a market range, never a quote.
  assert.match(prose, /roughly \$99–150/);
  assert.equal(
    / \$\d+(\.\d{2})? (flat|fixed|guaranteed)/i.test(prose),
    false,
    "no fixed-price claims",
  );
});
