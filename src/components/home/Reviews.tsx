import { site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

/**
 * Social proof, stated honestly.
 *
 * This section used to render three invented testimonials — names, quotes and
 * five-star rows for customers who do not exist — under a line promising the
 * real ones would sync from a CRM later. That is a fabricated review presented
 * as genuine, and no amount of qualifying text around it makes it not one.
 *
 * What replaces it says only what the Google listing says: the rating, the
 * number of reviews behind it, and a link to read them. Three reviews is a
 * small number and the copy does not pretend otherwise — "our first customers"
 * is accurate, and a visitor who clicks through finds exactly what was
 * claimed. That is worth more than three invented five-star quotes.
 *
 * The rating is text, not `AggregateRating` markup: see the note in
 * `site.google` for why self-published ratings stay out of structured data.
 */
export function Reviews() {
  const { rating, reviewCount, listingUrl } = site.google;

  return (
    <Section id="reviews" eyebrow="Client notes" title="What neighbours say">
      <div className="rounded-[1.6rem] border border-navy/8 bg-white p-8 shadow-[var(--shadow-card)] sm:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-2xl leading-none tracking-[0.25em] text-gold" aria-hidden>
              ★★★★★
            </p>
            <p className="display mt-5 text-4xl text-navy sm:text-5xl">
              {rating} on Google
            </p>
            <p className="mt-4 max-w-xl text-base leading-7 text-stone sm:text-lg">
              Rated {rating} by our first customers in North Vancouver, across{" "}
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"} on our Google
              Business Profile.
            </p>
          </div>

          <div className="shrink-0">
            <Button externalHref={listingUrl} externalRel="noopener" variant="ghost" size="lg">
              Read our Google reviews
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
