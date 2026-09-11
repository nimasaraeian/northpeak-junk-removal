import { testimonials } from "@/content/testimonials";
import { Section } from "@/components/ui/Section";

export function Reviews() {
  return (
    <Section
      id="reviews"
      eyebrow="Client notes"
      title="What neighbours say"
      description="Early proof from the North Shore and Vancouver. Reviews will later sync from the CRM."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((item) => (
          <figure
            key={item.id}
            className="flex flex-col justify-between rounded-[1.6rem] border border-navy/8 bg-white p-6 shadow-[var(--shadow-card)]"
          >
            <p className="text-gold">★★★★★</p>
            <blockquote className="mt-4 font-serif text-2xl leading-8 text-navy">
              “{item.quote}”
            </blockquote>
            <figcaption className="mt-8 text-sm text-stone">
              <span className="font-semibold text-navy">{item.name}</span>
              <span className="block">
                {item.area} · {item.service}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
