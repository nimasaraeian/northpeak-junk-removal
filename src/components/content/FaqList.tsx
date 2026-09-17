import { cx } from "@/lib/utils";
import type { FaqItem } from "@/types";

/**
 * `default` is the flush, hairline-divided list used on marketing pages.
 * `cards` gives each question its own surface, which holds up better at the
 * end of a long article where the FAQ needs to read as a distinct section.
 */
type FaqListProps = {
  items: FaqItem[];
  variant?: "default" | "cards";
};

export function FaqList({ items, variant = "default" }: FaqListProps) {
  const isCards = variant === "cards";

  return (
    <div
      className={cx(
        isCards ? "space-y-3" : "divide-y divide-navy/8 border-y border-navy/8",
      )}
    >
      {items.map((item) => (
        <details
          key={item.question}
          className={cx(
            "group",
            isCards
              ? "rounded-2xl border border-navy/10 bg-white px-5 py-4 transition open:border-gold/35 open:bg-cream/40 sm:px-6 sm:py-5"
              : "py-6",
          )}
        >
          <summary className="cursor-pointer list-none text-lg font-medium text-navy marker:hidden">
            <span className="flex items-center justify-between gap-6">
              {item.question}
              <span
                className={cx(
                  "shrink-0 text-gold transition group-open:rotate-45",
                  isCards && "text-xl leading-none",
                )}
              >
                +
              </span>
            </span>
          </summary>
          <p
            className={cx(
              "max-w-3xl text-base leading-7 text-stone",
              isCards ? "mt-3 border-t border-navy/8 pt-3" : "mt-3",
            )}
          >
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
