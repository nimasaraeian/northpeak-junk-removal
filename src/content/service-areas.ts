import type { ServiceAreaTier } from "@/types";

export interface ServiceAreaCity {
  city: string;
  region: string;
  tier: Exclude<ServiceAreaTier, "outside">;
  aliases: string[];
  seoPage: boolean;
}

export interface ServiceAreaRule {
  fsa: string;
  city: string;
  tier: Exclude<ServiceAreaTier, "outside">;
}

export interface ServiceAreaTierConfig {
  tier: ServiceAreaTier;
  label: string;
  headline: (city?: string) => string;
  message: string;
}

/** City definitions — single source for tiers, aliases, and SEO eligibility. */
export const serviceAreaCities: ServiceAreaCity[] = [
  {
    city: "North Vancouver",
    region: "North Shore",
    tier: "core",
    aliases: [
      "North Vancouver City",
      "District of North Vancouver",
      "Lynn Valley",
      "Deep Cove",
      "Edgemont Village",
      "Capilano",
      "Lower Lonsdale",
      "Central Lonsdale",
    ],
    seoPage: true,
  },
  {
    city: "West Vancouver",
    region: "North Shore",
    tier: "core",
    aliases: ["Ambleside", "Dundarave", "Horseshoe Bay", "British Properties"],
    seoPage: true,
  },
  {
    city: "Vancouver",
    region: "Greater Vancouver",
    tier: "core",
    aliases: ["UBC", "University Endowment Lands", "City of Vancouver"],
    seoPage: true,
  },
  {
    city: "Burnaby",
    region: "Metro Vancouver",
    tier: "core",
    aliases: [],
    seoPage: true,
  },
  {
    city: "Richmond",
    region: "Metro Vancouver",
    tier: "core",
    aliases: ["Steveston"],
    seoPage: true,
  },
  {
    city: "New Westminster",
    region: "Metro Vancouver",
    tier: "core",
    aliases: ["New West"],
    seoPage: true,
  },
  {
    city: "Coquitlam",
    region: "Tri-Cities",
    tier: "extended",
    aliases: ["Port Coquitlam"],
    seoPage: true,
  },
  {
    city: "Port Moody",
    region: "Tri-Cities",
    tier: "extended",
    aliases: [],
    seoPage: true,
  },
  {
    city: "Surrey",
    region: "Metro Vancouver",
    tier: "extended",
    aliases: [],
    seoPage: true,
  },
  {
    city: "Delta",
    region: "Metro Vancouver",
    tier: "extended",
    aliases: ["Ladner", "Tsawwassen"],
    seoPage: true,
  },
  {
    city: "White Rock",
    region: "Metro Vancouver",
    tier: "extended",
    aliases: [],
    seoPage: false,
  },
  {
    city: "Langley",
    region: "Metro Vancouver",
    tier: "extended",
    aliases: ["Langley City", "Township of Langley", "Aldergrove"],
    seoPage: true,
  },
  {
    city: "Maple Ridge",
    region: "Metro Vancouver",
    tier: "extended",
    aliases: [],
    seoPage: true,
  },
  {
    city: "Pitt Meadows",
    region: "Metro Vancouver",
    tier: "extended",
    aliases: [],
    seoPage: false,
  },
  {
    city: "Abbotsford",
    region: "Fraser Valley",
    tier: "confirmation",
    aliases: [],
    seoPage: false,
  },
  {
    city: "Mission",
    region: "Fraser Valley",
    tier: "confirmation",
    aliases: [],
    seoPage: false,
  },
  {
    city: "Squamish",
    region: "Sea to Sky",
    tier: "confirmation",
    aliases: [],
    seoPage: false,
  },
  {
    city: "Chilliwack",
    region: "Fraser Valley",
    tier: "confirmation",
    aliases: [],
    seoPage: false,
  },
];

export const serviceAreaTierConfig: Record<ServiceAreaTier, ServiceAreaTierConfig> = {
  core: {
    tier: "core",
    label: "Standard Service Area",
    headline: (city) =>
      city ? `Great news — we service ${city}.` : "Great news — we service your area.",
    message:
      "You are in our core service area. Request an estimate and we will confirm timing based on availability.",
  },
  extended: {
    tier: "extended",
    label: "Extended Service Area",
    headline: (city) =>
      city
        ? `Yes — we may service ${city}.`
        : "Yes — we may service your area.",
    message:
      "Availability depends on location, routing, and scheduling. Share your details and we will confirm the next available window.",
  },
  confirmation: {
    tier: "confirmation",
    label: "Availability Check Required",
    headline: (city) =>
      city
        ? `You're a little outside our standard service area for ${city}.`
        : "You're a little outside our standard service area.",
    message:
      "We may still be able to help. Send us your details and we will confirm availability before booking.",
  },
  outside: {
    tier: "outside",
    label: "Outside Regular Service Area",
    headline: () => "Your location is outside our regular service area.",
    message:
      "Larger jobs or special pickups may still be possible. Send us your details and we will check availability.",
  },
};

