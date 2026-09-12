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
  email: process.env.NEXT_PUBLIC_EMAIL ?? "hello@northpeakjunkremoval.ca",
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
  hours: "By appointment, seven days a week",
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "",
  },
} as const;

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How It Works" },
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
