import Link from "next/link";
import { CtaBanner } from "@/components/content/CtaBanner";
import { PageHeader } from "@/components/content/PageHeader";
import { PostalCodeChecker } from "@/components/estimate/PostalCodeChecker";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { locations } from "@/content/locations";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Junk Removal Service Area",
  description:
    "Check whether NorthPeak services your postal code. Core coverage includes the North Shore and Burnaby. Vancouver is booked by route.",
  path: "/locations",
});

export default function LocationsPage() {
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
        title="North Shore first. Greater Vancouver next."
        description="Core coverage is North Vancouver, West Vancouver, and Burnaby. Vancouver and nearby cities are booked by route."
      />
      <section className="py-16">
        <Container>
          <PostalCodeChecker />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {locations.map((location) => (
              <Link
                key={location.slug}
                href={`/locations/${location.slug}`}
                className="rounded-[1.6rem] border border-navy/8 bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <p className="eyebrow text-gold-deep">{location.region}</p>
                <h2 className="mt-3 text-2xl text-navy">{location.name}</h2>
                <p className="mt-3 text-sm leading-7 text-stone">{location.summary}</p>
                <p className="mt-5 text-sm font-semibold text-navy">View location →</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <CtaBanner />
    </>
  );
}
