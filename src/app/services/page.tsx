import Link from "next/link";
import { CtaBanner } from "@/components/content/CtaBanner";
import { PageHeader } from "@/components/content/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { locations } from "@/content/locations";
import { services } from "@/content/services";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Junk Removal Services Vancouver",
  description:
    "Furniture removal, garage cleanouts, estate work, construction debris, and commercial cleanouts across North Vancouver and Greater Vancouver.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <PageHeader
        eyebrow="Service hub"
        title="Removal, done to a higher standard."
        description="Every service is scoped the same way: access, volume, disposal path, and a property left ready for its next use."
      />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-5">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group grid gap-6 rounded-[1.6rem] border border-navy/8 bg-white p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 md:grid-cols-[1fr_1.4fr_auto] md:items-center md:p-8"
            >
              <div>
                <p className="eyebrow text-gold-deep">{service.eyebrow}</p>
                <h2 className="mt-3 text-3xl text-navy">{service.name}</h2>
              </div>
              <p className="text-sm leading-7 text-stone">{service.summary}</p>
              <p className="text-sm font-semibold text-navy">View service →</p>
            </Link>
          ))}
        </Container>
      </section>
      <section className="pb-16">
        <Container>
          <p className="eyebrow text-stone">Also serving</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {locations.map((location) => (
              <Link
                key={location.slug}
                href={`/locations/${location.slug}`}
                className="rounded-full border border-navy/10 px-4 py-2 text-sm text-navy"
              >
                {location.name}
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <CtaBanner />
    </>
  );
}
