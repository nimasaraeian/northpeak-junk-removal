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
}

export interface LocationPage {
  slug: string;
  name: string;
  region: string;
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
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  area: string;
  service: string;
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
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "table"; columns: string[]; rows: string[][]; caption?: string }
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
