import Image from "next/image";
import { CtaBanner } from "@/components/content/CtaBanner";
import { PageHeader } from "@/components/content/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { trustFactors } from "@/content/site";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About NorthPeak Junk Removal",
  description:
    "NorthPeak is a premium local junk removal and space recovery company based in North Vancouver. More space. A better tomorrow.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <PageHeader
        eyebrow="The company"
        title="Built for the North Shore standard."
        description="NorthPeak exists because removal work in this city should feel closer to a property service than a truck dispatch."
      />
      <section className="py-16 sm:py-20">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-lg leading-8 text-navy/80">
              We started with a simple idea: the space after the work matters more
              than the pile that left. That is why the brand mark is a doorway,
              not a truck. Removing obstacles. Creating possibilities. Making room
              for what matters.
            </p>
            <p className="mt-5 text-lg leading-8 text-navy/80">
              The long-term company is a digital service platform — estimates,
              photo workflows, a customer portal, and an AI-assisted quoting
              layer. This website is the public foundation of that system.
            </p>
          </div>
          <div className="overflow-hidden rounded-[1.8rem] bg-white">
            <Image
              src="/brand/logo-light.png"
              alt="NorthPeak Junk Removal official logo"
              width={1536}
              height={1024}
              className="h-auto w-full"
              priority
            />
          </div>
        </Container>
      </section>
      <section className="pb-20">
        <Container className="grid gap-5 md:grid-cols-2">
          {trustFactors.map((item) => (
            <article key={item.title} className="rounded-[1.4rem] bg-white p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-semibold text-navy">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-stone">{item.body}</p>
            </article>
          ))}
        </Container>
      </section>
      <CtaBanner />
    </>
  );
}
