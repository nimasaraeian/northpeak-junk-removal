import { CtaBanner } from "@/components/content/CtaBanner";
import { FaqList } from "@/components/content/FaqList";
import { PageHeader } from "@/components/content/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { generalFaqs } from "@/content/faqs";
import { processSteps } from "@/content/site";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How Junk Removal Works",
  description:
    "Tell us what to remove, receive an estimate range, and enjoy a clean space. NorthPeak's process for North Vancouver and Greater Vancouver.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "How it works", path: "/how-it-works" },
        ])}
      />
      <JsonLd data={faqSchema(generalFaqs)} />
      <PageHeader
        eyebrow="Process"
        title="Simple on the surface. Careful underneath."
        description="The public journey is three steps. Behind it is a quote system being built for photos, access notes, and later AI-assisted ranges."
      />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-8">
          {processSteps.map((item) => (
            <article
              key={item.step}
              className="grid gap-6 rounded-[1.6rem] border border-navy/8 bg-white p-8 md:grid-cols-[120px_1fr]"
            >
              <p className="font-serif text-5xl text-gold">{item.step}</p>
              <div>
                <h2 className="text-3xl text-navy">{item.title}</h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-stone">{item.body}</p>
              </div>
            </article>
          ))}
        </Container>
      </section>
      <section className="pb-20">
        <Container width="narrow">
          <h2 className="display text-4xl text-navy">Questions before you book</h2>
          <div className="mt-8">
            <FaqList items={generalFaqs} />
          </div>
        </Container>
      </section>
      <CtaBanner />
    </>
  );
}
