/**
 * The smallest markdown subset the Journal needs.
 *
 * Post bodies are hand-authored TypeScript, not Markdown files, but prose
 * still needs inline links and the occasional bold lead-in. Pulling in a
 * markdown library to get two constructs would cost far more than it returns,
 * so this parser handles exactly those two and nothing else:
 *
 *   [label](/path)   -> a link
 *   **text**         -> bold
 *
 * Everything unmatched stays literal text, so an unclosed `**` or a stray
 * bracket renders as typed rather than swallowing the rest of a sentence.
 */

export type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "link"; value: string; href: string };

// A link label may not contain `]`; an href may not contain `)` or whitespace.
// Bold runs may not contain `*`, which keeps `**` from spanning paragraphs.
const INLINE_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let lastIndex = 0;

  // `exec` in a loop rather than `matchAll` so we can track the gap between
  // matches and emit it as literal text.
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    const [raw, linkLabel, href, boldText] = match;

    if (linkLabel !== undefined && href !== undefined) {
      tokens.push({ type: "link", value: linkLabel, href });
    } else if (boldText !== undefined) {
      tokens.push({ type: "bold", value: boldText });
    }

    lastIndex = index + raw.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIndex) });
  }

  return tokens;
}

/** Every href referenced inline, in document order. Used by content tests. */
export function extractLinks(text: string): string[] {
  return parseInline(text)
    .filter((token): token is Extract<InlineToken, { type: "link" }> => token.type === "link")
    .map((token) => token.href);
}

/** True for site-relative hrefs, which render through `next/link`. */
export function isInternalHref(href: string): boolean {
  return href.startsWith("/");
}

/** Inline markup stripped out, for JSON-LD and other plain-text consumers. */
export function toPlainText(text: string): string {
  return parseInline(text)
    .map((token) => token.value)
    .join("");
}
