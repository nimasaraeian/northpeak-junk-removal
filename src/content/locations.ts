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
      "Junk removal in North Vancouver from a local crew on West Keith Rd. Free estimates, same-week pickup, donation-first sorting. Single items from $99.",
    body: [
      {
        type: "callout",
        label: "Quick answer",
        text: "NorthPeak provides same-week junk removal across North Vancouver — single items from roughly $99, full loads roughly $649–$799 in the 2026 market. Estimates are free and given upfront from your photos, loads are sorted donation-first, and the crew is local: we are based on West Keith Rd, not dispatched from a call centre in another city.",
      },

      { type: "heading", text: "What junk removal services do you offer in North Vancouver?" },
      { type: "paragraph", text: "Almost every job in this city falls into one of a handful of shapes, and all of them price the same way — by the share of the truck your load fills, agreed before we start." },
      {
        type: "list",
        items: [
          "[Furniture removal](/services/furniture-removal) — sofas, sectionals, bed frames, dressers and desks carried down a stairwell or out through a booked freight elevator. Pieces still worth using are kept separate from the rest of the load.",
          "[Garage cleanouts](/services/garage-cleanout) — the standard Lynn Valley and Upper Lonsdale job: paint cans, old bikes, patio furniture, and boxes nobody has opened since the move in.",
          "[Estate cleanouts](/services/estate-cleanout) — whole-home clearing for executors and families, staged room by room, with an itemized invoice and donation receipts where our partner charities issue them.",
          "[Construction debris](/services/construction-cleanup) — drywall, tile, flooring offcuts and framing scrap from kitchen and bath renovations. Heavy material is quoted by weight, because that is how the disposal sites bill it.",
          "[Commercial cleanouts](/services/commercial-cleanout) — office furniture, retail fixtures and back-room overflow along Marine Drive and Central Lonsdale, scheduled outside business hours when the building requires it.",
          "[Mattress and box spring removal](/services/furniture-removal) — the same crew and the same pricing as any other bulky piece. Every mattress carries a per-unit recycling fee anywhere in Metro Vancouver; our [mattress disposal guide](/blog/how-to-get-rid-of-mattress-vancouver) walks through each option and what it costs.",
          "[Appliance removal](/services/junk-removal) — fridges, washers, dryers and stoves, part of the general junk removal line. Sealed-unit appliances go to the correct recycling stream rather than the landfill.",
        ],
      },
      { type: "paragraph", text: "If your job does not match any of those neatly, it probably still fits: the [services hub](/services) lists every line we run, and a few photos of the pile settle the question faster than a category ever will." },

      { type: "heading", text: "How much does junk removal cost in North Vancouver?" },
      { type: "paragraph", text: "Price follows volume. In the 2026 market, a single item or minimum load runs roughly $99–150. A half truck — about what one packed single garage holds — lands around $300–500. A full truck for a typical household clear-out is roughly $649–799. Heavy material such as concrete, soil, tile and shingles is quoted by weight on top of that, because disposal facilities charge it by the tonne." },
      { type: "paragraph", text: "Those are market ranges, not quotes. The honest number for your load comes from photos: send them through the estimate form and you will have a firm range back, usually within hours. We confirm that range on arrival before anyone lifts anything, and the figure you approve is the figure you pay. For the full picture — every load fraction, what pushes the price up or down, and the legitimate ways to pay less — read our [North Vancouver junk removal cost guide](/blog/junk-removal-cost-north-vancouver). If the job is specifically a garage, the [garage cleanout cost guide](/blog/garage-cleanout-north-vancouver-cost) prices that one on its own." },

      { type: "heading", text: "Which North Vancouver neighbourhoods do you serve?" },
      { type: "paragraph", text: "All of them — City and District alike. In a normal week we are in Lower Lonsdale and Central Lonsdale for condo move-outs, up in Lynn Valley and Blueridge for basement and garage clear-outs, out to Deep Cove and Seymour for houses with long driveways and steep side yards, and across Capilano, Pemberton Heights, Norgate and Grand Boulevard for everything in between. Each corner of the city has its own access problem. The Lonsdale towers mean a booked freight elevator and a timed loading bay. Deep Cove and Seymour mean narrow lanes with nowhere to turn a truck around. The older Grand Boulevard and Pemberton Heights houses mean back-lane access and basement stairs that were never built with a sectional in mind. Norgate and Capilano usually come down to driveway width and whether the side gate opens wide enough. We confirm parking and access from your photos before the truck leaves the yard, which is why our arrival times hold." },
      { type: "paragraph", text: "We also work across the bridges: [West Vancouver](/locations/west-vancouver), [Vancouver](/locations/vancouver) and [Burnaby](/locations/burnaby) are all core service areas on the same schedule and the same pricing. And if you are unsure which side of the City and District line your address sits on, it makes no difference to the price or the timing — the postal-code check on this page confirms availability either way." },

      { type: "heading", text: "How fast can you pick up junk in North Vancouver?" },
      { type: "paragraph", text: "Same week is the normal answer, and next day is common — North Vancouver is our home market, so the truck is already on this side of the water most mornings. Arrival windows start in the morning, which is deliberate: a morning slot leaves room to finish a load that turns out bigger than the photos suggested, rather than pushing it to another day. We confirm your window by text the day before and text again when the crew is on the way, so you are not holding an entire afternoon open on a guess. Whole-home and estate work is the exception — that is staged across several days rather than one visit, and the [estate cleanout guide](/blog/estate-cleanout-north-vancouver) sets out how those days are planned." },
      { type: "paragraph", text: "The slots that fill first are Saturday mornings in spring and fall, which is moving and renovation season on the North Shore. If your date is fixed by a completion, a strata move-out window or a tenant turnover, say so when you send the photos rather than after you have approved the range — we would rather hold the window while we quote than find out it is gone once you book." },

      { type: "heading", text: "What happens to the junk you haul?" },
      { type: "paragraph", text: "Reuse and recycle first, landfill last. Before anything is loaded for disposal, the crew pulls out what still has life in it: usable furniture, housewares, tools, clothing and unopened household goods go to local North Shore charities and thrift partners when condition allows. Metal, wood, cardboard and electronics are separated into their own recycling streams. What genuinely cannot be reused or recycled goes to the North Shore Recycling & Waste Centre here in North Vancouver, where loads are weighed and charged by the tonne." },
      { type: "paragraph", text: "We do not publish a diversion percentage, because an honest one would have to be measured load by load and no two loads are alike. What we will do is tell you, before the job, what we expect to be able to divert from the pile in front of us — and tell you plainly when the answer is not much. Hazardous material such as paint, solvents, fuel and propane needs a dedicated depot and cannot ride in the truck; send a photo and we will point you at the right one." },

      { type: "heading", text: "Why choose a local North Vancouver crew?" },
      { type: "paragraph", text: "We are based at 564 West Keith Rd, a few minutes from the Lonsdale corridor. That is not a marketing detail — it decides how the day runs. We know which lanes off Lonsdale are too tight for a loaded truck, which Lower Lonsdale buildings insist on a booked elevator and a certificate of insurance before the crew comes up, which back alleys in Grand Boulevard are passable after a wet week, and where you can legally park a truck on a Deep Cove street without blocking someone in." },
      { type: "paragraph", text: "The other part is who answers. There is no franchise call centre between you and the people doing the work: the estimate you get is written by someone who will be on the job, which is why the range holds and why nobody needs to “re-quote” on your driveway. If something on site is different from the photos, we say so on the spot and tell you what it changes before we touch it. Being ten minutes away also means a second visit is a small thing: if a basement turns out to hold more than one truck, we come back rather than leaving half of it against a wall." },

      { type: "cta", label: "Get My Free Estimate →", href: "/estimate" },
    ],
    faqs: [
      {
        question: "Do you offer free estimates in North Vancouver?",
        answer:
          "Yes. Estimates are free and carry no obligation. Send your postal code, a short description, and a few photos of the space through the estimate form, and we reply with a clear price range, usually within hours. We confirm that range on arrival before any work begins.",
      },
      {
        question: "Can you remove junk from condos and apartments with elevators?",
        answer:
          "Yes, and it is routine work in Lower Lonsdale and Central Lonsdale. Tell us the building and we handle the booking side: freight elevator reservation, loading bay window, and any certificate of insurance your strata asks for. Floors, walls, and common areas are protected before the first item moves.",
      },
      {
        question: "Do you take single items like one couch or mattress?",
        answer:
          "Yes. A single sofa, mattress, fridge, or washer is priced as a minimum load, roughly $99 to $150 in the current market, including the lifting, hauling, and disposal fees. Stairs or tight access can move that slightly, so send a photo and we will confirm before you book.",
      },
      {
        question: "Are you licensed and insured?",
        answer:
          "Yes. NorthPeak is a fully insured local crew operating out of North Vancouver, and we provide proof of insurance whenever a strata, building manager, or property manager asks for it before a job. Request it at booking and we will have the paperwork ready before the crew arrives.",
      },
      {
        question: "Do you serve West Vancouver too?",
        answer:
          "Yes. West Vancouver is a core service area on the same schedule and the same pricing as North Vancouver, from Ambleside and Dundarave through Caulfeild and the British Properties. Vancouver and Burnaby are also core areas. Enter your postal code above and it will confirm availability instantly.",
      },
    ],
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
