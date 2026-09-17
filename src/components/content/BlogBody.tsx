import type { Route } from "next";
import { RichText } from "@/components/content/RichText";
import { Button } from "@/components/ui/Button";
import type { BlogBlock } from "@/types";

/**
 * Renders a post body from its typed blocks.
 *
 * Headings are h2 — the post title owns the single h1 in `PageHeader` — so a
 * post cannot accidentally produce a second h1 or skip a level.
 */
export function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={index} className="display pt-6 text-3xl text-navy sm:text-4xl">
                {block.text}
              </h2>
            );

          case "paragraph":
            return (
              <p key={index} className="text-lg leading-8 text-navy/80">
                <RichText text={block.text} />
              </p>
            );

          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag
                key={index}
                className={`space-y-3 pl-6 text-lg leading-8 text-navy/80 ${
                  block.ordered ? "list-decimal" : "list-disc"
                } marker:text-gold`}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <RichText text={item} />
                  </li>
                ))}
              </ListTag>
            );
          }

          case "table":
            return (
              <div key={index} className="overflow-x-auto">
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

          case "cta":
            return (
              <div key={index} className="py-2">
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
