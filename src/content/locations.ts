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
      "North Vancouver is where NorthPeak is based. Hillside homes, waterfront condos, and mixed-use blocks along Lonsdale each bring different access constraints — narrow driveways, strata loading zones, and timed elevator bookings. We scope loads from photos and confirm parking before the truck rolls.",
    useCases: [
      "Basement and storage cleanouts in Lynn Valley and Edgemont",
      "Condo move-out loads along Lower Lonsdale",
      "Garage resets before listing a Capilano or Deep Cove property",
      "Small retail or office overflow near Central Lonsdale",
    ],
    neighborhoods: [
      "Lower Lonsdale",
      "Central Lonsdale",
      "Edgemont",
      "Lynn Valley",
      "Deep Cove",
      "Capilano",
      "Pemberton Heights",
    ],
    relatedLocationSlugs: ["west-vancouver", "burnaby", "vancouver"],
    seoTitle: "Junk Removal in North Vancouver, BC — Local Crew",
    seoDescription:
      "Local junk removal in North Vancouver from a North Shore crew. Condo cleanouts, garage resets, and household loads from Lonsdale to Deep Cove.",
  },
  {
    slug: "west-vancouver",
    name: "West Vancouver",
    region: "North Shore",
    headline: "Discreet service for West Vancouver homes.",
    summary:
      "Estate, renovation, and household removal for Ambleside, Dundarave, Caulfeild, and the British Properties.",
    description:
      "West Vancouver properties tend to be larger, often on sloped lots with long driveways and interior finishes worth protecting. Many clients are preparing a listing, managing an estate, or clearing renovation debris from a high-end remodel. We work quietly, protect floors and doorways, and leave the home presentation-ready.",
    useCases: [
      "Estate cleanouts in the British Properties or Chartwell",
      "Renovation debris from kitchen and bath upgrades",
      "Furniture and storage removal before staging a listing",
      "Downsizing loads from Ambleside and Dundarave condos",
    ],
    neighborhoods: [
      "Ambleside",
      "Dundarave",
      "Caulfeild",
      "Horseshoe Bay",
      "British Properties",
      "Chartwell",
    ],
    relatedLocationSlugs: ["north-vancouver", "vancouver", "burnaby"],
    seoTitle: "Junk Removal West Vancouver",
    seoDescription:
      "Discreet junk removal in West Vancouver for estates, renovations, and household cleanouts. Careful crews for North Shore homes.",
  },
  {
    slug: "vancouver",
    name: "Vancouver",
    region: "Greater Vancouver",
    headline: "Junk removal across the City of Vancouver.",
    summary:
      "Standard coverage for condos, houses, and workplaces from East Van to Kitsilano and UBC.",
    description:
      "Vancouver's housing stock spans laneway houses, heritage character homes, downtown towers, and commercial suites — each with different loading rules. Lane parking, concierge schedules, and elevator reservations are routine here. We confirm access details from your photos and postal code before dispatch so the visit stays efficient.",
    useCases: [
      "Condo cleanouts in Yaletown, Kitsilano, and Mount Pleasant",
      "Tenant turnover loads in East Vancouver character homes",
      "Office furniture and storage removal downtown",
      "Move-out overflow near UBC and Kerrisdale",
    ],
    neighborhoods: [
      "Kitsilano",
      "Mount Pleasant",
      "East Vancouver",
      "Downtown",
      "Kerrisdale",
      "Commercial Drive",
      "UBC",
    ],
    relatedLocationSlugs: ["burnaby", "richmond", "north-vancouver"],
    seoTitle: "Junk Removal Vancouver",
    seoDescription:
      "Junk removal in Vancouver for condos, houses, and commercial suites. Elevator bookings, lane access, and transparent estimates from NorthPeak.",
  },
  {
    slug: "burnaby",
    name: "Burnaby",
    region: "Metro Vancouver",
    headline: "Residential and commercial removal in Burnaby.",
    summary:
      "Homes, strata, and commercial spaces from Brentwood to Metrotown, with the same NorthPeak standard.",
    description:
      "Burnaby combines high-rise strata near Metrotown, townhouse complexes in Brentwood, and commercial bays along major corridors. Strata move-out rules, loading dock windows, and underground parking clearances come up on almost every job. We plan around those constraints instead of improvising on arrival.",
    useCases: [
      "Strata move-out cleanouts near Metrotown and Brentwood",
      "Townhouse garage and storage resets",
      "Retail or office cleanouts along Kingsway corridors",
      "Renovation leftover from kitchen and flooring projects",
    ],
    neighborhoods: [
      "Brentwood",
      "Metrotown",
      "Burnaby Heights",
      "Deer Lake",
      "Highgate",
      "Big Bend",
    ],
    relatedLocationSlugs: ["vancouver", "new-westminster", "richmond"],
    seoTitle: "Junk Removal Burnaby",
    seoDescription:
      "Junk removal in Burnaby for strata, townhouses, and commercial spaces. Metrotown to Brentwood with clear estimates and careful crews.",
  },
  {
    slug: "richmond",
    name: "Richmond",
    region: "Metro Vancouver",
    deEmphasized: true,
    headline: "Clearouts for Richmond homes and businesses.",
    summary:
      "Core coverage for houses, townhouses, and commercial suites from Steveston to City Centre.",
    description:
      "Richmond mixes riverfront neighbourhoods, dense townhouse rows, and commercial units near Bridgeport and City Centre. Tight parking pads, strata bylaws, and long carry distances from interior units are common. Whether you are emptying a Steveston garage or clearing a retail backroom, we confirm access before booking the truck.",
    useCases: [
      "Townhouse garage cleanouts in Terra Nova and Ironwood",
      "Move-out loads near Brighouse and Lansdowne",
      "Restaurant or retail backroom overflow",
      "Furniture removal from Steveston and East Richmond homes",
    ],
    neighborhoods: [
      "Steveston",
      "Brighouse",
      "Ironwood",
      "Terra Nova",
      "East Richmond",
      "City Centre",
    ],
    relatedLocationSlugs: ["vancouver", "burnaby", "delta"],
    seoTitle: "Junk Removal Richmond",
    seoDescription:
      "Junk removal in Richmond for townhouses, strata, and commercial suites. Steveston to City Centre with postal-code availability checks.",
  },
  {
    slug: "new-westminster",
    name: "New Westminster",
    region: "Metro Vancouver",
    deEmphasized: true,
    headline: "Fraser River city cleanouts and removals.",
    summary:
      "Core coverage for apartments, heritage homes, and commercial spaces along the Fraser.",
    description:
      "New Westminster blends pre-war character homes in Queens Park, newer towers in Downtown and Uptown, and active commercial blocks in Sapperton. Older homes mean narrow staircases; newer towers mean freight elevator bookings. Queensborough adds townhouses and mixed residential loads along the Fraser. We size the crew and timing from your photos.",
    useCases: [
      "Heritage home cleanouts in Queens Park and Uptown",
      "Apartment move-out loads in Downtown towers",
      "Commercial cleanouts in Sapperton and Columbia Street corridors",
      "Townhouse storage resets in Queensborough",
    ],
    neighborhoods: [
      "Uptown",
      "Downtown",
      "Sapperton",
      "Queensborough",
      "Queens Park",
    ],
    relatedLocationSlugs: ["burnaby", "coquitlam", "surrey"],
    seoTitle: "Junk Removal New Westminster",
    seoDescription:
      "Junk removal in New Westminster for heritage homes, towers, and commercial spaces along the Fraser River.",
  },
  {
    slug: "coquitlam",
    name: "Coquitlam",
    region: "Tri-Cities",
    deEmphasized: true,
    headline: "Tri-Cities removal from Burke Mountain to Maillardville.",
    summary:
      "Extended coverage for hillside homes, townhouses, and commercial spaces across Coquitlam.",
    description:
      "Coquitlam stretches from Burke Mountain subdivisions to established Maillardville blocks and busy retail around Coquitlam Centre. Extended coverage means we confirm route fit and scheduling before booking — especially for hillside driveways on Westwood Plateau or longer carries from interior units.",
    useCases: [
      "Garage cleanouts on Burke Mountain and Westwood Plateau",
      "Townhouse move-out loads near Austin Heights",
      "Basement storage clears in Maillardville",
      "Small commercial cleanouts near Coquitlam Centre",
    ],
    neighborhoods: [
      "Burke Mountain",
      "Westwood Plateau",
      "Maillardville",
      "Austin Heights",
      "Coquitlam Centre",
    ],
    relatedLocationSlugs: ["port-coquitlam", "port-moody", "burnaby"],
    seoTitle: "Junk Removal Coquitlam",
    seoDescription:
      "Junk removal in Coquitlam from Burke Mountain to Maillardville. Extended coverage with postal-code availability checks.",
  },
  {
    slug: "port-coquitlam",
    name: "Port Coquitlam",
    region: "Tri-Cities",
    deEmphasized: true,
    headline: "Residential cleanouts in Port Coquitlam.",
    summary:
      "Extended coverage for Citadel, Mary Hill, and central Port Coquitlam neighbourhoods.",
    description:
      "Port Coquitlam is a distinct community from Coquitlam — more single-family focused, with railway-adjacent neighbourhoods and established blocks near Lincoln Park. Driveway width, fence gates, and side-yard access determine how smoothly a load-out runs. We confirm extended availability from your postal code before scheduling.",
    useCases: [
      "Single-family garage and shed cleanouts in Citadel",
      "Downsizing loads from Mary Hill and central PoCo homes",
      "Yard debris and renovation leftover removal",
      "Basement storage clears before a listing",
    ],
    neighborhoods: [
      "Citadel",
      "Lincoln Park",
      "Central Port Coquitlam",
      "Mary Hill",
    ],
    relatedLocationSlugs: ["coquitlam", "port-moody", "maple-ridge"],
    seoTitle: "Junk Removal Port Coquitlam",
    seoDescription:
      "Junk removal in Port Coquitlam for single-family homes and garages. Extended coverage from Citadel to Mary Hill.",
  },
  {
    slug: "port-moody",
    name: "Port Moody",
    region: "Tri-Cities",
    deEmphasized: true,
    headline: "Inlet-side homes and hillside access.",
    summary:
      "Extended coverage for sloped properties, townhouses, and small businesses near the Burrard Inlet.",
    description:
      "Port Moody combines inlet-side neighbourhoods like Newport Village with hillside streets on Heritage Mountain and Glenayre. Sloped driveways, retaining walls, and narrow turnaround space make access planning essential. We treat Port Moody as extended coverage and confirm route fit before committing to a visit.",
    useCases: [
      "Townhouse cleanouts near Newport Village and Suter Brook",
      "Hillside garage resets on Heritage Mountain",
      "Renovation debris from kitchen and bath projects",
      "Small office or studio cleanouts along St Johns Street",
    ],
    neighborhoods: [
      "Heritage Mountain",
      "Mountain Meadows",
      "Newport Village",
      "Glenayre",
    ],
    relatedLocationSlugs: ["coquitlam", "port-coquitlam", "burnaby"],
    seoTitle: "Junk Removal Port Moody",
    seoDescription:
      "Junk removal in Port Moody for hillside homes, townhouses, and inlet-side properties. Extended coverage with route confirmation.",
  },
  {
    slug: "surrey",
    name: "Surrey",
    region: "Metro Vancouver",
    deEmphasized: true,
    headline: "From Guildford malls to South Surrey lanes.",
    summary:
      "Extended coverage across one of Metro Vancouver's largest municipalities.",
    description:
      "Surrey covers a wide geography — dense townhouse rows in Newton, newer builds in South Surrey, and commercial strips near Guildford. A job in Whalley presents different access than a property in Cloverdale. Extended coverage means we review your postal code, photos, and load size before confirming a route and time window.",
    useCases: [
      "Townhouse garage cleanouts in Newton and Fleetwood",
      "Move-out loads in South Surrey and Cloverdale",
      "Retail backroom and storage overflow near Guildford",
      "Construction and renovation cleanup on new builds",
    ],
    neighborhoods: [
      "Guildford",
      "Newton",
      "Fleetwood",
      "Cloverdale",
      "South Surrey",
      "Whalley",
    ],
    relatedLocationSlugs: ["delta", "langley", "new-westminster"],
    seoTitle: "Junk Removal Surrey",
    seoDescription:
      "Junk removal in Surrey from Guildford to South Surrey. Extended coverage sized from your postal code and photos.",
  },
  {
    slug: "delta",
    name: "Delta",
    region: "Metro Vancouver",
    deEmphasized: true,
    headline: "North Delta, Ladner, and Tsawwassen cleanouts.",
    summary:
      "Extended coverage for river communities, ferry-corridor homes, and North Delta neighbourhoods.",
    description:
      "Delta is three distinct communities in one municipality. North Delta townhouses differ from Ladner village lots and Tsawwassen properties near the ferry terminal. Longer drive times and ferry-corridor traffic make scheduling especially important here — we confirm extended availability before booking.",
    useCases: [
      "Townhouse storage cleanouts in North Delta and Sunshine Hills",
      "Garage and shed clears in Ladner village",
      "Move-out loads near Tsawwassen ferry corridor",
      "Yard debris and renovation cleanup on larger Delta lots",
    ],
    neighborhoods: [
      "North Delta",
      "Ladner",
      "Tsawwassen",
      "Sunshine Hills",
      "Boundary Bay",
    ],
    relatedLocationSlugs: ["richmond", "surrey", "langley"],
    seoTitle: "Junk Removal Delta",
    seoDescription:
      "Junk removal in Delta, Ladner, and Tsawwassen. Extended coverage for North Delta townhouses and South Delta homes.",
  },
  {
    slug: "langley",
    name: "Langley",
    region: "Metro Vancouver",
    deEmphasized: true,
    headline: "City lots to Township acreages.",
    summary:
      "Extended coverage for Langley City, Willoughby, Walnut Grove, and Aldergrove.",
    description:
      "Langley spans compact city lots, fast-growing Willoughby subdivisions, and larger Township properties toward Aldergrove. Extended coverage jobs here often involve longer drive times from the North Shore base, so we confirm route fit and load size before scheduling — especially for barn, shop, or acreage cleanouts.",
    useCases: [
      "Garage and shop cleanouts in Langley City and Brookswood",
      "Move-out loads from Willoughby and Walnut Grove townhouses",
      "Yard debris and outdoor storage clears on larger Township lots",
      "Renovation leftover from home improvement projects",
    ],
    neighborhoods: [
      "Langley City",
      "Willoughby",
      "Walnut Grove",
      "Aldergrove",
      "Brookswood",
    ],
    relatedLocationSlugs: ["surrey", "maple-ridge", "delta"],
    seoTitle: "Junk Removal Langley",
    seoDescription:
      "Junk removal in Langley City and Township. Extended coverage from Willoughby to Aldergrove with route confirmation.",
  },
  {
    slug: "maple-ridge",
    name: "Maple Ridge",
    region: "Metro Vancouver",
    deEmphasized: true,
    headline: "Garage, shop, and rural-edge cleanouts.",
    summary:
      "Extended coverage for Haney, Albion, and Maple Ridge properties along the urban edge.",
    description:
      "Maple Ridge properties often include oversized garages, workshop buildup, and renovation debris from homes along the urban-rural transition. Access roads in Silver Valley and Whonnock can be narrower than inner Metro Vancouver. We confirm extended coverage from your postal code before dispatching from the North Shore.",
    useCases: [
      "Oversized garage and shop cleanouts in Haney and Hammond",
      "Renovation debris from Albion and Silver Valley homes",
      "Downsizing loads from established Maple Ridge neighbourhoods",
      "Yard and outdoor storage clears on larger properties",
    ],
    neighborhoods: [
      "Haney",
      "Albion",
      "Silver Valley",
      "Whonnock",
      "Hammond",
    ],
    relatedLocationSlugs: ["port-coquitlam", "langley", "coquitlam"],
    seoTitle: "Junk Removal Maple Ridge",
    seoDescription:
      "Junk removal in Maple Ridge for garages, shops, and home cleanouts. Extended coverage from Haney to Albion.",
  },
];

/**
 * Location pages we still point search engines at. The de-emphasized remote
 * cities stay reachable by URL but are dropped from the sitemap and from
 * site-wide link lists, so link them from here rather than from `locations`.
 */
export const indexedLocations = locations.filter(
  (location) => !location.deEmphasized,
);

export function getLocation(slug: string) {
  return locations.find((location) => location.slug === slug);
}