/**
 * Forward Sortation Areas mapped to city and tier.
 * Expand this table as coverage grows. The checker only reads this file.
 */
export const serviceAreaRules: ServiceAreaRule[] = [
  // North Vancouver — core
  { fsa: "V7G", city: "North Vancouver", tier: "core" },
  { fsa: "V7H", city: "North Vancouver", tier: "core" },
  { fsa: "V7J", city: "North Vancouver", tier: "core" },
  { fsa: "V7K", city: "North Vancouver", tier: "core" },
  { fsa: "V7L", city: "North Vancouver", tier: "core" },
  { fsa: "V7M", city: "North Vancouver", tier: "core" },
  { fsa: "V7N", city: "North Vancouver", tier: "core" },
  { fsa: "V7P", city: "North Vancouver", tier: "core" },
  { fsa: "V7R", city: "North Vancouver", tier: "core" },
  // West Vancouver — core
  { fsa: "V7S", city: "West Vancouver", tier: "core" },
  { fsa: "V7T", city: "West Vancouver", tier: "core" },
  { fsa: "V7V", city: "West Vancouver", tier: "core" },
  { fsa: "V7W", city: "West Vancouver", tier: "core" },
  // Burnaby — core
  { fsa: "V5A", city: "Burnaby", tier: "core" },
  { fsa: "V5B", city: "Burnaby", tier: "core" },
  { fsa: "V5C", city: "Burnaby", tier: "core" },
  { fsa: "V5E", city: "Burnaby", tier: "core" },
  { fsa: "V5G", city: "Burnaby", tier: "core" },
  { fsa: "V5H", city: "Burnaby", tier: "core" },
  { fsa: "V5J", city: "Burnaby", tier: "core" },
  // Vancouver — core
  { fsa: "V5K", city: "Vancouver", tier: "core" },
  { fsa: "V5L", city: "Vancouver", tier: "core" },
  { fsa: "V5M", city: "Vancouver", tier: "core" },
  { fsa: "V5N", city: "Vancouver", tier: "core" },
  { fsa: "V5P", city: "Vancouver", tier: "core" },
  { fsa: "V5R", city: "Vancouver", tier: "core" },
  { fsa: "V5S", city: "Vancouver", tier: "core" },
  { fsa: "V5T", city: "Vancouver", tier: "core" },
  { fsa: "V5V", city: "Vancouver", tier: "core" },
  { fsa: "V5W", city: "Vancouver", tier: "core" },
  { fsa: "V5X", city: "Vancouver", tier: "core" },
  { fsa: "V5Y", city: "Vancouver", tier: "core" },
  { fsa: "V5Z", city: "Vancouver", tier: "core" },
  { fsa: "V6A", city: "Vancouver", tier: "core" },
  { fsa: "V6B", city: "Vancouver", tier: "core" },
  { fsa: "V6C", city: "Vancouver", tier: "core" },
  { fsa: "V6E", city: "Vancouver", tier: "core" },
  { fsa: "V6G", city: "Vancouver", tier: "core" },
  { fsa: "V6H", city: "Vancouver", tier: "core" },
  { fsa: "V6J", city: "Vancouver", tier: "core" },
  { fsa: "V6K", city: "Vancouver", tier: "core" },
  { fsa: "V6L", city: "Vancouver", tier: "core" },
  { fsa: "V6M", city: "Vancouver", tier: "core" },
  { fsa: "V6N", city: "Vancouver", tier: "core" },
  { fsa: "V6P", city: "Vancouver", tier: "core" },
  { fsa: "V6R", city: "Vancouver", tier: "core" },
  { fsa: "V6S", city: "Vancouver", tier: "core" },
  { fsa: "V6T", city: "Vancouver", tier: "core" },
  { fsa: "V6Z", city: "Vancouver", tier: "core" },
  // Richmond — core
  { fsa: "V6V", city: "Richmond", tier: "core" },
  { fsa: "V6W", city: "Richmond", tier: "core" },
  { fsa: "V6X", city: "Richmond", tier: "core" },
  { fsa: "V6Y", city: "Richmond", tier: "core" },
  { fsa: "V7A", city: "Richmond", tier: "core" },
  { fsa: "V7B", city: "Richmond", tier: "core" },
  { fsa: "V7C", city: "Richmond", tier: "core" },
  { fsa: "V7E", city: "Richmond", tier: "core" },
  // New Westminster — core
  { fsa: "V3L", city: "New Westminster", tier: "core" },
  { fsa: "V3M", city: "New Westminster", tier: "core" },
  // Coquitlam / Port Coquitlam — extended
  { fsa: "V3B", city: "Coquitlam", tier: "extended" },
  { fsa: "V3C", city: "Coquitlam", tier: "extended" },
  { fsa: "V3E", city: "Coquitlam", tier: "extended" },
  { fsa: "V3J", city: "Coquitlam", tier: "extended" },
  { fsa: "V3K", city: "Coquitlam", tier: "extended" },
  // Port Moody — extended
  { fsa: "V3H", city: "Port Moody", tier: "extended" },
  // Surrey — extended
  { fsa: "V3R", city: "Surrey", tier: "extended" },
  { fsa: "V3S", city: "Surrey", tier: "extended" },
  { fsa: "V3T", city: "Surrey", tier: "extended" },
  { fsa: "V3V", city: "Surrey", tier: "extended" },
  { fsa: "V3W", city: "Surrey", tier: "extended" },
  { fsa: "V3X", city: "Surrey", tier: "extended" },
  { fsa: "V3Z", city: "Surrey", tier: "extended" },
  { fsa: "V4N", city: "Surrey", tier: "extended" },
  { fsa: "V4P", city: "Surrey", tier: "extended" },
  // White Rock — extended
  { fsa: "V4A", city: "White Rock", tier: "extended" },
  { fsa: "V4B", city: "White Rock", tier: "extended" },
  // Delta (Ladner, Tsawwassen) — extended
  { fsa: "V4C", city: "Delta", tier: "extended" },
  { fsa: "V4E", city: "Delta", tier: "extended" },
  { fsa: "V4G", city: "Delta", tier: "extended" },
  { fsa: "V4K", city: "Delta", tier: "extended" },
  { fsa: "V4L", city: "Delta", tier: "extended" },
  { fsa: "V4M", city: "Delta", tier: "extended" },
  // Langley — extended
  { fsa: "V2Y", city: "Langley", tier: "extended" },
  { fsa: "V2Z", city: "Langley", tier: "extended" },
  { fsa: "V3A", city: "Langley", tier: "extended" },
  { fsa: "V4W", city: "Langley", tier: "extended" },
  // Maple Ridge — extended
  { fsa: "V2W", city: "Maple Ridge", tier: "extended" },
  { fsa: "V2X", city: "Maple Ridge", tier: "extended" },
  { fsa: "V4R", city: "Maple Ridge", tier: "extended" },
  // Pitt Meadows — extended
  { fsa: "V3Y", city: "Pitt Meadows", tier: "extended" },
  // Abbotsford — confirmation
  { fsa: "V2S", city: "Abbotsford", tier: "confirmation" },
  { fsa: "V2T", city: "Abbotsford", tier: "confirmation" },
  { fsa: "V3G", city: "Abbotsford", tier: "confirmation" },
  // Mission — confirmation
  { fsa: "V2V", city: "Mission", tier: "confirmation" },
  { fsa: "V4S", city: "Mission", tier: "confirmation" },
  // Squamish — confirmation
  { fsa: "V8B", city: "Squamish", tier: "confirmation" },
  // Chilliwack — confirmation
  { fsa: "V2P", city: "Chilliwack", tier: "confirmation" },
  { fsa: "V2R", city: "Chilliwack", tier: "confirmation" },
];

export const serviceAreaLookup = new Map(
  serviceAreaRules.map((rule) => [rule.fsa, rule]),
);

const aliasLookup = new Map<string, string>();
for (const entry of serviceAreaCities) {
  aliasLookup.set(entry.city.toLowerCase(), entry.city);
  for (const alias of entry.aliases) {
    aliasLookup.set(alias.toLowerCase(), entry.city);
  }
}

export function resolveServiceAreaAlias(value: string): string | undefined {
  return aliasLookup.get(value.trim().toLowerCase());
}

export function getServiceAreaTierLabel(tier: ServiceAreaTier): string {
  return serviceAreaTierConfig[tier].label;
}

export function getCoreServiceCities(): string[] {
  return serviceAreaCities.filter((c) => c.tier === "core").map((c) => c.city);
}

export function getExtendedServiceCities(): string[] {
  return serviceAreaCities.filter((c) => c.tier === "extended").map((c) => c.city);
}

export function getConfirmationServiceCities(): string[] {
  return serviceAreaCities.filter((c) => c.tier === "confirmation").map((c) => c.city);
}
