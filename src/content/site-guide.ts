export type SiteGuideItem = {
  id: string;
  intent: string;
  title: string;
  description: string;
  href: string;
  featured?: boolean;
};

/** Intent-based paths — ordered by what visitors usually want first. */
export const siteGuideItems: SiteGuideItem[] = [
  {
    id: "estimate",
    intent: "Most popular",
    title: "Get my estimate",
    description: "Upload photos, see a clear price range, and book when it fits.",
    href: "/estimate",
    featured: true,
  },
  {
    id: "coverage",
    intent: "First question",
    title: "Check my postal code",
    description: "Confirm North Shore or Greater Vancouver coverage in seconds.",
    href: "/#service-area",
  },
  {
    id: "services",
    intent: "Browse by job",
    title: "Find the right service",
    description: "Garage, estate, furniture, construction, and commercial cleanouts.",
    href: "/#services",
  },
  {
    id: "truck",
    intent: "Size the load",
    title: "See what fits in the truck",
    description: "Visual load tiers so you know what you are paying for.",
    href: "/#stage-the-load",
  },
  {
    id: "process",
    intent: "How it works",
    title: "Understand the process",
    description: "Photos, estimate range, then a calm crew on your schedule.",
    href: "/#how-it-works",
  },
  {
    id: "results",
    intent: "Proof",
    title: "View before & after",
    description: "Real North Shore jobs — same room, different tomorrow.",
    href: "/#results",
  },
  {
    id: "contact",
    intent: "Talk to us",
    title: "Call, text, or message",
    description: "Questions, commercial planning, or a same-day follow-up.",
    href: "/contact",
  },
];
