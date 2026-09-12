import { ContactChannels } from "@/components/content/ContactChannels";
import { ContactForm } from "@/components/content/ContactForm";
import { ContactLocationMap } from "@/components/content/ContactLocationMap";
import { PageHeader } from "@/components/content/PageHeader";
import { PostalCodeChecker } from "@/components/estimate/PostalCodeChecker";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { site } from "@/content/site";
import { formatSiteAddress } from "@/lib/maps";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { formatPhoneHref } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Contact NorthPeak",
  description:
    "Contact NorthPeak Junk Removal in North Vancouver. Request an estimate, check your service area, or ask about a commercial cleanout.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <PageHeader
        eyebrow="Contact"
        title="Tell us about the space."
        description="Estimates start with a postal code and a short description. For anything else, send a message and we will reply within one business day."
      />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-[1.6rem] bg-navy p-6 text-cream">
              <p className="eyebrow text-gold-glow">Direct</p>
              <a href={formatPhoneHref(site.phone)} className="mt-4 block text-2xl hover:text-gold-glow">
                {site.phone}
              </a>
              <ContactChannels className="mt-5" />
              <a href={`mailto:${site.email}`} className="mt-5 block text-cream/80">
                {site.email}
              </a>
              <p className="mt-6 text-sm leading-6 text-cream/85">{formatSiteAddress()}</p>
              <p className="mt-3 text-sm text-stone-soft">{site.areaServed}</p>
              <p className="mt-2 text-sm text-stone-soft">{site.hours}</p>
            </div>
            <PostalCodeChecker />
          </div>
          <div className="rounded-[1.6rem] border border-navy/8 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="text-2xl text-navy">Send a message</h2>
            <p className="mt-2 text-sm text-stone">
              For a priced range, use the estimate workflow. This form is for questions, partnerships, and commercial planning.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
      <section className="border-t border-navy/8 bg-cream pb-16 pt-12 sm:pb-20 sm:pt-16">
        <Container>
          <ContactLocationMap />
        </Container>
      </section>
    </>
  );
}
