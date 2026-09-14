import {
  serviceAreaLookup,
  serviceAreaTierConfig,
} from "@/content/service-areas";
import type { ServiceAreaTier } from "@/types";

const CANADIAN_POSTAL =
  /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ ]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;

export function normalizePostalCode(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (compact.length <= 3) return compact;
  return `${compact.slice(0, 3)} ${compact.slice(3, 6)}`;
}

export function isValidCanadianPostalCode(value: string) {
  return CANADIAN_POSTAL.test(normalizePostalCode(value));
}

export function getFsa(value: string) {
  return normalizePostalCode(value).replace(" ", "").slice(0, 3);
}

export interface ServiceAreaResult {
  postalCode: string;
  fsa: string;
  city?: string;
  tier: ServiceAreaTier;
  tierLabel: string;
  headline: string;
  message: string;
}

export function checkServiceArea(value: string): ServiceAreaResult | { error: string } {
  const postalCode = normalizePostalCode(value);

  if (!isValidCanadianPostalCode(postalCode)) {
    return {
      error: "Enter a valid Canadian postal code, such as V7L 1A1.",
    };
  }

  const fsa = getFsa(postalCode);
  const match = serviceAreaLookup.get(fsa);

  if (match) {
    const config = serviceAreaTierConfig[match.tier];
    return {
      postalCode,
      fsa,
      city: match.city,
      tier: match.tier,
      tierLabel: config.label,
      headline: config.headline(match.city),
      message: config.message,
    };
  }

  const config = serviceAreaTierConfig.outside;
  return {
    postalCode,
    fsa,
    tier: "outside",
    tierLabel: config.label,
    headline: config.headline(),
    message: config.message,
  };
}
