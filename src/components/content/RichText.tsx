import type { Route } from "next";
import Link from "next/link";
import { isInternalHref, parseInline } from "@/lib/blog/rich-text";

/**
 * Renders one string of post prose, resolving its inline links and bold runs.
 */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((token, index) => {
        if (token.type === "bold") {
          return (
            <strong key={index} className="font-semibold text-navy">
              {token.value}
            </strong>
          );
        }

        if (token.type === "link") {
          // Hrefs are parsed out of content strings at runtime, so `typedRoutes`
          // cannot check them here. `blog-content.test.ts` closes that gap by
          // asserting every internal link in the Journal resolves to a real
          // route, service, or location.
          return isInternalHref(token.href) ? (
            <Link
              key={index}
              href={token.href as Route}
              className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-deep"
            >
              {token.value}
            </Link>
          ) : (
            <a
              key={index}
              href={token.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-deep"
            >
              {token.value}
            </a>
          );
        }

        return <span key={index}>{token.value}</span>;
      })}
    </>
  );
}
