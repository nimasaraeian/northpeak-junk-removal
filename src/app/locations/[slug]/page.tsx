import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBanner } from "@/components/content/CtaBanner";
import { PageHeader } from "@/components/content/PageHeader";
import { PostalCodeChecker } from "@/components/estimate/PostalCodeChecker";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getLocation, locations } from "@/content/locations";
import { services } from "@/content/services";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return locations.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({ params }: PageProps<"/locations/[slug]">) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) return {};
  return pageMetadata({
    title: location.seoTitle,
    description: location.seoDescription,
    path: `/locations/${location.slug}`,
  });
}

export default async function LocationPage({ params }: PageProps<"/locations/[slug]">) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Locations", path: "/locations" },
          { name: location.name, path: `/locations/${location.slug}` },
        ])}
      />
      <PageHeader
        eyebrow={location.region}
        title={location.headline}
        description={location.summary}
      />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-lg leading-8 text-navy/80">{location.description}</p>
            <h2 className="mt-12 font-serif text-3xl text-navy">Neighbourhoods we know</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {location.neighborhoods.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-cream px-4 py-2 text-sm text-navy"
                >
                  {item}
                </li>
              ))}
            </ul>
            <h2 className="mt-12 font-serif text-3xl text-navy">
              Services in {location.name}
            </h2>
            <div className="mt-5 grid gap-3">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="rounded-2xl border border-navy/8 px-4 py-4 hover:bg-cream"
                >
                  <p className="font-semibold text-navy">
                    {service.name} in {location.name}
                  </p>
                  <p className="mt-1 text-sm text-stone">{service.summary}</p>
                </Link>
              ))}
            </div>
          </div>
          <aside className="space-y-5">
            <div className="rounded-[1.6rem] border border-navy/8 bg-white p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-2xl text-navy">Check your postal code</h2>
              <p className="mt-2 text-sm text-stone">
                Confirm coverage before you request an estimate.
              </p>
              <div className="mt-5">
                <PostalCodeChecker variant="plain" />
              </div>
              <div className="mt-6">
                <Button href="/estimate">Get My Estimate</Button>
              </div>
            </div>
          </aside>
        </Container>
      </section>
      <CtaBanner title={`Book ${location.name} with NorthPeak`} />
    </>
  );
}
