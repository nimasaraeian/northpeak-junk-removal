import type { Service } from "@/types";

export const services: Service[] = [
  {
    slug: "junk-removal",
    name: "Junk Removal",
    shortName: "Junk Removal",
    eyebrow: "Full-service removal",
    headline: "Clear the space. Keep the property intact.",
    summary:
      "Residential and commercial junk removal across North Vancouver and Greater Vancouver, handled with care and a clear process.",
    description:
      "NorthPeak is a premium junk removal service for homes, strata, and businesses that want the work done properly. We remove household overflow, bulky items, renovation leftovers, and accumulated storage without treating your property like a job site. Loads are sorted for reuse, recycling, and responsible disposal.",
    featured: false,
    category: "residential",
    items: [
      "Household overflow and stored belongings",
      "Appliances and bulky items",
      "Shed, patio, and storage cleanouts",
      "Mixed loads after a move or renovation",
    ],
    outcomes: [
      "Same-visit load-out for most residential jobs",
      "Floor, wall, and landscaping protection",
      "A clear inventory of what left the property",
    ],
    seoTitle: "Junk Removal North Vancouver",
    seoDescription:
      "Professional junk removal in North Vancouver and Greater Vancouver. Transparent estimates, careful crews, and responsible disposal from NorthPeak.",
    relatedSlugs: ["furniture-removal", "garage-cleanout", "estate-cleanout"],
  },
  {
    slug: "furniture-removal",
    name: "Furniture Removal",
    shortName: "Furniture Removal",
    eyebrow: "Homes and offices",
    headline: "Heavy pieces out. Rooms ready again.",
    summary:
      "Sofas, beds, dining sets, and office furniture removed from homes and workplaces across Vancouver and the North Shore.",
    description:
      "Furniture is often the last thing standing between a room and its next use. We remove single statement pieces or full suites from condos, houses, and offices, including tight stairwells and elevator bookings. Donation-ready items are separated whenever condition allows.",
    featured: true,
    category: "residential",
    items: [
      "Sofas, sectionals, and armchairs",
      "Mattresses, frames, and dressers",
      "Dining tables and office desks",
      "Patio and outdoor furniture",
    ],
    outcomes: [
      "Protected hallways and common areas",
      "Donation routing for usable pieces",
      "Same-day or scheduled pickup windows",
    ],
    seoTitle: "Furniture Removal Vancouver",
    seoDescription:
      "Furniture removal in Vancouver, North Vancouver, and West Vancouver. Careful extraction of sofas, beds, desks, and full-room suites.",
    relatedSlugs: ["junk-removal", "estate-cleanout", "commercial-cleanout"],
  },
  {
    slug: "garage-cleanout",
    name: "Garage Cleanout",
    shortName: "Garage Cleanout",
    eyebrow: "Space recovery",
    headline: "Return the garage to the household.",
    summary:
      "Full and partial garage cleanouts for North Shore homes that have outgrown years of stored projects, sports gear, and overflow.",
    description:
      "A garage should serve the house, not archive it. We clear mixed loads, sports equipment, broken tools, leftover renovation materials, and the items that never found a room. The goal is a usable floor — parking, workshop, or storage that actually works.",
    featured: true,
    category: "residential",
    items: [
      "Years of mixed household storage",
      "Sports, camping, and hobby overflow",
      "Broken tools and leftover materials",
      "Attic-to-garage relocation piles",
    ],
    outcomes: [
      "Sorted load: reuse, recycle, dispose",
      "Optional keep-pile staging before we leave",
      "A swept, accessible floor when we finish",
    ],
    seoTitle: "Garage Cleanout Vancouver",
    seoDescription:
      "Garage cleanout in North Vancouver and Greater Vancouver. Recover parking, storage, and workshop space with a professional crew.",
    relatedSlugs: ["junk-removal", "estate-cleanout", "construction-cleanup"],
  },
  {
    slug: "estate-cleanout",
    name: "Estate Cleanout",
    shortName: "Estate Cleanup",
    eyebrow: "Sensitive work",
    headline: "A measured process for a difficult moment.",
    summary:
      "Estate and downsizing cleanouts handled with discretion for families, executors, and realtors on the North Shore.",
    description:
      "Estate work is not a standard haul. We coordinate with families, executors, and listing agents to empty a home in stages: what stays, what is donated, and what must leave. The pace is respectful. The property is left ready for sale, transfer, or the next chapter.",
    featured: true,
    category: "specialty",
    items: [
      "Full or staged home empty-outs",
      "Donation and recycling coordination",
      "Basement, attic, and outbuilding contents",
      "Preparation for listing or transfer",
    ],
    outcomes: [
      "Clear communication with the decision-maker",
      "Room-by-room progress if needed",
      "A home left presentable, not stripped raw",
    ],
    seoTitle: "Estate Cleanout North Vancouver",
    seoDescription:
      "Discreet estate cleanout in North Vancouver and West Vancouver. Staged empty-outs for families, executors, and listing preparation.",
    relatedSlugs: ["furniture-removal", "garage-cleanout", "junk-removal"],
  },
  {
    slug: "construction-cleanup",
    name: "Construction Cleanup",
    shortName: "Construction Debris",
    eyebrow: "After the build",
    headline: "Debris out so the finish can begin.",
    summary:
      "Construction and renovation debris removal for contractors, homeowners, and property managers across Greater Vancouver.",
    description:
      "Renovation leftover slows every other trade. We remove mixed construction debris, packaging, old fixtures, and demolition remnants so the space can be finished, inspected, or occupied. Jobs can be booked as a single load-out or as recurring site support.",
    featured: true,
    category: "specialty",
    items: [
      "Renovation packaging and offcuts",
      "Old fixtures, cabinetry, and flooring",
      "Mixed demolition remnants",
      "Post-trade site tidy-ups",
    ],
    outcomes: [
      "Contractor-friendly timing windows",
      "Separated recyclable materials where possible",
      "Safer, clearer access for remaining trades",
    ],
    seoTitle: "Construction Cleanup Vancouver",
    seoDescription:
      "Construction debris removal in Vancouver and the North Shore. Fast load-outs for renovations, fixtures, and post-trade cleanup.",
    relatedSlugs: ["junk-removal", "commercial-cleanout", "garage-cleanout"],
  },
  {
    slug: "commercial-cleanout",
    name: "Commercial Cleanout",
    shortName: "Commercial Cleanout",
    eyebrow: "Workplaces",
    headline: "Offices, retail, and common spaces reset.",
    summary:
      "Commercial junk removal for offices, retail, strata, and light industrial spaces across Vancouver and Burnaby.",
    description:
      "Commercial cleanouts have to respect tenants, hours, and building rules. We handle office furniture, retail fixtures, storage rooms, and end-of-lease leftovers with elevator bookings, after-hours options, and a tidy handoff for the next occupant or the property manager.",
    featured: true,
    category: "commercial",
    items: [
      "Office furniture and cubicle systems",
      "Retail fixtures and display units",
      "Storage rooms and surplus inventory",
      "End-of-lease and strata common areas",
    ],
    outcomes: [
      "Building-rule and elevator coordination",
      "After-hours options for occupied sites",
      "A space ready for the next tenant or use",
    ],
    seoTitle: "Commercial Junk Removal Vancouver",
    seoDescription:
      "Commercial junk removal in Vancouver and Burnaby. Office, retail, and end-of-lease cleanouts coordinated with building access.",
    relatedSlugs: ["furniture-removal", "construction-cleanup", "junk-removal"],
  },
];

export const featuredServices = services.filter((service) => service.featured);

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getRelatedServices(slugs: string[]) {
  return slugs
    .map((slug) => getService(slug))
    .filter((service): service is Service => Boolean(service));
}
