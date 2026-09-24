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
    seoTitle: "Full-Service Junk Removal",
    seoDescription:
      "Professional junk removal in North Vancouver and Greater Vancouver. Transparent estimates, careful crews, and responsible disposal from NorthPeak.",
    relatedSlugs: ["furniture-removal", "garage-cleanout", "estate-cleanout"],
    body: [
      {
        type: "callout",
        label: "Quick answer",
        text: "Full-service junk removal means our crew does everything: we come to where the items sit, carry them out, load, haul and dispose. In the 2026 Metro Vancouver market a single item runs roughly $99–150 and a full truck roughly $649–1,000, priced by the share of the truck your load fills. Estimates are free and quoted from photos, most North Shore jobs run same-week, and loads are sorted for donation and recycling before anything goes to disposal.",
      },
      { type: "heading", text: "What does full-service junk removal include?" },
      { type: "paragraph", text: "Everything between the pile and the disposal facility. You do not carry anything to the curb, disassemble anything, or rent anything. The crew comes to the room the items are in — the basement, the third-floor walk-up, the back of the garage — takes them apart if they will not fit through the door, carries them out, loads the truck, sweeps the cleared area, and hauls the load away. The quoted price covers the labour, the truck, the fuel, and the dump and recycling fees paid at the other end." },
      { type: "paragraph", text: "That is the difference between this and a bin rental, which is the other way people clear a space in Vancouver. A bin sits on your driveway for a week and you fill it yourself; it wins for a slow renovation where debris accumulates daily. Full-service wins when the lifting is the hard part, when the job should take hours rather than weekends, or when the load contains things a bin will not take. The [cost guide](/blog/junk-removal-cost-north-vancouver) compares the two on real numbers." },
      { type: "heading", text: "How much does junk removal cost in Vancouver?" },
      { type: "paragraph", text: "Price follows volume — the fraction of the truck your load fills — with weight as a second factor for heavy material. A single item or minimum load is roughly $99–150. A quarter truck, about a packed closet, is roughly $200–300. A half truck, about one full single garage, is roughly $300–500. A full truck is roughly $649–1,000 depending on what is in it. Concrete, soil, tile and shingles are quoted by weight on top, because disposal facilities bill them by the tonne." },
      { type: "paragraph", text: "Those are market ranges. The number for your load comes from photos: send them through the estimate form and a firm range comes back, usually within hours. We confirm it on arrival before anything is touched, and the figure you approve is the figure you pay. The full breakdown of every load fraction and what moves it lives in our [North Vancouver junk removal cost guide](/blog/junk-removal-cost-north-vancouver)." },
      { type: "heading", text: "What can you take — and what can't you?" },
      { type: "paragraph", text: "Almost everything a household or small business generates: furniture, mattresses, appliances, electronics, garage and basement storage, yard waste, renovation debris, office furniture, retail fixtures, and the mixed piles that come out of a move. If it fits through the door and two people can carry it, it goes." },
      {
        type: "list",
        items: [
          "Hazardous material is the firm exception: paint, solvents, fuel, propane, pool chemicals and certain batteries need dedicated depots and cannot ride in the truck. Send a photo and we will tell you which depot takes it.",
          "Some items carry their own disposal surcharge wherever they go — mattresses and box springs carry a per-unit recycling fee anywhere in Metro Vancouver, and it is inside the quote rather than added later.",
          "Sealed-unit appliances (fridges, freezers, air conditioners) go to the recycling stream that handles their refrigerant, not to the landfill.",
          "Heavy renovation material is welcome but priced by weight, so it is quoted separately from the volume-based part of the load.",
        ],
      },
      { type: "heading", text: "How quickly can you come?" },
      { type: "paragraph", text: "Same-week is normal across the North Shore and much of Vancouver, and next-day is common in [North Vancouver](/locations/north-vancouver) and [West Vancouver](/locations/west-vancouver), where the truck already starts its day. Arrival windows begin in the morning on purpose: a morning slot leaves room for a load that turns out bigger than the photos suggested, instead of pushing it to another day. We confirm your window by text the day before and again when the crew is on the way." },
      { type: "heading", text: "Where does the junk actually go?" },
      { type: "paragraph", text: "Reuse and recycle first, landfill last. Before anything is loaded for disposal the crew pulls out what still has life in it — usable furniture, housewares, tools and clothing go to local charities and thrift partners when condition allows. Metal, wood, cardboard and electronics are separated into their own streams. Only the remainder goes to the North Shore Recycling & Waste Centre, where it is weighed and charged by the tonne. We publish no diversion percentage, because an honest one would have to be measured load by load; what we will do is tell you before the job what we expect to divert from the pile in front of us." },
      { type: "paragraph", text: "If your job is more specific than a mixed load, we run dedicated lines for it: [furniture removal](/services/furniture-removal), [garage cleanouts](/services/garage-cleanout), [estate cleanouts](/services/estate-cleanout), [construction debris](/services/construction-cleanup) and [commercial cleanouts](/services/commercial-cleanout)." },
      { type: "cta", label: "Get My Free Estimate →", href: "/estimate" },
    ],
    faqs: [
      {
        question: "Do I need to move everything outside before you arrive?",
        answer:
          "No. Full-service means we come to wherever the items are — the basement, a back bedroom, the far corner of the garage — and carry them out ourselves. Leaving things where they sit is genuinely fine, and it lets us protect floors and doorways on the way through.",
      },
      {
        question: "How is the price decided?",
        answer:
          "By volume: the share of the truck your load fills, quoted from photos before we arrive. Heavy material like concrete, soil and tile is quoted by weight on top, because disposal sites bill it that way. We confirm the range on arrival before touching anything, and it does not change afterwards.",
      },
      {
        question: "Can you do same-day junk removal?",
        answer:
          "Sometimes, depending on the day's route and how full the truck already is. Same-week is the reliable answer across the North Shore and Vancouver, and next-day is common in North Vancouver and West Vancouver. Send photos early in the day and we will tell you honestly what is open.",
      },
      {
        question: "Do you remove a single item, or is there a minimum?",
        answer:
          "Single items are welcome and price as a minimum load — roughly $99 to $150 in the current market, including the lifting, hauling and disposal fees. One sofa, one fridge, one mattress is a normal booking for us, not an inconvenience.",
      },
      {
        question: "What do you do with items that are still usable?",
        answer:
          "They come out of the load first. Furniture, housewares, tools and clothing in donatable condition go to local charities and thrift partners; metal, wood, cardboard and electronics go to their recycling streams. Only what cannot be reused or recycled is taken to disposal and weighed there.",
      },
    ],
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
    body: [
      {
        type: "callout",
        label: "Quick answer",
        text: "We remove single pieces or whole-house suites — sofas, sectionals, beds, mattresses, dressers, dining sets, desks and office furniture — from anywhere in the property, including basements, walk-ups and condos with booked elevators. A single piece prices as a minimum load, roughly $99–150 in the 2026 market; a full room of furniture usually lands between a quarter and a half truck. Pieces in donatable condition are separated and routed to local charities rather than disposal.",
      },
      { type: "heading", text: "What furniture do you remove?" },
      { type: "paragraph", text: "Anything that furnishes a room and has stopped being useful where it is. Sectionals that will not fit the new place, sofa beds that weigh twice what they look like, mattresses and box springs, bed frames, dressers, wardrobes, dining tables and chairs, china cabinets, bookcases, patio sets, exercise equipment, and the office furniture nobody wants to disassemble — desks, filing cabinets, conference tables, task chairs by the dozen." },
      { type: "paragraph", text: "Disassembly is part of the job, not an extra. If a sectional came into the room in pieces it leaves in pieces, and if a bed frame has to come apart to clear a stairwell turn, it comes apart. That is usually what separates a furniture job that takes twenty minutes from one that takes two hours, and it is why the photo matters more than the item name." },
      { type: "heading", text: "How much does furniture removal cost?" },
      { type: "paragraph", text: "The same volume pricing as any load: a single sofa, mattress or dresser is a minimum load at roughly $99–150. Two or three large pieces usually land in the quarter-truck band, roughly $200–300. A full living room and bedroom together typically reaches a half truck, roughly $300–500. Stairs, long carries and tight access add crew time and can move a piece up a band, which is exactly why we price from photos rather than a phone description. The [full price breakdown](/blog/junk-removal-cost-north-vancouver) shows every fraction." },
      { type: "heading", text: "Can you get a sofa out of a condo or a basement?" },
      { type: "paragraph", text: "Usually yes, and the answer comes from the photo rather than from optimism. The pieces that cause trouble are sectionals in rooms with a single tight turn, sofa beds with a welded steel frame, and anything that was carried in before a wall went up. Send a picture of the piece and a picture of the route it has to travel — the doorway, the stair turn, the hallway — and we will tell you before booking whether it comes out whole, comes apart, or genuinely will not go." },
      { type: "paragraph", text: "In condo buildings the constraint is rarely the furniture and almost always the building. Freight elevator bookings, loading-bay windows and certificates of insurance are routine work: tell us the building and we handle that side. Floors, walls and common areas are protected before the first piece moves, which is what strata councils actually care about." },
      { type: "heading", text: "Do you donate furniture that is still good?" },
      { type: "paragraph", text: "Yes, and it is the first sort the crew makes. Clean, complete, structurally sound pieces go to local charities and thrift partners; that is genuinely better for you too, because a donated piece leaves the load. What does not qualify is worth being honest about: torn upholstery, water damage, smoke exposure, particle-board units that have already failed, and anything missing the hardware that holds it together. Those are disposal, and a company that promises otherwise is telling you what you want to hear." },
      { type: "heading", text: "What about mattresses and box springs?" },
      { type: "paragraph", text: "We take them, and they carry a per-unit recycling fee anywhere in Metro Vancouver — that fee is inside the quote, not added at the door. Charities generally will not accept used mattresses for hygiene reasons, so recycling is almost always the right route. If you want to weigh the alternatives first, our [mattress disposal guide](/blog/how-to-get-rid-of-mattress-vancouver) covers every legal option on the North Shore with real costs." },
      { type: "paragraph", text: "Clearing a whole property rather than a room? That is an [estate cleanout](/services/estate-cleanout). Clearing an office or a retail space? That is a [commercial cleanout](/services/commercial-cleanout)." },
      { type: "cta", label: "Get My Free Estimate →", href: "/estimate" },
    ],
    faqs: [
      {
        question: "Do you take apart furniture that will not fit through the door?",
        answer:
          "Yes, disassembly is part of the job and not a surcharge. Bed frames, sectionals and desks come apart when a doorway or stair turn requires it. Send a photo of both the piece and the route out, and we will tell you in advance how it is coming out.",
      },
      {
        question: "How much does it cost to remove one couch?",
        answer:
          "A single sofa prices as a minimum load, roughly $99 to $150 in the current Metro Vancouver market, including lifting, hauling and disposal. Upper floors, long carries or a tight stairwell can move it slightly, so a photo of the piece and the route settles the number before you book.",
      },
      {
        question: "Can you remove furniture from a condo with an elevator?",
        answer:
          "Yes, and it is routine. Tell us the building and we handle the freight elevator booking, the loading bay window, and any certificate of insurance the strata requires. Floors, walls and common areas are protected before the first piece moves, which is what building managers actually ask about.",
      },
      {
        question: "Will you donate my old sofa instead of dumping it?",
        answer:
          "If condition allows, yes — clean, complete, structurally sound pieces go to local charities and thrift partners first. Torn, stained, water-damaged or collapsed particle-board pieces do not qualify and go to recycling or disposal instead. We will tell you honestly which category yours falls into.",
      },
      {
        question: "Do you remove office furniture as well as household pieces?",
        answer:
          "Yes. Desks, filing cabinets, conference tables, cubicle panels and bulk task chairs are regular work, and they are usually scheduled outside business hours when the building requires it. For a full workplace clear rather than a few pieces, our commercial cleanout line covers the whole space.",
      },
    ],
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
    body: [
      {
        type: "callout",
        label: "Quick answer",
        text: "A garage cleanout clears the whole space in one visit — boxes, old furniture, bikes, tools, paint, yard equipment and whatever accumulated behind them — and leaves a swept floor. A typical single garage fills about half a truck, roughly $300–500 in the 2026 market; a packed double garage runs three-quarters to a full truck. Most take two to four hours, and nothing has to be moved to the driveway first.",
      },
      { type: "heading", text: "What does a garage cleanout involve?" },
      { type: "paragraph", text: "The crew works from the door inward, pulling items out in the order they come, sorting as they go: donation, recycling, disposal, and a fourth pile for anything you have asked us to leave. You do not need to pre-stage anything on the driveway — moving everything twice is the part that makes people put the job off for another year." },
      { type: "paragraph", text: "What comes out of a North Shore garage is remarkably consistent: patio furniture from two houses ago, a mountain bike nobody has ridden since the kids left, paint cans from a renovation in the previous decade, camping gear, broken yard tools, the boxes that were carried in on moving day and never opened. The [garage cleanout cost guide](/blog/garage-cleanout-north-vancouver-cost) walks through a real one, item by item." },
      { type: "heading", text: "How much does a garage cleanout cost?" },
      { type: "paragraph", text: "By volume, like every other load. A single garage that is full but walkable is usually a half truck, roughly $300–500. One packed to the door, where nothing has come out in a decade, reaches three-quarters, roughly $500–700. A double garage cleared completely is often a full truck, roughly $649–1,000. Shelving and workbenches that have to be dismantled add crew time; a floor of loose boxes does not." },
      { type: "paragraph", text: "Photos are what make that number firm before anyone arrives — a wide shot from the open door plus a close-up of anything heavy. The [cost guide](/blog/garage-cleanout-north-vancouver-cost) prices a typical North Vancouver garage end to end, and the [general price breakdown](/blog/junk-removal-cost-north-vancouver) shows how the fractions compare." },
      { type: "heading", text: "How long does a garage cleanout take?" },
      { type: "paragraph", text: "Two to four hours for most single garages, half a day for a packed double. The variable is almost never the volume — it is the sorting. A garage where you already know what stays takes the low end; a garage where every box has to be opened and asked about takes the high end. If you can spare twenty minutes at the start to point at what is definitely going, the rest moves fast." },
      { type: "heading", text: "What should I sort before you arrive?" },
      { type: "paragraph", text: "Nothing, strictly speaking. But three things are worth pulling aside if you have an evening free, because each one genuinely lowers the bill or the risk:" },
      {
        type: "list",
        items: [
          "Anything sellable or donatable you want to handle yourself — working power tools, decent bikes, unused camping gear. Items that leave the load shrink the truck fraction you are paying for.",
          "Paint, solvents, fuel, propane cylinders and pool chemicals. These need dedicated depots and cannot go in the truck; set them in one corner and we will tell you which depot takes them.",
          "Documents and anything personal. Garages hide old tax files and photographs in boxes that look like nothing, and once a load is on the truck it is gone.",
        ],
      },
      { type: "heading", text: "What happens to what comes out?" },
      { type: "paragraph", text: "Reuse and recycle first, landfill last. Usable tools, bikes, sporting goods and furniture go to local charities and thrift partners when condition allows. Scrap metal, which garages produce more of than anything, recycles free and is separated out. Wood, cardboard and electronics go to their own streams. What is genuinely finished goes to the North Shore Recycling & Waste Centre, where it is weighed and charged by the tonne — and that fee is already inside the quote." },
      { type: "paragraph", text: "Clearing more than the garage in one visit is almost always cheaper than two separate ones: if the basement or the shed is on the list too, say so and it is quoted as one load. See [junk removal](/services/junk-removal) for a mixed-space clear, or the [North Vancouver](/locations/north-vancouver) page for how we handle access on this side of the water." },
      { type: "cta", label: "Get My Free Estimate →", href: "/estimate" },
    ],
    faqs: [
      {
        question: "Do I need to empty the garage onto the driveway first?",
        answer:
          "No, and please do not. The crew works from the door inward and carries everything out, which is the part you are hiring us for. Pre-staging means moving the same items twice and is the single most common reason people postpone the job for another year.",
      },
      {
        question: "How much does a double garage cleanout cost?",
        answer:
          "A fully cleared double garage is usually a full truck, roughly $649 to $1,000 in the current market. A single garage that is full but walkable lands around a half truck, roughly $300 to $500. A wide photo from the open door is enough to place yours firmly before you book.",
      },
      {
        question: "Can you take paint, solvents and propane from the garage?",
        answer:
          "No — those are hazardous materials that require dedicated depots and cannot legally ride in the truck. Set them aside in one corner and we will tell you exactly which depot accepts each one. Everything else in a typical garage we can take in the same visit.",
      },
      {
        question: "How long will my garage take?",
        answer:
          "Two to four hours for most single garages and about half a day for a packed double. Volume matters less than sorting: if you can spend twenty minutes at the start pointing out what is definitely leaving, the rest of the job moves at the pace of the carrying rather than the deciding.",
      },
      {
        question: "Will you recycle the metal and tools instead of dumping them?",
        answer:
          "Yes. Scrap metal recycles free and is separated out of every garage load, and usable tools, bikes and sporting goods go to local charities when condition allows. Only what cannot be reused or recycled goes to the North Shore Recycling & Waste Centre, weighed and billed by the tonne.",
      },
    ],
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
    guidePostSlug: "estate-cleanout-north-vancouver",
    body: [
      {
        type: "callout",
        label: "Quick answer",
        text: "An estate cleanout clears an entire property — usually after a death, a move into care, or a downsizing — and it is staged over days rather than done in one visit. We work room by room, set aside anything the family has flagged, route usable goods to donation, and can supply an itemized invoice, before-and-after photographs and donation receipts for the estate file. Whole-home work is quoted as a project, not as a single truck fraction.",
      },
      { type: "heading", text: "How is an estate cleanout different from ordinary junk removal?" },
      { type: "paragraph", text: "Two things: the pace and the stakes. An ordinary load is a decision already made — these items are going. An estate is a house where most of the decisions have not been made yet, and where a box that looks like nothing can hold the only copy of something. So the crew works slower and more deliberately, flags rather than assumes, and stops when it finds documents, photographs, jewellery or anything that looks like it belongs to a person rather than to a household." },
      { type: "paragraph", text: "The other difference is who we are working for. Executors have obligations to beneficiaries and often need a record of what left the property. Families are usually doing this in the middle of grief and on a deadline set by a listing or a tenancy. Both need the same thing from us: a predictable process and no surprises." },
      { type: "heading", text: "What does an estate cleanout cost?" },
      { type: "paragraph", text: "It is quoted as a project rather than by the truckload, because a whole house is several loads across several days and the sorting time matters as much as the volume. A small apartment may be one long day; a family home with a basement, a garage and forty years of accumulation is typically three to five. The [estate cleanout guide](/blog/estate-cleanout-north-vancouver) sets out what the work costs in North Vancouver and how the days are staged, and the [general pricing breakdown](/blog/junk-removal-cost-north-vancouver) explains the volume bands underneath it." },
      { type: "heading", text: "How do you handle things the family wants to keep?" },
      { type: "paragraph", text: "Nothing leaves without a decision. Before the first day we walk the property with you and mark what stays — rooms, pieces, or categories like paperwork and photographs. During the work anything that looks personal or valuable is set aside rather than judged: paperwork, albums, small jewellery, keys, anything in a safe or a locked drawer. You get it in one place at the end of each day, and we would rather set aside ten things that turn out to be nothing than miss one that mattered." },
      { type: "heading", text: "What paperwork can you provide for the estate?" },
      {
        type: "list",
        items: [
          "An itemized invoice suitable for the estate file, broken down by day and by scope rather than as a single line.",
          "Before-and-after photographs of each room, which executors are often asked for when accounting to beneficiaries.",
          "Donation receipts where our partner charities issue them — not every charity does, and we will tell you in advance which ones will.",
          "A written scope before the work begins, so what was agreed and what was done can be compared later.",
        ],
      },
      { type: "paragraph", text: "Ask for these at booking rather than afterwards; they are prepared as the work goes, which is far easier than reconstructing them once the house is empty." },
      { type: "heading", text: "What happens to the contents?" },
      { type: "paragraph", text: "Donation first, and it is the part families care about most. Furniture, housewares, kitchen goods, linens, books and clothing in usable condition go to local charities and thrift partners rather than to disposal. Metal, wood, cardboard and electronics are separated into recycling streams. Only what cannot be reused or recycled goes to the North Shore Recycling & Waste Centre. Where items may have real resale value we will say so rather than remove them — an appraiser costs less than a mistake." },
      { type: "paragraph", text: "We do this work across [North Vancouver](/locations/north-vancouver), [West Vancouver](/locations/west-vancouver) and [Vancouver](/locations/vancouver). If the property needs only a room or two cleared rather than the whole house, [furniture removal](/services/furniture-removal) or a [garage cleanout](/services/garage-cleanout) is usually the right line." },
      { type: "cta", label: "Get My Free Estimate →", href: "/estimate" },
    ],
    faqs: [
      {
        question: "How long does an estate cleanout take?",
        answer:
          "A small apartment can be one long day. A family home with a basement, garage and decades of accumulation is typically three to five days, staged room by room. We set the schedule against your deadline — a listing date, a tenancy end, or a probate timeline — and confirm it in writing before the first day.",
      },
      {
        question: "Can you provide documentation for the estate file?",
        answer:
          "Yes. We can supply an itemized invoice broken down by day and scope, before-and-after photographs of each room, and donation receipts where our partner charities issue them. Executors are often asked for all three when accounting to beneficiaries, so request them at booking and they are prepared as the work goes.",
      },
      {
        question: "What if we find something valuable during the cleanout?",
        answer:
          "It stops and comes to you. Paperwork, photographs, jewellery, keys and anything in a safe or locked drawer is set aside rather than assessed, and handed over at the end of each day. Where items may have genuine resale value we say so instead of removing them.",
      },
      {
        question: "Do you work with executors and realtors directly?",
        answer:
          "Yes, routinely. Executors usually need documentation and a predictable schedule; realtors need the property presentation-ready by a listing date. Either can book and approve scope on the family's behalf once we know who holds that authority, and we will keep whoever else you name copied on the record.",
      },
      {
        question: "Is an estate cleanout priced differently from a regular load?",
        answer:
          "Yes. Whole-home work is quoted as a project rather than as a truck fraction, because it runs across several days and the careful sorting takes as long as the carrying. The quote covers the full scope agreed in advance, so the estate is not exposed to a number that grows partway through.",
      },
    ],
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
    body: [
      {
        type: "callout",
        label: "Quick answer",
        text: "We clear renovation and construction debris — drywall, tile, flooring offcuts, framing lumber, cabinetry, fixtures, packaging — from residential and commercial sites across Metro Vancouver. Heavy material is quoted by weight rather than by volume, because disposal facilities bill it by the tonne. We can come once at the end or on a recurring schedule through a longer build, and we work around trades rather than through them.",
      },
      { type: "heading", text: "What construction debris do you take?" },
      { type: "paragraph", text: "The material a renovation actually produces: drywall offcuts and dust-sheeted scrap, tile and backer board, hardwood and laminate offcuts, underlay, framing lumber, torn-out cabinetry and countertops, old fixtures and sinks, doors, trim, insulation, roofing shingles, and the mountain of cardboard and packaging that arrives with new appliances and cabinets. Bathroom and kitchen gut-outs are the two most common jobs on the North Shore." },
      { type: "paragraph", text: "What we cannot take is the same short list as everywhere else, and on a construction site it comes up more often: paint and solvents, adhesives, fuel, propane, and anything containing asbestos. Pre-1990 Metro Vancouver homes are the reason that last one matters — if there is any chance a material is asbestos-bearing, it needs a hazardous-materials survey and a licensed abatement contractor before any removal, ours included. We will stop and say so rather than load it." },
      { type: "heading", text: "How is construction debris priced?" },
      { type: "paragraph", text: "Mostly by weight, which is the honest way to quote it. Concrete, tile, mortar, soil and shingles are dense enough that a visually small pile outweighs a truck of furniture, and the disposal facility charges by the tonne — so pricing it by volume would mean either overcharging light loads or losing money on heavy ones. Mixed renovation debris that is mostly lumber, cardboard and cabinetry is quoted the normal volume way. Most jobs are a mix, and the quote says which part is which." },
      { type: "paragraph", text: "Send photos of the pile with something for scale, and mention the material rather than just the room: “bathroom gut, cast iron tub and floor tile” produces a far more accurate number than “bathroom reno.” The [pricing guide](/blog/junk-removal-cost-north-vancouver) covers how weight and volume interact." },
      { type: "heading", text: "Can you come during the build, not just at the end?" },
      { type: "paragraph", text: "Yes, and on most projects over a few weeks it is the better arrangement. Debris that accumulates on site slows trades down, takes up the space the next crew needs, and turns into a single enormous load at the worst possible moment — usually the week the finishing trades arrive. A recurring pickup keeps the site workable. We schedule around the trades, not through them: early mornings, between phases, or on the day a delivery clears space." },
      { type: "heading", text: "Do you work with contractors and property managers?" },
      { type: "paragraph", text: "Regularly. Contractors need predictable timing and a crew that does not need supervising; property managers need buildings protected, certificates of insurance on file, and loading bays used within their window. Both are standard. On strata and commercial sites we book the elevator and the bay, protect common areas, and keep the route clean, because the complaint that follows a messy removal lands on you rather than on us." },
      { type: "paragraph", text: "Renovation leftovers inside a finished home rather than an active site are usually just [junk removal](/services/junk-removal). A whole commercial space being stripped is a [commercial cleanout](/services/commercial-cleanout)." },
      { type: "cta", label: "Get My Free Estimate →", href: "/estimate" },
    ],
    faqs: [
      {
        question: "Do you take drywall, tile and concrete?",
        answer:
          "Yes, all three. They are quoted by weight rather than volume because disposal facilities charge dense material by the tonne — a small pile of tile or concrete outweighs a truck of furniture. Send a photo with something for scale and name the material, and the quote will separate the weight-billed part.",
      },
      {
        question: "Can you remove asbestos-containing material?",
        answer:
          "No. If any material may contain asbestos — common in Metro Vancouver homes built before 1990 — it requires a hazardous-materials survey and a licensed abatement contractor before removal by anyone, including us. We will stop and tell you rather than load it, and point you toward the right next step.",
      },
      {
        question: "Will you come back multiple times during a renovation?",
        answer:
          "Yes, and on projects running more than a few weeks it usually works better. Recurring pickups keep the site workable, stop debris from occupying space the next trade needs, and avoid one enormous load landing the week the finishing crews arrive. We schedule around trades rather than through them.",
      },
      {
        question: "Do you provide a certificate of insurance for strata or commercial sites?",
        answer:
          "Yes. Building managers and strata councils commonly require one before a crew uses a loading bay or freight elevator, and we provide it on request at booking. Tell us the building when you book and we will have the paperwork filed before the first visit rather than at the door.",
      },
      {
        question: "Is it cheaper to rent a bin instead?",
        answer:
          "For a slow build where debris accumulates daily, often yes — a bin sits there and you load it. Full-service wins when the loading is the hard part, when the site needs clearing fast between phases, or when the load includes material a bin operator will not accept. Our cost guide compares both on real numbers.",
      },
    ],
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
    body: [
      {
        type: "callout",
        label: "Quick answer",
        text: "We clear offices, retail units, restaurants, warehouses and strata common areas across Metro Vancouver — furniture, fixtures, shelving, IT equipment, storage-room overflow and full decommissions. Work is scheduled around your hours, including evenings and weekends, and we handle the building side: loading bay windows, freight elevator bookings and certificates of insurance. Most jobs are quoted as a project against a walkthrough or photos, with a firm number before the date.",
      },
      { type: "heading", text: "What commercial spaces do you clear?" },
      { type: "paragraph", text: "Offices at lease end, retail units between tenants, restaurant and café fit-outs being stripped, warehouse and storage-room overflow, and strata common areas — the bike room nobody has audited in five years, the parkade corner that became a dumping ground, the storage locker whose owner moved out in 2019. Full decommissions and partial clears are both normal: sometimes the whole floor goes, sometimes it is the forty task chairs a downsizing left behind." },
      {
        type: "list",
        items: [
          "Office furniture: desks, workstations, cubicle panels, filing cabinets, conference tables, bulk task chairs.",
          "Retail fixtures: shelving, gondolas, display cases, mannequins, signage, point-of-sale counters.",
          "IT and electronics: monitors, towers, printers, server-room leftovers and cabling, routed to e-waste recycling.",
          "Back-of-house: pallets, packaging, stock that cannot be sold, appliances and kitchen equipment.",
        ],
      },
      { type: "heading", text: "How do you work around a business that is still operating?" },
      { type: "paragraph", text: "By not being there when your customers are. Evening and weekend windows are standard, and on most commercial jobs they cost no more than a weekday slot because they suit the route just as well. Inside an occupied building the constraint is the building itself: loading bay windows are often an hour long, freight elevators are booked in advance, and a crew that arrives without either wastes everyone's morning. We arrange both before the date, protect the route, and keep common areas clean because the complaint from a neighbouring tenant lands on your lease, not ours." },
      { type: "heading", text: "What does a commercial cleanout cost?" },
      { type: "paragraph", text: "Most are quoted as a project rather than a truck fraction, because the volume is usually clear from a walkthrough or a set of photos and the real variables are access and timing. A single office suite of furniture is often one to two truckloads. A retail unit being stripped to shell depends almost entirely on the fixtures. Restaurant equipment is heavy enough that weight comes into it. Whatever the shape, you get a firm number before the date — a business cannot approve a range that moves, and it should not have to." },
      { type: "paragraph", text: "For the underlying volume bands, our [pricing guide](/blog/junk-removal-cost-north-vancouver) shows what each truck fraction holds and costs." },
      { type: "heading", text: "What happens to office furniture and equipment?" },
      { type: "paragraph", text: "Usable office furniture is one of the easiest categories to divert, and it is the first sort we make: desks, chairs, cabinets and conference furniture in serviceable condition go to charities, non-profits and community organisations that genuinely need them. Electronics go to e-waste recycling rather than landfill. Metal, cardboard and wood are separated. What remains goes to disposal and is weighed there, with the fee already inside your quote. If you need a record of what left the premises for your own file, ask at booking and we will produce it." },
      { type: "paragraph", text: "Stripping a space as part of a build rather than a move-out is usually [construction cleanup](/services/construction-cleanup). We serve [Vancouver](/locations/vancouver), [North Vancouver](/locations/north-vancouver), [West Vancouver](/locations/west-vancouver) and [Burnaby](/locations/burnaby) on the same terms." },
      { type: "cta", label: "Get My Free Estimate →", href: "/estimate" },
    ],
    faqs: [
      {
        question: "Can you work after hours so we do not close?",
        answer:
          "Yes. Evening and weekend windows are standard for commercial work and usually cost no more than a weekday slot, because they suit the route just as well. Tell us your operating hours and the building's loading bay window, and we will schedule the crew inside both rather than around one.",
      },
      {
        question: "Do you handle the loading bay and freight elevator booking?",
        answer:
          "Yes. Tell us the building and we arrange the bay window, the elevator reservation and any certificate of insurance the property manager requires, before the date rather than at the door. Common areas and the route are protected, since a complaint from a neighbouring tenant lands on your lease.",
      },
      {
        question: "What happens to our old office furniture?",
        answer:
          "Serviceable desks, chairs, cabinets and conference furniture go first to charities, non-profits and community organisations that can use them. Electronics are routed to e-waste recycling, and metal, cardboard and wood are separated. Only the remainder goes to disposal, weighed and billed inside the quote you approved.",
      },
      {
        question: "Can you clear a retail unit at the end of a lease?",
        answer:
          "Yes, including full strip-to-shell decommissions. Shelving, display cases, counters, signage and back-of-house stock are routine. Give us the handover date and we will schedule backwards from it, so the unit is ready for inspection rather than finished the morning the landlord walks through.",
      },
      {
        question: "Do you provide documentation of what was removed?",
        answer:
          "Yes, on request at booking. We can supply an itemized record of what left the premises and photographs of the cleared space, which is what most property managers and head offices want for the file. Asking in advance is far easier than reconstructing it once the space is empty.",
      },
    ],
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
