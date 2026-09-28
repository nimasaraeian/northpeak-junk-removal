import { FinalCta } from "@/components/home/FinalCta";
import { Gallery } from "@/components/home/Gallery";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { StageLoad } from "@/components/home/StageLoad";
import { Reviews } from "@/components/home/Reviews";
import { Services } from "@/components/home/Services";
import { WhyNorthPeak } from "@/components/home/WhyNorthPeak";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/schema";
import { generalFaqs } from "@/content/faqs";

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema(generalFaqs)} />
      <Hero />
      <HowItWorks />
      <Services />
      <StageLoad />
      <Gallery />
      <WhyNorthPeak />
      <Reviews />
      <FinalCta />
    </>
  );
}
