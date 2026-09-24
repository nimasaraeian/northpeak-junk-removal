export type ServiceAreaTier = "core" | "extended" | "confirmation" | "outside";

export type ServiceCategory =
  | "residential"
  | "commercial"
  | "specialty";

export interface Service {
  slug: string;
  name: string;
  shortName: string;
  eyebrow: string;
  headline: string;
  summary: string;
  description: string;
  featured: boolean;
  category: ServiceCategory;
  items: string[];
  outcomes: string[];
  seoTitle: string;
  seoDescription: string;
  relatedSlugs: string[];
  /**
   * Slug of a Journal post that covers this service in depth. When set, the
   * service page links out to it; the content test asserts the post exists.
   */
  guidePostSlug?: string;
}

export interface LocationPage {
  slug: string;
  name: string;
  region: string;
  /**
   * Remote cities we still serve on request but no longer compete for in
   * search. The page stays reachable by URL and is served `noindex, follow`;
   * it is kept out of the sitemap and out of every site-wide link list.
   */
  deEmphasized?: boolean;
  headline: string;
  summary: string;
  description: string;
  /** Local job types and property situations common in this area. */
  useCases: string[];
  neighborhoods: string[];
  /** Slugs of nearby location pages for internal linking. */
  relatedLocationSlugs: string[];
  seoTitle: string;
  seoDescription: string;
  /**
   * Long-form landing copy for the markets we actively compete for in search.
   * When present the page renders these blocks — through the same renderer the
   * Journal uses — in place of the stock summary lists, which the copy covers
   * in prose instead. Locations without it keep the original template.
   */
  body?: BlogBlock[];
  /** Rendered as an accordion and emitted as FAQPage JSON-LD when present. */
  faqs?: FaqItem[];
}

/**
 * A Journal illustration.
 *
 * Intrinsic `width`/`height` are required so every image reserves its space
 * before it loads and contributes no layout shift.
 */
export interface BlogImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * A block of post body content.
 *
 * Text fields accept a deliberately small subset of markdown — `[label](/path)`
 * links and `**bold**` — parsed by `parseInline` in `@/lib/blog/rich-text`.
 * Anything richer belongs in a CMS, which is where this content is headed.
 */
export type BlogBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "callout"; label: string; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "table"; columns: string[]; rows: string[][]; caption?: string }
  | { type: "figure"; image: BlogImage; caption?: string }
  | { type: "cta"; label: string; href: string };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  category: string;
  seoTitle: string;
  seoDescription: string;
  relatedServiceSlugs: string[];
  relatedLocationSlugs: string[];
  body: BlogBlock[];
  /** Runs full-bleed under the page header, and doubles as the share image. */
  heroImage?: BlogImage;
  /** Rendered as an accordion and emitted as FAQPage JSON-LD when present. */
  faqs?: FaqItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface EstimateDraft {
  postalCode: string;
  serviceSlug: string;
  volume: string;
  accessNotes: string;
  description: string;
  name: string;
  email: string;
  phone: string;
  preferredContact: "phone" | "email" | "text";
}

export type QuoteStatus =
  | "new"
  | "reviewing"
  | "quoted"
  | "booked"
  | "completed";

/**
 * Future Supabase `quote_requests` row.
 * The estimate wizard already collects these fields.
 */
export interface QuoteRequestRecord {
  id: string;
  postal_code: string;
  service_slug: string;
  volume: string | null;
  access_notes: string | null;
  description: string | null;
  photo_paths: string[];
  name: string;
  email: string;
  phone: string;
  preferred_contact: string;
  status: QuoteStatus;
  estimate_min: number | null;
  estimate_max: number | null;
  created_at: string;
}
