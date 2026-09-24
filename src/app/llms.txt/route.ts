import { blogPosts } from "@/content/blog";
import { indexedLocations } from "@/content/locations";
import { services } from "@/content/services";
import { site } from "@/content/site";

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
      `- Hours: ${site.hours} (typically 08:00–18:00, seven days)`,
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
    section("Typical 2026 pricing (Metro Vancouver market ranges, not quotes)", [
      "- Single item or minimum load: roughly $99–150 CAD",
      "- Quarter truck: roughly $200–300 CAD",
      "- Half truck (about one packed single garage): roughly $300–500 CAD",
      "- Three-quarter truck: roughly $500–700 CAD",
      "- Full truck: roughly $649–1,000+ CAD depending on the load",
      "- Heavy material (concrete, soil, tile, shingles) is quoted by weight on top",
      "Estimates are free, given from photos, and carry no obligation.",
    ]),
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
