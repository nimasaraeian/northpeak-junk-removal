import { getService } from "@/content/services";
import { extractPhotoFiles, validatePhotos } from "@/lib/estimate/photos";
import { generateRequestId } from "@/lib/estimate/request-id";
import { checkServiceArea } from "@/lib/postal";
import { notifyEstimate } from "@/lib/telegram/notify-estimate";
import type { TelegramFetch } from "@/lib/telegram/client";
import type { EstimateDraft } from "@/types";

export interface EstimateActionState {
  ok: boolean;
  message: string;
  requestId?: string;
  photosDelivered?: boolean;
  customerName?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readString(formData: FormData, key: keyof EstimateDraft) {
  return String(formData.get(key) ?? "").trim();
}

function parseLoadManifest(raw: string): unknown {
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

export interface SubmitEstimateOptions {
  fetchImpl?: TelegramFetch;
  now?: () => Date;
  createRequestId?: () => string;
}

export async function submitEstimateCore(
  formData: FormData,
  options: SubmitEstimateOptions = {},
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

  if (!draft.description.trim()) {
    return { ok: false, message: "Tell us what needs to be removed." };
  }

  const photos = extractPhotoFiles(formData);
  const photoValidation = validatePhotos(photos);
  if (!photoValidation.ok) {
    return { ok: false, message: photoValidation.message };
  }

  const loadManifest = parseLoadManifest(String(formData.get("loadManifest") ?? ""));
  const requestId = options.createRequestId?.() ?? generateRequestId();
  const submittedAt = options.now?.() ?? new Date();

  const delivery = await notifyEstimate({
    context: {
      draft,
      requestId,
      submittedAt,
      areaCity: area.city,
      areaFsa: area.fsa,
      photoCount: photoValidation.files.length,
      loadManifest,
    },
    photos: photoValidation.files,
    fetchImpl: options.fetchImpl,
  });

  if (!delivery.leadDelivered) {
    return {
      ok: false,
      message:
        "We couldn't send your request just now. Your information is still here — please try again.",
    };
  }

  if (photoValidation.files.length > 0 && !delivery.photosDelivered) {
    return {
      ok: true,
      photosDelivered: false,
      requestId,
      customerName: draft.name,
      message:
        "We received your request. Some photos may not have uploaded successfully, but our team has your contact information and will follow up.",
    };
  }

  const photoLine =
    photoValidation.files.length > 0
      ? `${photoValidation.files.length} photo${photoValidation.files.length === 1 ? "" : "s"} attached.`
      : "";

  return {
    ok: true,
    photosDelivered: true,
    requestId,
    customerName: draft.name,
    message: [
      "Our team has received your estimate request and will review the details shortly.",
      photoLine,
    ]
      .filter(Boolean)
      .join(" "),
  };
}
