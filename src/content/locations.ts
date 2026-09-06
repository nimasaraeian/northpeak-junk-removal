import type { LocationPage } from "@/types";

export const locations: LocationPage[] = [
  {
    slug: "north-vancouver",
    name: "North Vancouver",
    region: "North Shore",
    headline: "Local junk removal for the North Shore.",
    summary:
      "Our home market. From Lower Lonsdale to Deep Cove, we recover space in houses, condos, and small businesses.",
    description:
      "North Vancouver is where NorthPeak is based and where most of our work begins. The housing mix here — hillside homes, townhouses, and waterfront condos — means access, parking, and building rules matter as much as the load itself. We plan for that before we arrive.",
    neighborhoods: [
      "Lower Lonsdale",
      "Central Lonsdale",
      "Edgemont",
      "Lynn Valley",
      "Deep Cove",
      "Capilano",
      "Pemberton Heights",
    ],
    seoTitle: "Junk Removal North Vancouver",
    seoDescription:
      "Junk removal in North Vancouver from a local crew. Houses, condos, and small businesses from Lonsdale to Deep Cove.",
  },
  {
    slug: "west-vancouver",
    name: "West Vancouver",
    region: "North Shore",
    headline: "Discreet service for West Vancouver homes.",
    summary:
      "Estate, renovation, and household removal for Ambleside, Dundarave, Caulfeild, and the British Properties.",
    description:
      "West Vancouver jobs often involve larger homes, steeper access, and a preference for quiet, discreet crews. We schedule around households and listings, protect interiors, and treat the property as the primary concern — not the truck.",
    neighborhoods: [
      "Ambleside",
      "Dundarave",
      "Caulfeild",
      "Horseshoe Bay",
      "British Properties",
      "Chartwell",
    ],
    seoTitle: "Junk Removal West Vancouver",
    seoDescription:
      "Premium junk removal in West Vancouver. Discreet estate, renovation, and household cleanouts for North Shore homes.",
  },
  {
    slug: "burnaby",
    name: "Burnaby",
    region: "Metro Vancouver",
    headline: "Residential and commercial removal in Burnaby.",
    summary:
      "Homes, strata, and commercial spaces from Brentwood to Metrotown, with the same NorthPeak standard.",
    description:
      "Burnaby sits in our core coverage because the demand is consistent: condo cleanouts, townhouse garages, office moves, and renovation leftover. We work with strata rules and commercial loading docks as readily as single-family driveways.",
    neighborhoods: [
      "Brentwood",
      "Metrotown",
      "Burnaby Heights",
      "Deer Lake",
      "Highgate",
      "Big Bend",
    ],
    seoTitle: "Junk Removal Burnaby",
    seoDescription:
      "Junk removal in Burnaby for homes, strata, and commercial spaces. Transparent estimates and professional crews from NorthPeak.",
  },
  {
    slug: "vancouver",
    name: "Vancouver",
    region: "Greater Vancouver",
    headline: "Junk removal across the City of Vancouver.",
    summary:
      "Extended coverage for condos, houses, and workplaces from East Van to Kitsilano, booked by route.",
    description:
      "Vancouver jobs are booked as extended coverage: the same NorthPeak standard, scheduled by corridor so the visit stays efficient. Condos, character houses, and commercial suites all need access notes — elevator bookings, lane parking, and building rules — before the crew arrives.",
    neighborhoods: [
      "Kitsilano",
      "Mount Pleasant",
      "East Vancouver",
      "Downtown",
      "Kerrisdale",
      "Commercial Drive",
    ],
    seoTitle: "Junk Removal Vancouver",
    seoDescription:
      "Junk removal in Vancouver for homes, condos, and commercial spaces. Transparent estimates from NorthPeak, booked by route.",
  },
];

export function getLocation(slug: string) {
  return locations.find((location) => location.slug === slug);
}
