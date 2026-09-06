"use server";

import { checkServiceArea } from "@/lib/postal";
import { getService } from "@/content/services";
import type { EstimateDraft } from "@/types";

export interface EstimateActionState {
  ok: boolean;
  message: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readString(formData: FormData, key: keyof EstimateDraft) {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Phase 1 lead capture.
 * Later this inserts into Supabase `quote_requests` and triggers estimate review.
 */
export async function submitEstimate(
  _prev: EstimateActionState,
  formData: FormData,
): Promise<EstimateActionState> {
  const draft: EstimateDraft = {
    postalCode: readString(formData, "postalCode"),
    serviceSlug: readString(formData, "serviceSlug"),
    volume: readString(formData, "volume"),
    accessNotes: readString(formData, "accessNotes"),
    description: readString(formData, "description"),
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    phone: readString(formData, "phone"),
    preferredContact:
      readString(formData, "preferredContact") === "email"
        ? "email"
        : readString(formData, "preferredContact") === "text"
          ? "text"
          : "phone",
  };

  const area = checkServiceArea(draft.postalCode);
  if ("error" in area) {
    return { ok: false, message: area.error };
  }

  if (area.tier === "unavailable") {
    return {
      ok: false,
      message:
        "That postal code is outside current coverage. Use the contact form if you would like to be notified later.",
    };
  }

  if (!getService(draft.serviceSlug)) {
    return { ok: false, message: "Choose a service so we can scope the visit." };
  }

  if (draft.name.length < 2) {
    return { ok: false, message: "Please add your name." };
  }

  if (!emailPattern.test(draft.email)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  if (draft.phone.replace(/\D/g, "").length < 10) {
    return { ok: false, message: "Enter a phone number we can reach." };
  }

  // Future: insertQuoteRequest(draft) via src/lib/future/supabase.ts
  const photoCount = Number(formData.get("photoCount") ?? 0);
  const loadManifestRaw = String(formData.get("loadManifest") ?? "");
  let loadManifest: unknown = [];
  try {
    loadManifest = JSON.parse(loadManifestRaw || "[]");
  } catch {
    loadManifest = [];
  }

  // Future: insertQuoteRequest(draft) and upload photos via src/lib/future/supabase.ts
  console.info("[estimate]", {
    ...draft,
    photoCount: Number.isFinite(photoCount) ? photoCount : 0,
    loadManifest,
    area: area.city ?? area.fsa,
    tier: area.tier,
  });

  return {
    ok: true,
    message:
      "Request received. A NorthPeak coordinator will follow up with your estimate range shortly.",
  };
}
