import { and, count, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { itemsCatalog, quotes, settings } from "@/lib/db/schema";
import type { CatalogItemRow, QuoteRow, QuoteStatus } from "@/lib/db/schema";
import { DEFAULT_PRICING_SETTINGS, type PricingSettings } from "@/lib/quote-engine";

/**
 * Read helpers for the admin pages.
 *
 * Every one of these tolerates a missing database by returning an empty or
 * default value, because `/admin` renders a setup screen in that state rather
 * than an error page. The pages check `isAdminConfigured()` first; these
 * functions just refuse to be the thing that throws.
 */

export async function loadPricingSettings(): Promise<PricingSettings> {
  const db = getDb();
  if (!db) return DEFAULT_PRICING_SETTINGS;

  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  if (!row) return DEFAULT_PRICING_SETTINGS;

  // Merge over the defaults so a settings row written before a new field was
  // added still produces a complete object.
  return {
    ...DEFAULT_PRICING_SETTINGS,
    ...row.pricing,
    surchargeCents: {
      ...DEFAULT_PRICING_SETTINGS.surchargeCents,
      ...(row.pricing?.surchargeCents ?? {}),
    },
    laborCents: {
      ...DEFAULT_PRICING_SETTINGS.laborCents,
      ...(row.pricing?.laborCents ?? {}),
    },
    // A settings row written before the brackets existed has no list; fall
    // back to the seeded ladder rather than silently disabling the floors.
    priceFloors: row.pricing?.priceFloors?.length
      ? row.pricing.priceFloors
      : DEFAULT_PRICING_SETTINGS.priceFloors,
  };
}

export async function loadCatalog(): Promise<CatalogItemRow[]> {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(itemsCatalog)
    .where(eq(itemsCatalog.active, true))
    .orderBy(itemsCatalog.category, itemsCatalog.name);
}

export interface QuoteFilters {
  status?: QuoteStatus | "all";
  search?: string;
  /** ISO date (YYYY-MM-DD); quotes created on or after it. */
  since?: string;
}

export async function listQuotes(filters: QuoteFilters = {}, limit = 100): Promise<QuoteRow[]> {
  const db = getDb();
  if (!db) return [];

  const conditions = [];
  if (filters.status && filters.status !== "all") {
    conditions.push(eq(quotes.status, filters.status));
  }
  const search = filters.search?.trim();
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(ilike(quotes.customerName, pattern), ilike(quotes.customerPhone, pattern)),
    );
  }
  if (filters.since) {
    const parsed = new Date(filters.since);
    if (!Number.isNaN(parsed.getTime())) {
      conditions.push(gte(quotes.createdAt, parsed));
    }
  }

  const query = db.select().from(quotes);
  const filtered = conditions.length > 0 ? query.where(and(...conditions)) : query;

  return filtered.orderBy(desc(quotes.createdAt)).limit(limit);
}

export async function getQuote(id: number): Promise<QuoteRow | null> {
  const db = getDb();
  if (!db || !Number.isInteger(id)) return null;

  const [row] = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
  return row ?? null;
}

export interface DashboardStats {
  quotesThisMonth: number;
  winRatePct: number | null;
  revenueWonCents: number;
  avgQuoteValueCents: number | null;
  decidedThisMonth: number;
}

/**
 * Dashboard cards.
 *
 * "This month" is calendar month to date in the server's timezone, which on
 * Vercel is UTC — close enough for a two-person shop in Pacific time that the
 * first eight hours of the 1st land in the previous month's card. Worth
 * pinning to America/Vancouver if that ever matters.
 *
 * Revenue won sums the midpoint of each won quote's final range, since the
 * range is what the customer accepted; there is no invoiced figure in v1.
 */
export async function loadDashboardStats(): Promise<DashboardStats> {
  const db = getDb();
  if (!db) {
    return {
      quotesThisMonth: 0,
      winRatePct: null,
      revenueWonCents: 0,
      avgQuoteValueCents: null,
      decidedThisMonth: 0,
    };
  }

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const midpoint = sql<number>`((${quotes.finalLowCents} + ${quotes.finalHighCents}) / 2)`;

  const [totals] = await db
    .select({
      total: count(),
      won: sql<number>`count(*) filter (where ${quotes.status} = 'won')`.mapWith(Number),
      decided: sql<number>`count(*) filter (where ${quotes.status} in ('won', 'lost'))`.mapWith(
        Number,
      ),
      revenueWon: sql<number>`coalesce(sum(${midpoint}) filter (where ${quotes.status} = 'won'), 0)`.mapWith(
        Number,
      ),
      avgValue: sql<number | null>`avg(${midpoint})`.mapWith(Number),
    })
    .from(quotes)
    .where(gte(quotes.createdAt, monthStart));

  const decided = totals?.decided ?? 0;

  return {
    quotesThisMonth: totals?.total ?? 0,
    winRatePct: decided > 0 ? ((totals?.won ?? 0) / decided) * 100 : null,
    revenueWonCents: Math.round(totals?.revenueWon ?? 0),
    avgQuoteValueCents:
      totals?.total && totals.avgValue !== null && Number.isFinite(totals.avgValue)
        ? Math.round(totals.avgValue)
        : null,
    decidedThisMonth: decided,
  };
}
