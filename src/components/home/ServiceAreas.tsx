import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getLocation } from "@/content/locations";

/**
 * Homepage "Service areas" section.
 *
 * The homepage holds most of the site's authority, so it links straight to the
 * core local landing pages with keyword-rich anchors ("Junk removal in North
 * Vancouver") rather than leaving those pages to the footer alone. North and
 * West Vancouver lead because they are the markets we most want to rank for.
 */
const FEATURED_AREA_SLUGS = ["north-vancouver", "west-vancouver", "vancouver", "burnaby"] as const;

export function ServiceAreas() {
  const areas = FEATURED_AREA_SLUGS.map((slug) => getLocation(slug)).filter(
    (area): area is NonNullable<typeof area> => Boolean(area),
  );

  if (areas.length === 0) return null;

  return (
    <section id="service-areas" className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow text-gold">Where we work</p>
          <h2 className="display mt-3 text-4xl text-navy sm:text-5xl">
            Junk removal across the North Shore
            <span className="mt-3 block h-0.5 w-16 bg-gold" aria-hidden />
          </h2>
          <p className="mt-6 text-lg leading-8 text-navy/80">
            NorthPeak is a local crew based on West Keith Rd. We cover junk removal in North
            Vancouver and West Vancouver on a same-week schedule, and reach across the bridges to
            Vancouver and Burnaby on the same pricing.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map((area) => (
            <Link
              key={area.slug}
              href={`/locations/${area.slug}`}
              className="group flex flex-col rounded-2xl border border-navy/8 bg-white p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
            >
              <h3 className="text-lg font-semibold text-navy">Junk removal in {area.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-7 text-stone">{area.summary}</p>
              <span className="mt-4 text-sm font-semibold text-gold group-hover:text-navy">
                See {area.name} →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/locations" className="text-sm font-semibold text-navy hover:text-gold">
            View every service area →
          </Link>
        </div>
      </Container>
    </section>
  );
}
