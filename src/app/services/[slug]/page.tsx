import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBanner } from "@/components/content/CtaBanner";
import { PageHeader } from "@/components/content/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { locations } from "@/content/locations";
import { getRelatedServices, getService, services } from "@/content/services";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return pageMetadata({
    title: service.seoTitle,
    description: service.seoDescription,
    path: `/services/${service.slug}`,
  });
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = getRelatedServices(service.relatedSlugs);

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ])}
      />
      <PageHeader
        eyebrow={service.eyebrow}
        title={service.headline}
        description={service.summary}
      />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-lg leading-8 text-navy/80">{service.description}</p>
            <h2 className="mt-12 font-serif text-3xl text-navy">What we typically remove</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {service.items.map((item) => (
                <li key={item} className="rounded-2xl bg-cream px-4 py-3 text-sm text-navy">
                  {item}
                </li>
              ))}
            </ul>
            <h2 className="mt-12 font-serif text-3xl text-navy">What you can expect</h2>
            <ul className="mt-5 space-y-3">
              {service.outcomes.map((item) => (
                <li key={item} className="text-sm leading-7 text-stone">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <aside className="h-fit rounded-[1.6rem] border border-navy/8 bg-white p-6 shadow-[var(--shadow-card)]">
            <p className="eyebrow text-gold-deep">Next step</p>
            <h2 className="mt-3 text-2xl text-navy">Get a range for this service</h2>
            <p className="mt-3 text-sm leading-6 text-stone">
              Start with a postal code. The estimate workflow is already structured for photos and AI-assisted ranges.
            </p>
            <div className="mt-6">
              <Button href={{ pathname: "/estimate", query: { service: service.slug } }}>
                Get My Estimate
              </Button>
            </div>
            <p className="mt-8 eyebrow text-stone">Available in</p>
            <ul className="mt-3 space-y-2 text-sm">
              {locations.map((location) => (
                <li key={location.slug}>
                  <Link href={`/locations/${location.slug}`} className="text-navy hover:underline">
                    {service.name} in {location.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </Container>
      </section>
      <section className="pb-16">
        <Container>
          <p className="eyebrow text-stone">Related services</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/services/${item.slug}`}
                className="rounded-[1.3rem] border border-navy/8 bg-cream p-5"
              >
                <h3 className="text-lg font-semibold text-navy">{item.name}</h3>
                <p className="mt-2 text-sm text-stone">{item.summary}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <CtaBanner title={`Ready for ${service.shortName.toLowerCase()}?`} />
    </>
  );
}
