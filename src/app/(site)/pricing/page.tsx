import { CtaBanner } from "@/components/content/CtaBanner";
import { PageHeader } from "@/components/content/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { pricingTerms, singleItems, volumeTiers } from "@/content/pricing";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Junk Removal Pricing",
  description:
    "Clear, upfront junk removal pricing for North Vancouver and West Vancouver. Priced by the share of the trailer your load fills, with curbside and easy-inside rates. Heavy material by weight. Free photo estimates.",
  path: "/pricing",
});

function money(n: number): string {
  return `$${n}`;
}

function PriceTable({
  caption,
  colA,
  rows,
}: {
  caption: string;
  colA: string;
  rows: { label: string; sub?: string; curbside: number; easyInside: number }[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-navy/10 bg-white">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-navy/10 bg-cream/60">
            <th scope="col" className="px-4 py-3 text-sm font-semibold text-navy sm:px-6">
              {colA}
            </th>
            <th scope="col" className="px-3 py-3 text-right text-sm font-semibold text-navy sm:px-6">
              Curbside
            </th>
            <th scope="col" className="px-3 py-3 text-right text-sm font-semibold text-navy sm:px-6">
              Easy Inside
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-navy/8 last:border-0">
              <td className="px-4 py-3.5 sm:px-6">
                <p className="text-sm font-semibold text-navy">{row.label}</p>
                {row.sub ? <p className="mt-0.5 text-xs text-stone">{row.sub}</p> : null}
              </td>
              <td className="px-3 py-3.5 text-right text-sm font-semibold text-navy sm:px-6">
                {money(row.curbside)}
              </td>
              <td className="px-3 py-3.5 text-right text-sm text-stone sm:px-6">
                {money(row.easyInside)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />
      <PageHeader
        eyebrow="Pricing"
        title="Honest pricing, priced by the load."
        description="You pay for the share of our trailer your load fills — not a vague hourly rate. Prices below are starting points; a few photos give you a firm number before you book. Taxes extra where applicable."
      />

      <section className="py-14 sm:py-16">
        <Container width="narrow" className="grid gap-5">
          <div>
            <h2 className="display text-3xl text-navy sm:text-4xl">By volume</h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-stone">
              Volume is the fraction of our trailer your load fills. A full trailer is about
              12&nbsp;cubic yards — roughly four to five pickup loads.
            </p>
          </div>
          <PriceTable
            caption="Pricing by load volume"
            colA="Load size"
            rows={volumeTiers.map((t) => ({
              label: t.tier,
              sub: `${t.fits} · ${t.upTo}`,
              curbside: t.curbside,
              easyInside: t.easyInside,
            }))}
          />
          <p className="text-sm leading-7 text-stone">
            Heavy or dense material — concrete, soil, tile, drywall — is priced by weight, not
            volume, because disposal facilities bill it by the tonne.
          </p>
        </Container>
      </section>

      <section className="pb-14 sm:pb-16">
        <Container width="narrow" className="grid gap-5">
          <div>
            <h2 className="display text-3xl text-navy sm:text-4xl">Single items</h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-stone">
              One piece is a normal booking for us. Recycling for up to two mattresses or box
              springs is included.
            </p>
          </div>
          <PriceTable
            caption="Single-item pricing"
            colA="Item"
            rows={singleItems.map((i) => ({
              label: i.item,
              curbside: i.curbside,
              easyInside: i.easyInside,
            }))}
          />
        </Container>
      </section>

      <section className="pb-16 sm:pb-20">
        <Container width="narrow">
          <h2 className="display text-3xl text-navy sm:text-4xl">What the price covers</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {pricingTerms.map((term) => (
              <div
                key={term.title}
                className="rounded-[1.4rem] border border-navy/8 bg-white p-6"
              >
                <h3 className="text-lg font-semibold text-navy">{term.title}</h3>
                <p className="mt-2 text-sm leading-7 text-stone">{term.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button href="/estimate" size="lg">
              Get a free photo estimate →
            </Button>
            <p className="text-sm text-stone">
              Send a few photos and we&rsquo;ll confirm your exact number — usually within hours.
            </p>
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
