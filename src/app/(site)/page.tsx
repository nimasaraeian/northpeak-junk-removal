import { FinalCta } from "@/components/home/FinalCta";
import { Gallery } from "@/components/home/Gallery";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Reviews } from "@/components/home/Reviews";
import { ServiceAreas } from "@/components/home/ServiceAreas";
import { Services } from "@/components/home/Services";
import { WhyNorthPeak } from "@/components/home/WhyNorthPeak";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/schema";
import { generalFaqs } from "@/content/faqs";

// Every other page self-canonicalizes through `pageMetadata`; the homepage had
// no canonical at all. Point it at the non-www root (resolved against
// `metadataBase`) so the site's most-crawled page stops relying on Google to
// pick its canonical and never splits signals with a www or query-string copy.
export const metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema(generalFaqs)} />
      <Hero />
      <HowItWorks />
      <Services />
      <Gallery />
      <WhyNorthPeak />
      <ServiceAreas />
      <Reviews />
      <FinalCta />
    </>
  );
}
