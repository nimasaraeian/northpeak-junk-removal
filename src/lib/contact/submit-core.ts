import {
  extractPhotoFiles,
  validatePhotoFile,
  validatePhotos,
} from "@/lib/estimate/photos";
import { generateRequestId } from "@/lib/estimate/request-id";
import { formatContactPhotoCaption } from "@/lib/telegram/format-contact-message";
import { notifyContact, notifyContactPhoto } from "@/lib/telegram/notify-contact";
import type { TelegramFetch } from "@/lib/telegram/client";

export interface ContactActionState {
  ok: boolean;
  message: string;
  requestId?: string;
  photosDelivered?: boolean;
}

export interface ContactFields {
  name: string;
  email: string;
  phone: string;
  message: string;
  photoCount?: number;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SubmitContactOptions {
  fetchImpl?: TelegramFetch;
  now?: () => Date;
  createRequestId?: () => string;
}

export function parseContactFields(input: FormData | ContactFields): ContactFields {
  if (input instanceof FormData) {
    return {
      name: String(input.get("name") ?? "").trim(),
      email: String(input.get("email") ?? "").trim(),
      phone: String(input.get("phone") ?? "").trim(),
      message: String(input.get("message") ?? "").trim(),
      photoCount: Number(input.get("photoCount") ?? 0) || undefined,
    };
  }

  return {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    message: input.message.trim(),
    photoCount: input.photoCount,
  };
}

export function validateContactFields(
  fields: ContactFields,
): { ok: true; fields: ContactFields } | { ok: false; message: string } {
  if (fields.name.length < 2) {
    return { ok: false, message: "Please add your name." };
  }

  if (!emailPattern.test(fields.email)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  if (fields.message.length < 8) {
    return { ok: false, message: "Add a short message so we know how to help." };
  }

  return { ok: true, fields };
}

export async function submitContactLead(
  input: FormData | ContactFields,
  options: SubmitContactOptions = {},
): Promise<ContactActionState> {
  const parsed = parseContactFields(input);
  const validation = validateContactFields(parsed);
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const { name, email, phone, message, photoCount = 0 } = validation.fields;
  const requestId = options.createRequestId?.() ?? generateRequestId();
  const submittedAt = options.now?.() ?? new Date();

  const delivery = await notifyContact({
    context: {
      draft: { name, email, phone, message },
      requestId,
      submittedAt,
      photoCount,
    },
    photos: [],
    fetchImpl: options.fetchImpl,
  });

  if (!delivery.leadDelivered) {
    return {
      ok: false,
      message:
        "We couldn't send your message just now. Your information is still here — please try again.",
    };
  }

  return {
    ok: true,
    requestId,
    photosDelivered: photoCount === 0,
    message: "Message received. We will reply within one business day.",
  };
}

export async function submitContactPhoto(
  requestId: string,
  file: File,
  meta: { index: number; total: number },
  options: SubmitContactOptions = {},
): Promise<{ ok: boolean; message?: string }> {
  const trimmedId = requestId.trim();
  if (!trimmedId) {
    return { ok: false, message: "Missing reference for photo upload." };
  }

  const photoValidation = validatePhotoFile(file);
  if (!photoValidation.ok) {
    return { ok: false, message: photoValidation.message };
  }

  const caption = formatContactPhotoCaption(trimmedId, meta.index, meta.total);
  const delivered = await notifyContactPhoto({
    requestId: trimmedId,
    photo: photoValidation.file,
    caption,
    fetchImpl: options.fetchImpl,
  });

  if (!delivered) {
    return {
      ok: false,
      message: "One photo could not be uploaded. Your message was still received.",
    };
  }

  return { ok: true };
}

export async function submitContactCore(
  formData: FormData,
  options: SubmitContactOptions = {},
): Promise<ContactActionState> {
  const photos = extractPhotoFiles(formData);
  const photoValidation = validatePhotos(photos);
  if (!photoValidation.ok) {
    return { ok: false, message: photoValidation.message };
  }

  const parsed = parseContactFields(formData);
  parsed.photoCount = photoValidation.files.length;

  const leadResult = await submitContactLead(parsed, options);
  if (!leadResult.ok || !leadResult.requestId) {
    return leadResult;
  }

  if (photoValidation.files.length === 0) {
    return leadResult;
  }

  let failedPhotos = 0;
  for (const [index, file] of photoValidation.files.entries()) {
    const result = await submitContactPhoto(
      leadResult.requestId,
      file,
      { index: index + 1, total: photoValidation.files.length },
      options,
    );
    if (!result.ok) failedPhotos += 1;
  }

  if (failedPhotos > 0) {
    return {
      ok: true,
      requestId: leadResult.requestId,
      photosDelivered: false,
      message:
        "We received your message. Some photos may not have uploaded successfully, but our team has your contact details and will follow up.",
    };
  }

  const photoLine = `${photoValidation.files.length} photo${photoValidation.files.length === 1 ? "" : "s"} attached.`;

  return {
    ok: true,
    requestId: leadResult.requestId,
    photosDelivered: true,
    message: `Message received. We will reply within one business day. ${photoLine}`,
  };
}
