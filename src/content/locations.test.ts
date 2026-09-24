import assert from "node:assert/strict";
import test from "node:test";
import { getPost } from "@/content/blog";
import { indexedLocations, locations } from "@/content/locations";
import { services } from "@/content/services";
import { extractLinks, toPlainText } from "@/lib/blog/rich-text";
import { faqSchema, locationServiceSchema } from "@/lib/schema";
import { site } from "@/content/site";

const STATIC_ROUTES = new Set(["/estimate", "/services", "/locations", "/blog", "/contact"]);

type Blocks = NonNullable<(typeof locations)[number]["body"]>;

function hrefsIn(blocks: Blocks) {
  return blocks.flatMap((block) => {
    if (block.type === "paragraph" || block.type === "heading") return extractLinks(block.text);
    if (block.type === "callout") return extractLinks(block.text);
    if (block.type === "list") return block.items.flatMap(extractLinks);
    if (block.type === "cta") return [block.href];
    return [];
  });
}

function wordsIn(blocks: Blocks) {
  return blocks
    .flatMap((block) => {
      if (block.type === "paragraph" || block.type === "heading") return [block.text];
      if (block.type === "callout") return [block.text];
      if (block.type === "list") return block.items;
      return [];
    })
    .reduce((total, text) => total + toPlainText(text).split(/\s+/).filter(Boolean).length, 0);
}

test("every indexed city carries enough copy to compete", () => {
  for (const location of indexedLocations) {
    const words = wordsIn(location.body!);
    assert.ok(words >= 700, `${location.slug} is only ${words} words`);
  }
});

test("each page opens on a quick answer and closes on the estimate CTA", () => {
  for (const location of indexedLocations) {
    const [first] = location.body!;
    assert.ok(
      first.type === "callout" && first.label === "Quick answer",
      `${location.slug} must open on the quick answer`,
    );

    const last = location.body!.at(-1);
    assert.ok(
      last?.type === "cta" && last.href === "/estimate",
      `${location.slug} must close on the estimate CTA`,
    );
  }
});

test("headings are questions and name the city where it matters", () => {
  for (const location of indexedLocations) {
    const headings = location.body!
      .filter((block) => block.type === "heading")
      .map((block) => (block.type === "heading" ? block.text : ""));

    assert.ok(headings.length >= 5, `${location.slug} has only ${headings.length} sections`);
    for (const heading of headings) {
      assert.ok(heading.endsWith("?"), `${location.slug}: not a question — ${heading}`);
    }
    assert.ok(
      headings.some((heading) => heading.includes(location.name)),
      `${location.slug} never names the city in a heading`,
    );
  }
});

test("each city links to its neighbours, a service and a guide", () => {
  for (const location of indexedLocations) {
    const hrefs = new Set(hrefsIn(location.body!));

    for (const slug of location.relatedLocationSlugs) {
      const related = locations.find((item) => item.slug === slug)!;
      if (related.deEmphasized) continue;
      assert.ok(hrefs.has(`/locations/${slug}`), `${location.slug} does not link to ${slug}`);
    }

    assert.ok(
      [...hrefs].some((href) => href.startsWith("/services/")),
      `${location.slug} links to no service page`,
    );
    assert.ok(
      [...hrefs].some((href) => href.startsWith("/blog/")),
      `${location.slug} links to no Journal guide`,
    );
  }
});

test("no city page links to itself", () => {
  for (const location of indexedLocations) {
    assert.equal(
      hrefsIn(location.body!).includes(`/locations/${location.slug}`),
      false,
      `${location.slug} links to itself`,
    );
  }
});

test("every internal link in city copy resolves to a real route", () => {
  for (const location of indexedLocations) {
    for (const href of hrefsIn(location.body!)) {
      if (STATIC_ROUTES.has(href)) continue;

      const service = href.match(/^\/services\/(.+)$/);
      if (service) {
        assert.ok(services.some((item) => item.slug === service[1]), `unknown service: ${href}`);
        continue;
      }

      const city = href.match(/^\/locations\/(.+)$/);
      if (city) {
        assert.ok(locations.some((item) => item.slug === city[1]), `unknown location: ${href}`);
        continue;
      }

      const post = href.match(/^\/blog\/(.+)$/);
      if (post) {
        assert.ok(getPost(post[1]), `unknown post: ${href}`);
        continue;
      }

      assert.fail(`${location.slug}: link matches no known route — ${href}`);
    }
  }
});

test("FAQ answers stay in the 40–60 word band", () => {
  for (const location of indexedLocations) {
    for (const faq of location.faqs!) {
      assert.ok(faq.question.endsWith("?"), `${location.slug}: not a question`);
      const words = faq.answer.split(/\s+/).filter(Boolean).length;
      assert.ok(
        words >= 40 && words <= 60,
        `${location.slug}: "${faq.question}" answers in ${words} words`,
      );
    }
  }
});

test("insurance answers claim nothing the site cannot back", () => {
  for (const location of indexedLocations) {
    const faq = location.faqs!.find((item) => /insured/i.test(item.question));
    if (!faq) continue;
    assert.match(faq.answer, /fully insured local crew/);
    assert.equal(/WorkSafe/i.test(faq.answer), false, `${location.slug} invents a WorkSafeBC claim`);
  }
});

test("every indexed city emits Service and FAQPage JSON-LD with the address", () => {
  for (const location of indexedLocations) {
    const service = locationServiceSchema(location);
    assert.equal(service.areaServed.name, location.name);
    assert.equal(service.provider.address.streetAddress, site.address.streetAddress);

    const faq = faqSchema(location.faqs!);
    assert.equal(faq["@type"], "FAQPage");
    assert.equal(faq.mainEntity.length, 5);
  }
});

test("pricing is stated consistently across every city page", () => {
  const prose = JSON.stringify(indexedLocations.map((location) => location.body));
  assert.match(prose, /roughly \$99/);
  // No city is quoted a premium or a discount for its postcode.
  assert.equal(/postcode premium/.test(prose) && !/no postcode premium/.test(prose), false);
});
