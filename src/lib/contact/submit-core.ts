import { extractPhotoFiles, validatePhotos } from "@/lib/estimate/photos";
import { generateRequestId } from "@/lib/estimate/request-id";
import { notifyContact } from "@/lib/telegram/notify-contact";
import type { TelegramFetch } from "@/lib/telegram/client";

export interface ContactActionState {
  ok: boolean;
  message: string;
  requestId?: string;
  photosDelivered?: boolean;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SubmitContactOptions {
  fetchImpl?: TelegramFetch;
  now?: () => Date;
  createRequestId?: () => string;
}

export async function submitContactCore(
  formData: FormData,
  options: SubmitContactOptions = {},
): Promise<ContactActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (name.length < 2) {
    return { ok: false, message: "Please add your name." };
  }

  if (!emailPattern.test(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  if (message.length < 8) {
    return { ok: false, message: "Add a short message so we know how to help." };
  }

  const photos = extractPhotoFiles(formData);
  const photoValidation = validatePhotos(photos);
  if (!photoValidation.ok) {
    return { ok: false, message: photoValidation.message };
  }

  const requestId = options.createRequestId?.() ?? generateRequestId();
  const submittedAt = options.now?.() ?? new Date();

  const delivery = await notifyContact({
    context: {
      draft: { name, email, phone, message },
      requestId,
      submittedAt,
      photoCount: photoValidation.files.length,
    },
    photos: photoValidation.files,
    fetchImpl: options.fetchImpl,
  });

  if (!delivery.leadDelivered) {
    return {
      ok: false,
      message:
        "We couldn't send your message just now. Your information is still here — please try again.",
    };
  }

  if (photoValidation.files.length > 0 && !delivery.photosDelivered) {
    return {
      ok: true,
      requestId,
      photosDelivered: false,
      message:
        "We received your message. Some photos may not have uploaded successfully, but our team has your contact details and will follow up.",
    };
  }

  const photoLine =
    photoValidation.files.length > 0
      ? `${photoValidation.files.length} photo${photoValidation.files.length === 1 ? "" : "s"} attached.`
      : "";

  return {
    ok: true,
    requestId,
    photosDelivered: true,
    message: ["Message received. We will reply within one business day.", photoLine]
      .filter(Boolean)
      .join(" "),
  };
}
