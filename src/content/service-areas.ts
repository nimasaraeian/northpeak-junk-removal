import type { ServiceAreaTier } from "@/types";

export interface ServiceAreaRule {
  fsa: string;
  city: string;
  tier: Exclude<ServiceAreaTier, "unavailable">;
}

/**
 * Forward Sortation Areas we currently treat as in-market.
 * Expand this table as coverage grows. The checker only reads this file.
 */
export const serviceAreaRules: ServiceAreaRule[] = [
  // North Vancouver
  { fsa: "V7G", city: "North Vancouver", tier: "core" },
  { fsa: "V7H", city: "North Vancouver", tier: "core" },
  { fsa: "V7J", city: "North Vancouver", tier: "core" },
  { fsa: "V7K", city: "North Vancouver", tier: "core" },
  { fsa: "V7L", city: "North Vancouver", tier: "core" },
  { fsa: "V7M", city: "North Vancouver", tier: "core" },
  { fsa: "V7N", city: "North Vancouver", tier: "core" },
  { fsa: "V7P", city: "North Vancouver", tier: "core" },
  { fsa: "V7R", city: "North Vancouver", tier: "core" },
  // West Vancouver
  { fsa: "V7S", city: "West Vancouver", tier: "core" },
  { fsa: "V7T", city: "West Vancouver", tier: "core" },
  { fsa: "V7V", city: "West Vancouver", tier: "core" },
  { fsa: "V7W", city: "West Vancouver", tier: "core" },
  // Burnaby
  { fsa: "V5A", city: "Burnaby", tier: "core" },
  { fsa: "V5B", city: "Burnaby", tier: "core" },
  { fsa: "V5C", city: "Burnaby", tier: "core" },
  { fsa: "V5E", city: "Burnaby", tier: "core" },
  { fsa: "V5G", city: "Burnaby", tier: "core" },
  { fsa: "V5H", city: "Burnaby", tier: "core" },
  { fsa: "V5J", city: "Burnaby", tier: "core" },
  // City of Vancouver
  { fsa: "V5K", city: "Vancouver", tier: "extended" },
  { fsa: "V5L", city: "Vancouver", tier: "extended" },
  { fsa: "V5M", city: "Vancouver", tier: "extended" },
  { fsa: "V5N", city: "Vancouver", tier: "extended" },
  { fsa: "V5P", city: "Vancouver", tier: "extended" },
  { fsa: "V5R", city: "Vancouver", tier: "extended" },
  { fsa: "V5S", city: "Vancouver", tier: "extended" },
  { fsa: "V5T", city: "Vancouver", tier: "extended" },
  { fsa: "V5V", city: "Vancouver", tier: "extended" },
  { fsa: "V5W", city: "Vancouver", tier: "extended" },
  { fsa: "V5X", city: "Vancouver", tier: "extended" },
  { fsa: "V5Y", city: "Vancouver", tier: "extended" },
  { fsa: "V5Z", city: "Vancouver", tier: "extended" },
  { fsa: "V6A", city: "Vancouver", tier: "extended" },
  { fsa: "V6B", city: "Vancouver", tier: "extended" },
  { fsa: "V6C", city: "Vancouver", tier: "extended" },
  { fsa: "V6E", city: "Vancouver", tier: "extended" },
  { fsa: "V6G", city: "Vancouver", tier: "extended" },
  { fsa: "V6H", city: "Vancouver", tier: "extended" },
  { fsa: "V6J", city: "Vancouver", tier: "extended" },
  { fsa: "V6K", city: "Vancouver", tier: "extended" },
  { fsa: "V6L", city: "Vancouver", tier: "extended" },
  { fsa: "V6M", city: "Vancouver", tier: "extended" },
  { fsa: "V6N", city: "Vancouver", tier: "extended" },
  { fsa: "V6P", city: "Vancouver", tier: "extended" },
  { fsa: "V6R", city: "Vancouver", tier: "extended" },
  { fsa: "V6S", city: "Vancouver", tier: "extended" },
  { fsa: "V6T", city: "Vancouver", tier: "extended" },
  { fsa: "V6Z", city: "Vancouver", tier: "extended" },
  // Inner Metro
  { fsa: "V3L", city: "New Westminster", tier: "extended" },
  { fsa: "V3M", city: "New Westminster", tier: "extended" },
  { fsa: "V3H", city: "Port Moody", tier: "extended" },
  { fsa: "V3B", city: "Coquitlam", tier: "extended" },
  { fsa: "V3C", city: "Coquitlam", tier: "extended" },
  { fsa: "V3E", city: "Coquitlam", tier: "extended" },
  { fsa: "V3J", city: "Coquitlam", tier: "extended" },
  { fsa: "V3K", city: "Coquitlam", tier: "extended" },
];

export const serviceAreaLookup = new Map(
  serviceAreaRules.map((rule) => [rule.fsa, rule]),
);
