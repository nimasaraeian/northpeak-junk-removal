import { blogPosts, getPost } from "@/content/blog";
import { indexedLocations } from "@/content/locations";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { toPlainText } from "@/lib/blog/rich-text";

/**
 * `/llms.txt` — a plain-text map of the site for answer engines.
 *
 * An assistant answering "who does junk removal in North Vancouver" reads a
 * handful of pages, not a crawl. This file states the facts it needs in the
 * order it needs them — who, where, what, what it costs, and which URL backs
 * each claim — so the answer it gives is ours rather than a guess assembled
 * from directory listings.
 *
 * It is generated from the same content modules the pages render, so it cannot
 * drift from them: a service added to `services.ts` appears here on the next
 * build or it does not exist on the site either.
 */
export const dynamic = "force-static";

function section(title: string, lines: string[]) {
  return [`## ${title}`, "", ...lines, ""].join("\n");
}

/**
 * The price list is read out of the cost guide's table rather than retyped.
 *
 * Retyping it is how a site ends up quoting itself three different ways: this
 * file said a full truck was "$649–1,000+" while the guide's own table said
 * "$600–1,000+", and an assistant reading both had no way to tell which was
 * the site's position. The guide is the page that publishes these numbers, so
 * it is the one source; change them there and this follows.
 */
const COST_GUIDE_SLUG = "junk-removal-cost-north-vancouver";

function pricingLines() {
  const post = getPost(COST_GUIDE_SLUG);
  const table = post?.body.find((block) => block.type === "table");

  if (!post || table?.type !== "table") {
    // The guide is asserted to exist by `llms-txt.test.ts`; if it is ever
    // removed, say nothing about price rather than inventing a figure.
    return [];
  }

  return [
    ...table.rows.map(
      (row) => `- ${toPlainText(row[0])}: ${toPlainText(row[1])} CAD — ${toPlainText(row[2])}`,
    ),
    ...(table.caption ? ["", table.caption] : []),
    "Estimates are free, quoted from photos, and carry no obligation.",
    `Full breakdown: ${site.url}/blog/${COST_GUIDE_SLUG}`,
  ];
}

export function GET() {
  const body = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    site.tagline,
    "",
    section("Business facts", [
      `- Name: ${site.name}`,
      `- Address: ${site.address.streetAddress}, ${site.address.addressLocality}, ${site.address.addressRegion} ${site.address.postalCode}, Canada`,
      `- Phone: ${site.phone}`,
      `- Email: ${site.email}`,
      `- Hours: ${site.hours} (${site.opensAt}–${site.closesAt} daily)`,
      `- Service area: ${site.areaServed}`,
      `- Website: ${site.url}`,
    ]),
    section("What we do", [
      "Full-service junk removal: our crew does the lifting, loading, hauling and",
      "disposal. Loads are priced by the share of the truck they fill, quoted from",
      "photos before the visit, and confirmed on arrival before any work starts.",
      "Usable items are routed to donation and recycling first; the remainder goes",
      "to the North Shore Recycling & Waste Centre. Hazardous material (paint,",
      "solvents, fuel, propane) needs a dedicated depot and is not collected.",
    ]),
    section("Typical 2026 pricing (Metro Vancouver market ranges, not quotes)", pricingLines()),
    section(
      "Services",
      services.map(
        (service) => `- [${service.name}](${site.url}/services/${service.slug}): ${service.summary}`,
      ),
    ),
    section(
      "Service areas",
      indexedLocations.map(
        (location) =>
          `- [${location.name}](${site.url}/locations/${location.slug}): ${location.summary}`,
      ),
    ),
    section(
      "Guides",
      blogPosts.map((post) => `- [${post.title}](${site.url}/blog/${post.slug}): ${post.excerpt}`),
    ),
    section("Key pages", [
      `- [Free estimate](${site.url}/estimate): photo-based quote request`,
      `- [How it works](${site.url}/how-it-works): the three-step process`,
      `- [Service area](${site.url}/locations): postal-code availability check`,
      `- [Contact](${site.url}/contact)`,
    ]),
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
