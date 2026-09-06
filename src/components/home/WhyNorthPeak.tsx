import { trustFactors } from "@/content/site";
import { Section } from "@/components/ui/Section";

export function WhyNorthPeak() {
  return (
    <Section
      eyebrow="Why NorthPeak"
      title="A service brand, not a haul."
      description="The work is removal. The standard is how the property feels when we leave."
    >
      <div className="grid gap-px overflow-hidden rounded-[1.6rem] border border-navy/8 bg-navy/8 sm:grid-cols-2">
        {trustFactors.map((item) => (
          <article key={item.title} className="bg-paper p-8">
            <h3 className="text-xl font-semibold text-navy">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-stone">{item.body}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
