import type { BlogPost } from "@/types";

export const blogPosts: BlogPost[] = [
  {
    slug: "junk-removal-north-vancouver-what-to-expect",
    title: "Junk Removal in North Vancouver: What to Expect",
    excerpt:
      "A clear look at how a professional removal visit works on the North Shore — from access and estimates to what happens after the truck leaves.",
    date: "2026-09-01",
    readingTime: "6 min",
    category: "Local Guide",
    seoTitle: "Junk Removal North Vancouver: What to Expect",
    seoDescription:
      "What a professional junk removal visit looks like in North Vancouver, including estimates, access, and responsible disposal.",
    relatedServiceSlugs: ["junk-removal", "garage-cleanout"],
    relatedLocationSlugs: ["north-vancouver"],
    body: [
      "North Vancouver properties rarely offer a simple driveway and a level walk. Hillside stairs, shared laneways, and condo loading rules shape the job as much as the pile itself. A good crew plans for that before arrival.",
      "The estimate should describe volume, access, and disposal — not a vague hourly promise. If the range is honest, the visit is quieter. You should know what is included, what cannot be taken, and how long the crew expects to be on site.",
      "After the load leaves, the space should be swept and safe. Donation-ready items should have been set aside. That is the difference between hauling and recovery: the property is ready for the next use, not merely emptied.",
    ],
  },
  {
    slug: "furniture-removal-vancouver-practical-guide",
    title: "Furniture Removal in Vancouver: A Practical Guide",
    excerpt:
      "How to prepare sofas, beds, and office suites for removal in condos and houses across Vancouver.",
    date: "2026-08-20",
    readingTime: "5 min",
    category: "How-To",
    seoTitle: "Furniture Removal Vancouver Guide",
    seoDescription:
      "A practical guide to furniture removal in Vancouver, including condo access, donation, and what to measure before the crew arrives.",
    relatedServiceSlugs: ["furniture-removal", "commercial-cleanout"],
    relatedLocationSlugs: ["north-vancouver", "burnaby"],
    body: [
      "Furniture removal fails when the piece is larger than the path. Measure the sofa, the stair turn, and the elevator. In Vancouver condos, book the elevator early and confirm whether lobby protection is required.",
      "Usable pieces can often be donated if they are clean, complete, and structurally sound. Torn sofas, stained mattresses, and particle-board units that have already failed should be treated as disposal, not donation.",
      "If you are emptying an office, photograph the floor plan. Cubicle systems and reception desks take longer than they appear. A short set of photos now will become a tighter estimate when the upload workflow launches.",
    ],
  },
  {
    slug: "garage-cleanout-north-shore-homes",
    title: "Garage Cleanout Tips for North Shore Homes",
    excerpt:
      "How to recover a garage that has become the household archive — without losing what you still need.",
    date: "2026-08-08",
    readingTime: "5 min",
    category: "How-To",
    seoTitle: "Garage Cleanout North Shore Homes",
    seoDescription:
      "Garage cleanout advice for North Vancouver and West Vancouver homes, from keep-piles to responsible disposal.",
    relatedServiceSlugs: ["garage-cleanout", "estate-cleanout"],
    relatedLocationSlugs: ["north-vancouver", "west-vancouver"],
    body: [
      "Most North Shore garages fail for the same reason: they absorbed every unfinished project. The first useful step is a keep-pile. Mark what stays. Everything else can be evaluated as donate, recycle, or remove.",
      "Sports gear, paint, and leftover lumber are the items that stall a cleanout. Tell the crew what is hazardous. Leave a path to the door. If the garage is also a workshop, decide whether the workbench stays before anyone arrives.",
      "A finished garage cleanout should give you parking or a clear work floor. If the space still cannot be used, the job was only a partial haul. Ask for a swept floor and a short walk-through before the crew leaves.",
    ],
  },
  {
    slug: "commercial-junk-removal-vancouver",
    title: "Commercial Junk Removal in Vancouver",
    excerpt:
      "How offices, retail, and end-of-lease suites get emptied without disrupting the rest of the building.",
    date: "2026-07-22",
    readingTime: "6 min",
    category: "Commercial",
    seoTitle: "Commercial Junk Removal Vancouver",
    seoDescription:
      "Commercial junk removal in Vancouver for offices, retail, and end-of-lease cleanouts, including elevator bookings and after-hours options.",
    relatedServiceSlugs: ["commercial-cleanout", "furniture-removal"],
    relatedLocationSlugs: ["vancouver", "burnaby"],
    body: [
      "A commercial cleanout is a building problem before it is a junk problem. Loading bays, elevator reservations, and occupied floors decide the schedule. Share those constraints in the estimate and the visit stays quiet.",
      "Office furniture looks smaller on a floor plan than it is in a freight elevator. Photograph the suite, the path to the dock, and any fixtures that must stay. That is the data a later AI-assisted range will use.",
      "End-of-lease work should leave the suite showable. Sweep, stack nothing in the corridor, and confirm with the property manager before the crew leaves. The next tenant is the real deadline.",
    ],
  },
  {
    slug: "construction-cleanup-vancouver-renovations",
    title: "Construction Cleanup After a Vancouver Renovation",
    excerpt:
      "What to remove between trades so the finish work can start — and what should never go in a mixed load.",
    date: "2026-07-10",
    readingTime: "5 min",
    category: "How-To",
    seoTitle: "Construction Cleanup Vancouver",
    seoDescription:
      "Construction debris removal in Vancouver after renovations: mixed loads, fixtures, and how to keep remaining trades moving.",
    relatedServiceSlugs: ["construction-cleanup", "junk-removal"],
    relatedLocationSlugs: ["vancouver", "north-vancouver"],
    body: [
      "Renovation leftover is not household junk. Offcuts, packaging, old cabinetry, and demolition remnants have different disposal paths. Tell the crew what is wood, what is metal, and what is mixed.",
      "The useful moment for a cleanup is between trades, not after the last one has already been delayed. Book the load-out before flooring or paint so the finish has a clear room.",
      "Hazardous leftovers — paints, solvents, some adhesives — do not belong in a mixed construction load. Set them aside. A professional crew will confirm what they can take and what must go to a depot.",
    ],
  },
];

export function getPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
