import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function CtaBanner({
  title = "More Space. A Better Tomorrow.",
  body = "Tell us what needs to leave. We will send a clear estimate range and a time that works.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="bg-navy">
      <Container className="flex flex-col items-start justify-between gap-8 py-16 sm:py-20 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <h2 className="display text-4xl text-cream sm:text-5xl">{title}</h2>
          <p className="mt-4 text-base leading-7 text-stone-soft">{body}</p>
        </div>
        <Button href="/estimate" size="lg">
          Get Your Estimate
        </Button>
      </Container>
    </section>
  );
}
