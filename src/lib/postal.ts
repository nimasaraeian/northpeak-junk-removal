import { serviceAreaLookup } from "@/content/service-areas";
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

  if (match?.tier === "core") {
    return {
      postalCode,
      fsa,
      city: match.city,
      tier: "core",
      headline: `Yes — we regularly serve ${match.city}.`,
      message:
        "You are in our core service area. Request an estimate and we will confirm timing the same day.",
    };
  }

  if (match?.tier === "extended") {
    return {
      postalCode,
      fsa,
      city: match.city,
      tier: "extended",
      headline: `Yes — ${match.city} is in our extended coverage.`,
      message:
        "We book Greater Vancouver jobs by route. Share a few details and we will confirm the next available window.",
    };
  }

  return {
    postalCode,
    fsa,
    tier: "unavailable",
    headline: "This postal code is outside our current coverage.",
    message:
      "We are focused on the North Shore, Burnaby, and Greater Vancouver. Leave your details and we will tell you if a nearby route opens up.",
  };
}
