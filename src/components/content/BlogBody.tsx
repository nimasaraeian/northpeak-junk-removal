import type { Route } from "next";
import Image from "next/image";
import { RichText } from "@/components/content/RichText";
import { Button } from "@/components/ui/Button";
import type { BlogBlock } from "@/types";

/**
 * Text measure.
 *
 * The article column is 48rem wide, which runs to roughly 85 characters at our
 * body size — past the point where the eye reliably finds the next line.
 * Prose is held to ~65ch and centred, while figures and tables keep the full
 * column, so illustrations read as a deliberate break in the text rather than
 * another paragraph.
 */
const MEASURE = "mx-auto w-full max-w-[65ch]";

/**
 * Renders a post body from its typed blocks.
 *
 * Headings are h2 — the post title owns the single h1 in `PageHeader` — so a
 * post cannot accidentally produce a second h1 or skip a level.
 */
export function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={index}
                className={`${MEASURE} display mt-16 mb-5 scroll-mt-24 text-[1.85rem] leading-tight text-navy first:mt-0 sm:text-4xl`}
              >
                {block.text}
              </h2>
            );

          case "paragraph":
            return (
              <p key={index} className={`${MEASURE} mb-6 text-lg leading-8 text-navy/80`}>
                <RichText text={block.text} />
              </p>
            );

          case "callout":
            return (
              <aside
                key={index}
                className={`${MEASURE} mb-10 rounded-2xl border border-gold/30 bg-cream px-6 py-5 shadow-[var(--shadow-card)] sm:px-7 sm:py-6`}
              >
                <p className="eyebrow text-gold-deep">{block.label}</p>
                <p className="mt-3 text-lg leading-8 text-navy">
                  <RichText text={block.text} />
                </p>
              </aside>
            );

          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag
                key={index}
                className={`${MEASURE} mb-8 space-y-3.5 pl-7 text-lg leading-8 text-navy/80 ${
                  block.ordered
                    ? "list-decimal marker:font-semibold marker:text-gold-deep"
                    : "list-disc marker:text-gold"
                }`}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="pl-1.5">
                    <RichText text={item} />
                  </li>
                ))}
              </ListTag>
            );
          }

          case "table":
            return (
              <div key={index} className="mb-10 overflow-x-auto">
                <table className="w-full border-collapse text-left text-base">
                  {block.caption ? (
                    <caption className="pb-3 text-left text-sm text-stone">
                      {block.caption}
                    </caption>
                  ) : null}
                  <thead>
                    <tr className="border-b border-navy/15">
                      {block.columns.map((column) => (
                        <th key={column} className="py-3 pr-4 font-semibold text-navy">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-navy/8">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="py-3 pr-4 align-top text-navy/80">
                            <RichText text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "figure":
            return (
              <figure key={index} className="mb-10">
                <Image
                  src={block.image.src}
                  alt={block.image.alt}
                  width={block.image.width}
                  height={block.image.height}
                  // Flat vector art: the optimizer has nothing to improve and
                  // would only add a round trip.
                  unoptimized
                  className="w-full rounded-[1.4rem] border border-navy/8 bg-cream"
                />
                {block.caption ? (
                  <figcaption className="mt-3 text-center text-sm leading-6 text-stone">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );

          case "cta":
            return (
              <div key={index} className={`${MEASURE} mb-10`}>
                <Button href={block.href as Route} size="lg">
                  {block.label}
                </Button>
              </div>
            );
        }
      })}
    </div>
  );
}
