export const site = {
  name: "NorthPeak Junk Removal",
  shortName: "NorthPeak",
  legalName: "NorthPeak Junk Removal",
  tagline: "More Space. A Better Tomorrow.",
  description:
    "Premium junk removal and property recovery for homes and businesses across North Vancouver and Greater Vancouver.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://northpeakjunk.com",
  locale: "en_CA",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+1 (778) 900-5060",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "info@northpeakjunk.com",
  areaServed: "North Vancouver and Greater Vancouver, British Columbia",
  address: {
    streetAddress: "564 West Keith Rd",
    addressLocality: "North Vancouver",
    addressRegion: "BC",
    postalCode: "V7M 1M4",
    addressCountry: "CA",
  },
  geo: {
    latitude: 49.3203847,
    longitude: -123.0877412,
  },
  /**
   * One answer, used everywhere.
   *
   * This said "by appointment, seven days a week" while the JSON-LD said
   * 08:00–18:00 and the Google Business Profile said open 24 hours. Three
   * answers to the same question is what makes a local listing look
   * unmaintained, so the real hours live here and the schema derives from
   * them rather than restating them.
   */
  hours: "8:00 AM – 6:00 PM, seven days a week",
  opensAt: "08:00",
  closesAt: "18:00",
  /**
   * Public profiles.
   *
   * Instagram and X are live, so they carry the real URL as their default and
   * the env var is an override rather than the source. `||` rather than `??`
   * on those two is deliberate: `.env.example` ships these keys blank, and an
   * empty string is a value `??` would happily keep — which would silently
   * drop a profile that exists. Facebook and LinkedIn have no account yet, so
   * they stay empty and are filtered out of both the footer and `sameAs`.
   */
  social: {
    instagram:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/northpeakjunk/",
    x: process.env.NEXT_PUBLIC_X_URL || "https://x.com/northpeakjunk",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "",
  },
  /**
   * The Google Business Profile, as the listing itself reports it.
   *
   * `rating` and `reviewCount` describe something outside this repo, so they
   * go stale the moment a new review lands — check the profile and update
   * them here, in one place, rather than in the markup.
   *
   * They are rendered as plain text and deliberately NOT emitted as
   * `AggregateRating` structured data. A rating you publish about yourself on
   * your own domain is not counted for a local business and invites a manual
   * action; the reviews carry weight on the profile, which is what the link
   * is for.
   *
   * The two URLs are different destinations and both are needed: `listingUrl`
   * is where a reader goes to read the reviews, `reviewUrl` is the dialog a
   * past customer writes one in. Keeping them in one block under distinct
   * names is what stops them being swapped for each other.
   */
  google: {
    rating: "5.0",
    // Widened deliberately: `site` is `as const`, which would otherwise pin
    // this to the literal 3 and make pluralising against it a type error the
    // day the count changes.
    reviewCount: 3 as number,
    /**
     * The public listing — where "Read our Google reviews" goes.
     */
    listingUrl:
      "https://www.google.com/maps/search/?api=1&query=NorthPeak+Junk+Removal+564+West+Keith+Rd+North+Vancouver",
    /**
     * The short link from the profile dashboard's "Ask for reviews" panel. It
     * opens the write-a-review dialog directly, which is the whole point —
     * a customer sent to the listing lands and leaves. `||` so a blank env
     * value falls back rather than being kept; see the note on `social`.
     */
    reviewUrl:
      process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "https://g.page/r/CQpStjbMaZkzEBM/review",
  },
} as const;

/**
 * Primary navigation.
 *
 * "Home" is dropped because the logo already goes there, which buys the row
 * for the two hubs that were reachable only from the footer: the location
 * pages carry the local search strategy, and the Journal carries the guides
 * every service and location page links into. A hub nothing links to from the
 * header is a hub crawlers and readers both reach last.
 */
export const navigation = [
  { href: "/services", label: "Services" },
  { href: "/locations", label: "Service Area" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const trustFactors = [
  {
    title: "Local Team",
    body: "North Shore based. We know the streets, the buildings, and the expectations of this coast.",
  },
  {
    title: "Responsible Disposal",
    body: "Reuse and recycle first. Landfill last. Every load is sorted with intention.",
  },
  {
    title: "Transparent Process",
    body: "Clear scope. Honest ranges. No surprise fees after we arrive.",
  },
  {
    title: "Professional Service",
    body: "Punctual crews, protected floors, and a space left ready for what comes next.",
  },
] as const;

export const heroValues = [
  { id: "homes", label: "Cleaner Homes" },
  { id: "community", label: "Stronger Communities" },
  { id: "disposal", label: "Responsible Disposal" },
  { id: "tomorrow", label: "A Brighter Tomorrow" },
] as const;

export const processSteps = [
  {
    step: "01",
    title: "Upload Photos",
    body: "Send a few photos of the space and items. We size the load before anyone arrives.",
  },
  {
    step: "02",
    title: "Get Estimate Range",
    body: "Receive a clear estimate range — usually within hours — with no obligation.",
  },
  {
    step: "03",
    title: "Book Removal",
    body: "Pick a time that works. Our crew arrives, clears the load, and leaves the space ready.",
  },
] as const;
