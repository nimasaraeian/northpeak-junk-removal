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
      "Junk removal in West Vancouver from a local North Shore crew. Free estimates, discreet service, donation-first sorting — Ambleside to Horseshoe Bay.",
    body: [
      {
        type: "callout",
        label: "Quick answer",
        text: "NorthPeak provides same-week junk removal across West Vancouver — single items from roughly $99, full loads roughly $649–$799 in the 2026 market. Estimates are free and quoted from photos. We are based ten minutes away on West Keith Rd in North Vancouver, which is why West Van jobs are routinely next-day, and why we already know which driveways a loaded truck can turn around in.",
      },
      { type: "heading", text: "What junk removal services do you offer in West Vancouver?" },
      { type: "paragraph", text: "The same lines we run everywhere, weighted differently here. West Vancouver work skews toward whole-property jobs rather than single loads: estates, downsizing, renovation clear-outs and listing preparation." },
      {
        type: "list",
        items: [
          "[Estate cleanouts](/services/estate-cleanout) — the most common large job in this municipality, staged over days with itemized invoices and donation receipts for the executor's file.",
          "[Furniture removal](/services/furniture-removal) — from single statement pieces to a full house of furniture before staging, with floors and finishes protected on the way out.",
          "[Garage cleanouts](/services/garage-cleanout) — often a three-car garage on a sloped lot, which is a different job from a flat single bay.",
          "[Construction debris](/services/construction-cleanup) — kitchen and bath remodels are constant here, and the dense material is quoted by weight rather than volume.",
          "[Commercial cleanouts](/services/commercial-cleanout) — offices and retail along Marine Drive and in Park Royal's surrounding blocks.",
          "[Appliance and general removal](/services/junk-removal) — mixed loads from a house that is being emptied rather than tidied.",
        ],
      },
      { type: "paragraph", text: "The full [services hub](/services) lists every line. For most West Van properties the question is not which category applies but how many days the work takes." },
      { type: "heading", text: "How much does junk removal cost in West Vancouver?" },
      { type: "paragraph", text: "Identical pricing to the rest of the North Shore — there is no postcode premium. Single items and minimum loads run roughly $99–150, a half truck roughly $300–500, a full truck roughly $649–799 for a typical household load. Heavy renovation material is quoted by weight on top. Whole-property estate work is quoted as a project rather than by the truckload, because it runs across several days." },
      { type: "paragraph", text: "The complete breakdown of every load fraction is in our [junk removal cost guide](/blog/junk-removal-cost-north-vancouver), and what clearing an entire house involves is set out in the [estate cleanout guide](/blog/estate-cleanout-north-vancouver)." },
      { type: "heading", text: "Which West Vancouver neighbourhoods do you serve?" },
      { type: "paragraph", text: "All of them, from the Capilano boundary to Horseshoe Bay. Ambleside and Dundarave bring condo move-outs and downsizing loads with tight lane access behind Marine Drive. The British Properties and Chartwell bring large homes on long, steep driveways where the practical question is whether a loaded truck can turn around at the top or has to reverse the whole way down. Caulfeild and Cypress Park sit on wooded lots where the carry from house to road is often longer than the drive across the bridge. Horseshoe Bay adds ferry-corridor traffic, which is a scheduling problem rather than an access one — we plan around the sailings instead of sitting in them." },
      { type: "paragraph", text: "We also serve [North Vancouver](/locations/north-vancouver), [Vancouver](/locations/vancouver) and [Burnaby](/locations/burnaby) on the same schedule and the same pricing." },
      { type: "heading", text: "How discreet is the service?" },
      { type: "paragraph", text: "As discreet as the job needs. A good part of our West Vancouver work happens while a house is being listed, while a family is managing an estate, or while someone is moving into care — none of which anyone wants announced to the street. That means an unmarked arrival time rather than an all-day presence, no staging of items on the front lawn, protection on floors and door frames before anything moves, and a crew that does not discuss the job outside it. If your strata, your neighbours or your realtor need to be notified, tell us and we will work to their window." },
      { type: "heading", text: "How fast can you pick up junk in West Vancouver?" },
      { type: "paragraph", text: "Same week reliably, next day often. The yard is on West Keith Rd, so West Vancouver is a short first run rather than a trip across the region, and morning windows are the norm. We confirm the window by text the day before and again when the crew is on the way. Whole-property work is the exception and is scheduled as a block of days against your deadline — a completion date, a listing, or a probate timeline." },
      { type: "heading", text: "What happens to the contents?" },
      { type: "paragraph", text: "Reuse and recycle first, landfill last. Usable furniture, housewares, tools, books and clothing go to local North Shore charities and thrift partners when condition allows — and in West Vancouver homes that is a meaningful share of what comes out. Metal, wood, cardboard and electronics are separated into their own streams. What genuinely cannot be reused goes to the North Shore Recycling & Waste Centre, weighed and billed by the tonne, with that fee already inside your quote. Where something looks like it may have real resale value, we say so rather than remove it." },
      { type: "paragraph", text: "Hazardous material — paint, solvents, fuel, propane, pool chemicals — needs a dedicated depot and cannot ride in the truck. Send a photo and we will name the right one." },
      { type: "cta", label: "Get My Free Estimate →", href: "/estimate" },
    ],
    faqs: [
      {
        question: "Do you offer free estimates in West Vancouver?",
        answer:
          "Yes, free and with no obligation. Send your postal code, a short description and a few photos through the estimate form and a clear range comes back, usually within hours. We confirm that range on arrival before any work begins, and the figure you approve is the figure you pay.",
      },
      {
        question: "Can your truck handle a steep British Properties driveway?",
        answer:
          "Usually yes, and we confirm it from photos before booking rather than discovering it at the top. What matters is the turnaround space at the house and the gradient at the entrance. Send a picture looking up the driveway and one looking back down, and we will tell you honestly.",
      },
      {
        question: "Do you do discreet removals during a home sale?",
        answer:
          "Yes, and it is common work here. We use a defined arrival window rather than an all-day presence, stage nothing on the front lawn, and protect floors and door frames before anything moves. If your realtor has a showing schedule, give it to us and the crew works inside it.",
      },
      {
        question: "Are you licensed and insured?",
        answer:
          "Yes. NorthPeak is a fully insured local crew based in North Vancouver, and we provide proof of insurance whenever a strata, building manager or property manager requires it before a job. Ask at booking and the paperwork is filed before the crew arrives rather than at the door.",
      },
      {
        question: "Is West Vancouver more expensive than North Vancouver?",
        answer:
          "No. Pricing is identical across the North Shore — same volume bands, same weight rules, no postcode premium. The only things that move a quote are load size, access and heavy material, exactly as they would anywhere else. Whole-property estate work is quoted as a project rather than per load.",
      },
    ],
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
      "Junk removal in Vancouver from a local crew. Free estimates, same-week pickup, donation-first sorting. Condos, houses and commercial suites citywide.",
    body: [
      {
        type: "callout",
        label: "Quick answer",
        text: "NorthPeak provides same-week junk removal across the City of Vancouver — single items from roughly $99, full loads roughly $649–$799 in the 2026 market, with free photo-based estimates. Vancouver jobs are booked by corridor rather than at random, so the truck is already in your part of the city on the day. Condo elevator bookings, lane access and loading-bay windows are arranged before the date, not negotiated at the door.",
      },
      { type: "heading", text: "What junk removal services do you offer in Vancouver?" },
      { type: "paragraph", text: "Vancouver's housing stock is the widest we work in — downtown towers, Kitsilano character houses, East Van laneway homes, Kerrisdale family properties and commercial suites in between — so the job types are correspondingly broad." },
      {
        type: "list",
        items: [
          "[Furniture removal](/services/furniture-removal) — the most common single booking here, usually a sofa or bedroom suite out of a condo with a booked freight elevator.",
          "[Junk removal](/services/junk-removal) — mixed household loads from move-outs, tenant turnovers and basements in older character homes.",
          "[Commercial cleanouts](/services/commercial-cleanout) — office suites, retail units and end-of-lease decommissions, scheduled after hours where the building requires it.",
          "[Construction debris](/services/construction-cleanup) — renovation material from the kitchen and bath remodels that run constantly across the city's pre-war stock.",
          "[Estate cleanouts](/services/estate-cleanout) — whole-property clearing for executors and families, staged across days.",
          "[Garage cleanouts](/services/garage-cleanout) — including the detached garages and laneway structures common east of Main.",
        ],
      },
      { type: "paragraph", text: "Everything we run is on the [services hub](/services)." },
      { type: "heading", text: "How much does junk removal cost in Vancouver?" },
      { type: "paragraph", text: "By volume, the same as everywhere: roughly $99–150 for a single item or minimum load, roughly $300–500 for a half truck, roughly $649–799 for a full truck of typical household material. Concrete, tile, soil and shingles are quoted by weight on top. The one Vancouver-specific factor is access — a fourth-floor walk-up in Mount Pleasant costs more crew time than a driveway in Dunbar, and photos are what capture that before we quote rather than after." },
      { type: "paragraph", text: "The complete price table, including what each truck fraction actually holds, is in our [junk removal cost guide](/blog/junk-removal-cost-north-vancouver). Mattresses carry a per-unit recycling fee anywhere in Metro Vancouver, and the [mattress disposal guide](/blog/how-to-get-rid-of-mattress-vancouver) covers every option including the city's own." },
      { type: "heading", text: "Which Vancouver neighbourhoods do you serve?" },
      { type: "paragraph", text: "The whole city. Downtown, Yaletown and Coal Harbour mean concierge desks, timed loading bays and freight elevators booked days ahead. Kitsilano, Mount Pleasant and Fairview mean walk-up apartments and character conversions where the stairwell decides the job. East Vancouver — Commercial Drive, Hastings-Sunrise, Renfrew — means lane access, detached garages and laneway houses, which are usually the easiest load-outs in the city once we know which lane to enter from. Kerrisdale, Dunbar, Shaughnessy and Point Grey mean larger homes with basements and long carries. UBC and the Endowment Lands add campus housing rules and their own parking regime." },
      { type: "paragraph", text: "Across the bridges we serve [North Vancouver](/locations/north-vancouver), [West Vancouver](/locations/west-vancouver) and [Burnaby](/locations/burnaby) on the same terms." },
      { type: "heading", text: "How do you handle condo and apartment access?" },
      { type: "paragraph", text: "As a booking problem, because that is what it is. Most Vancouver buildings require a freight elevator reservation made through the concierge or property manager, usually a few days ahead. Many allocate the loading bay in one-hour blocks. A good number require a certificate of insurance on file before a crew is allowed up, and some require padded protection in the elevator car and covering in the lobby. We arrange all of it once you tell us the building." },
      { type: "paragraph", text: "For houses, the equivalent constraint is the lane. Vancouver lanes vary from comfortable to impassable, and a loaded truck that cannot exit the way it entered turns a two-hour job into an afternoon. A photo of the lane and the gate settles it before we book." },
      { type: "heading", text: "How fast can you pick up junk in Vancouver?" },
      { type: "paragraph", text: "Same week across the city, and often sooner in the corridors we are already running that day. Vancouver is booked by route rather than one job at a time, which is what keeps arrival windows tight and prices flat — a crew crossing the city twice is a cost somebody pays. Morning windows are standard, confirmed by text the day before and again when the crew is on the way." },
      { type: "heading", text: "Where does the junk go?" },
      { type: "paragraph", text: "Reuse and recycle first, landfill last. Usable furniture, housewares, tools and clothing go to charities and thrift partners when condition allows. Metal, wood, cardboard and electronics are separated. What remains is taken to a transfer facility, weighed and billed by the tonne, with the fee already inside your quote. We publish no diversion percentage, because an honest one would have to be measured load by load — what we will do is tell you before the job what we expect to divert from your pile. Paint, solvents, fuel and propane need dedicated depots and cannot ride in the truck." },
      { type: "cta", label: "Get My Free Estimate →", href: "/estimate" },
    ],
    faqs: [
      {
        question: "Do you offer free estimates in Vancouver?",
        answer:
          "Yes, free and without obligation. Send your postal code, a short description and photos of the load through the estimate form, and a clear range comes back, usually within hours. We confirm it on arrival before anything is touched, and the figure you approve is the figure you pay.",
      },
      {
        question: "Can you remove furniture from a downtown tower?",
        answer:
          "Yes, and it is routine work. Tell us the building and we arrange the freight elevator reservation, the loading bay window and any certificate of insurance the property manager requires. Elevator car and lobby protection go in before the first piece moves, which is what concierge desks actually check.",
      },
      {
        question: "Do you take single items in Vancouver?",
        answer:
          "Yes. One sofa, one mattress, one fridge is a normal booking and prices as a minimum load, roughly $99 to $150 in the current market including lifting, hauling and disposal fees. Stairs or a walk-up can move it slightly, so a photo of the route settles the number first.",
      },
      {
        question: "Are you licensed and insured?",
        answer:
          "Yes. NorthPeak is a fully insured local crew, and we supply proof of insurance whenever a building manager, strata or property manager asks for it before a job. Request it when you book and the paperwork is on file before the crew arrives rather than sorted out in the lobby.",
      },
      {
        question: "How quickly can you get to my part of the city?",
        answer:
          "Same week reliably, and often sooner if we are already running your corridor that day. Vancouver is scheduled by route rather than job by job, which keeps arrival windows tight. Send photos early and we will tell you honestly what is open this week.",
      },
    ],
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
      "Junk removal in Burnaby from a local crew. Free estimates, same-week pickup, donation-first sorting. Strata, townhouse and commercial loads citywide.",
    body: [
      {
        type: "callout",
        label: "Quick answer",
        text: "NorthPeak provides same-week junk removal across Burnaby — single items from roughly $99, full loads roughly $649–$799 in the 2026 market, with free photo-based estimates. Most Burnaby work is strata work, so the elevator booking, the loading dock window and the certificate of insurance are arranged before the date. Underground parkade clearance is the one constraint worth checking early, and we check it from your photos rather than at the ramp.",
      },
      { type: "heading", text: "What junk removal services do you offer in Burnaby?" },
      { type: "paragraph", text: "Burnaby splits cleanly into three kinds of job: high-rise strata, townhouse complexes, and commercial bays along the major corridors. The service lines follow." },
      {
        type: "list",
        items: [
          "[Furniture removal](/services/furniture-removal) — move-out loads from Metrotown and Brentwood towers, almost always through a booked freight elevator.",
          "[Garage cleanouts](/services/garage-cleanout) — townhouse garages, which are narrower than detached ones and usually hold more than they look like they do.",
          "[Junk removal](/services/junk-removal) — mixed household loads, storage lockers and basement clears.",
          "[Commercial cleanouts](/services/commercial-cleanout) — retail and office units along Kingsway, Canada Way and the Still Creek corridor.",
          "[Construction debris](/services/construction-cleanup) — kitchen, bath and flooring renovation material, quoted by weight where it is dense.",
          "[Estate cleanouts](/services/estate-cleanout) — whole-property clearing, staged across days with documentation for the estate file.",
        ],
      },
      { type: "paragraph", text: "The [services hub](/services) lists them all." },
      { type: "heading", text: "How much does junk removal cost in Burnaby?" },
      { type: "paragraph", text: "The same volume pricing as the rest of Metro Vancouver: roughly $99–150 for a single item, roughly $300–500 for a half truck, roughly $649–799 for a full truck of household material, with dense renovation waste quoted by weight on top. In strata buildings the variable that actually moves a Burnaby quote is not distance — it is carry length. A unit at the far end of a floor with a long corridor to the elevator costs more crew time than a townhouse with the garage at the curb, and photos capture that in advance." },
      { type: "paragraph", text: "Every load fraction and what changes it is in our [junk removal cost guide](/blog/junk-removal-cost-north-vancouver). If the job is a garage, the [garage cleanout cost guide](/blog/garage-cleanout-north-vancouver-cost) prices that one specifically." },
      { type: "heading", text: "Which Burnaby neighbourhoods do you serve?" },
      { type: "paragraph", text: "All of them. Metrotown and Brentwood are dense high-rise strata, where the work is scheduled around elevator bookings and dock windows rather than around traffic. Burnaby Heights is older detached housing with lane access and basements. Deer Lake and Buckingham Heights mean larger lots and longer carries. Highgate and Edmonds are a mix of towers and townhouse complexes. Big Bend and the Still Creek corridor are commercial and industrial, where the constraint is usually the bay rather than the building. Capitol Hill and Montecito bring sloped streets and driveways worth checking before the truck arrives." },
      { type: "paragraph", text: "We also serve [Vancouver](/locations/vancouver), [North Vancouver](/locations/north-vancouver) and [West Vancouver](/locations/west-vancouver)." },
      { type: "heading", text: "How do strata rules affect a Burnaby move-out?" },
      { type: "paragraph", text: "More than anything else about the job. Most Burnaby strata buildings require the freight elevator to be booked — often days ahead and frequently with a deposit held by the council — and will not allow a removal crew up without it. Many require a certificate of insurance on file first. Loading docks are commonly allocated in fixed windows, and several buildings prohibit moves entirely on Sundays or statutory holidays." },
      { type: "paragraph", text: "The constraint people forget is height. Underground parkade clearance in Burnaby towers is frequently under two metres, which means the truck stays at the loading dock or on the street and the carry runs from there. It changes the crew time, so it belongs in the quote — tell us the building and we check it before the date rather than finding out at the ramp." },
      { type: "heading", text: "How fast can you pick up junk in Burnaby?" },
      { type: "paragraph", text: "Same week reliably. Burnaby is scheduled by corridor alongside our Vancouver routes, so the truck is already on that side of the region on the day rather than making a dedicated trip. Morning windows are standard and confirmed by text the day before. Strata bookings are the one thing that can set the pace instead of us: if the building's next available elevator slot is Thursday, Thursday is the job." },
      { type: "heading", text: "What happens to what we remove?" },
      { type: "paragraph", text: "Reuse and recycle first, landfill last. Usable furniture, housewares, tools and clothing are routed to charities and thrift partners where condition allows. Metal, wood, cardboard and electronics go to their own recycling streams. The remainder goes to a transfer facility, weighed and billed by the tonne, with that fee already inside the quoted range. Hazardous material — paint, solvents, fuel, propane — needs a dedicated depot and cannot go in the truck; send a photo and we will tell you which one takes it." },
      { type: "cta", label: "Get My Free Estimate →", href: "/estimate" },
    ],
    faqs: [
      {
        question: "Do you offer free estimates in Burnaby?",
        answer:
          "Yes, free and with no obligation. Send your postal code, a short description and photos through the estimate form and a clear range comes back, usually within hours. We confirm that range on arrival before any work starts, and the number you approve is the number you pay.",
      },
      {
        question: "Do you handle strata elevator bookings?",
        answer:
          "Yes. Tell us the building and we arrange the freight elevator reservation, the loading dock window and any certificate of insurance the strata council requires, before the date. Many Burnaby buildings need days of notice and hold a deposit, so booking early matters more here than almost anywhere.",
      },
      {
        question: "Will your truck fit in our underground parkade?",
        answer:
          "Often not, and that is normal rather than a problem. Parkade clearance in Burnaby towers is frequently under two metres, so the truck stays at the loading dock or on the street and the crew carries from there. We check the building in advance so the extra carry is in the quote.",
      },
      {
        question: "Are you licensed and insured?",
        answer:
          "Yes. NorthPeak is a fully insured local crew, and we provide proof of insurance whenever a strata council, building manager or property manager requires it before a job. Ask when you book and the certificate is on file before the crew arrives rather than sorted out at the door.",
      },
      {
        question: "Do you charge more for Burnaby than for North Vancouver?",
        answer:
          "No. Pricing is identical across every area we serve — same volume bands, same weight rules for dense material, no distance surcharge. What moves a Burnaby quote is carry length and building access, which photos capture in advance, not the postcode on the address.",
      },
    ],
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
