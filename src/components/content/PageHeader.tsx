import { Container } from "@/components/ui/Container";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="border-b border-navy/8 bg-cream">
      <Container className="py-10 sm:py-16 md:py-24">
        <p className="eyebrow text-gold-deep">{eyebrow}</p>
        <h1 className="display mt-3 max-w-4xl text-4xl text-navy sm:mt-4 sm:text-5xl md:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone sm:mt-6 sm:text-lg sm:leading-8">
          {description}
        </p>
      </Container>
    </section>
  );
}
