import Link from "next/link";
import { CtaBanner } from "@/components/content/CtaBanner";
import { PageHeader } from "@/components/content/PageHeader";
import { PostalCodeChecker } from "@/components/estimate/PostalCodeChecker";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import {
  getConfirmationServiceCities,
  getCoreServiceCities,
  getExtendedServiceCities,
} from "@/content/service-areas";
import { locations } from "@/content/locations";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Junk Removal Service Area",
  description:
    "NorthPeak provides junk removal across the North Shore, Vancouver, Burnaby, and surrounding Metro Vancouver communities. Enter your postal code to check service availability.",
  path: "/locations",
});

export default function LocationsPage() {
  const coreCities = getCoreServiceCities();
  const extendedCities = getExtendedServiceCities();
  const confirmationCities = getConfirmationServiceCities();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Locations", path: "/locations" },
        ])}
      />
      <PageHeader
        eyebrow="Service area"
        title="Junk removal across Metro Vancouver."
        description="NorthPeak provides junk removal across the North Shore, Vancouver, Burnaby, and surrounding Metro Vancouver communities. Enter your postal code to check service availability."
      />
      <section className="py-16">
        <Container>
          <PostalCodeChecker />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="rounded-[1.6rem] border border-navy/8 bg-white p-6 shadow-[var(--shadow-card)]">
              <p className="eyebrow text-gold-deep">Core Service Area</p>
              <h2 className="mt-3 font-serif text-2xl text-navy">Standard coverage</h2>
              <p className="mt-3 text-sm leading-7 text-stone">
                Our primary service areas with regular availability and standard scheduling.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-navy">
                {coreCities.map((city) => (
                  <li key={city}>• {city}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.6rem] border border-navy/8 bg-white p-6 shadow-[var(--shadow-card)]">
              <p className="eyebrow text-gold-deep">Extended Service Area</p>
              <h2 className="mt-3 font-serif text-2xl text-navy">Route-based coverage</h2>
              <p className="mt-3 text-sm leading-7 text-stone">
                We may service these areas depending on distance, routing, truck schedule, and job
                size.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-navy">
                {extendedCities.map((city) => (
                  <li key={city}>• {city}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.6rem] border border-navy/8 bg-white p-6 shadow-[var(--shadow-card)]">
              <p className="eyebrow text-gold-deep">Additional Areas</p>
              <h2 className="mt-3 font-serif text-2xl text-navy">Available by request</h2>
              <p className="mt-3 text-sm leading-7 text-stone">
                Farther locations where we confirm availability before booking. You can still
                submit a quote request.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-navy">
                {confirmationCities.map((city) => (
                  <li key={city}>• {city}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="font-serif text-3xl text-navy">Location pages</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone">
              Browse local guides for cities we actively serve. Every page includes neighbourhood
              context and a postal-code check before you request an estimate.
            </p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {locations.map((location) => (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="rounded-[1.6rem] border border-navy/8 bg-white p-6 shadow-[var(--shadow-card)]"
                >
                  <p className="eyebrow text-gold-deep">{location.region}</p>
                  <h3 className="mt-3 text-2xl text-navy">{location.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone">{location.summary}</p>
                  <p className="mt-5 text-sm font-semibold text-navy">View location →</p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
      <CtaBanner />
    </>
  );
}
