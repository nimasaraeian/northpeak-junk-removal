import {
  defaultLoadTierId,
  getLoadTier,
  isLoadTierId,
  resolveLoadTierId,
  type LoadTierId,
} from "@/content/load-tiers";

const STORAGE_KEY = "np-load-tier";

export function persistLoadTier(id: LoadTierId) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function readStoredLoadTier(): LoadTierId | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value && isLoadTierId(value) ? value : null;
  } catch {
    return null;
  }
}

/** Accepts `load` or legacy volume slugs. */
export function resolveLoadTier(
  loadParam?: string | null,
  volumeParam?: string | null,
): LoadTierId {
  if (loadParam) return resolveLoadTierId(loadParam);
  if (volumeParam) return resolveLoadTierId(volumeParam);
  return defaultLoadTierId;
}

export function estimateHref(tierId: LoadTierId) {
  return `/estimate?load=${tierId}` as const;
}

export function summarizeLoadTier(tierId: LoadTierId) {
  const tier = getLoadTier(tierId);
  return {
    tierId: tier.id,
    label: tier.label,
    tagline: tier.tagline,
    moment: tier.moment,
    visitFeel: tier.visitFeel,
    greatFor: tier.greatFor,
    estimateVolumeId: tier.estimateVolumeId,
    continueHref: estimateHref(tier.id),
  };
}
