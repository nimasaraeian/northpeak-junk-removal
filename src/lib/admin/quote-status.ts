import type { QuoteStatus } from "@/lib/db/schema";

/**
 * The quote statuses as a runtime array, in pipeline order.
 *
 * Lives in this dependency-light module (not in the `"use client"` StatusPill)
 * so server components can import the real array. Importing a plain value from
 * a client module turns it into a client reference on the server, which is why
 * `/admin/quotes` crashed with `QUOTE_STATUSES.map is not a function`. Type-only
 * import of QuoteStatus keeps Drizzle out of any client bundle.
 */
export const QUOTE_STATUSES: readonly QuoteStatus[] = ["draft", "sent", "won", "lost"];
