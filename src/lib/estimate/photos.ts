export const MAX_PHOTO_FILES = 8;
/** Telegram sendPhoto limit — generous for phone camera photos. */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/**
 * Client-side compression settings, applied in the browser before a photo is
 * attached (see src/lib/compress-image.ts). Phone cameras produce 2-12MB
 * images; resizing to a long edge of MAX_IMAGE_EDGE and re-encoding as JPEG
 * brings a typical shot down to a few hundred KB.
 */
export const MAX_IMAGE_EDGE = 1600;
export const IMAGE_QUALITY = 0.8;

/**
 * Combined budget for the compressed photos in one submission.
 *
 * The estimate wizard posts every photo in a single Server Action request, so
 * this has to stay inside `experimental.serverActions.bodySizeLimit` in
 * next.config.ts with room to spare for multipart overhead and text fields.
 * The contact form uploads one photo per request via /api/contact/photos, so
 * it is only bounded by MAX_PHOTO_BYTES — but it honours the same budget so
 * both forms behave alike.
 */
export const MAX_TOTAL_UPLOAD_BYTES = 4.5 * 1024 * 1024;

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function totalBytes(items: Array<{ size: number }>) {
  return items.reduce((sum, item) => sum + item.size, 0);
}

export const ALLOWED_PHOTO_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function photoFromFormDataEntry(entry: FormDataEntryValue | null): File | null {
  if (!(entry instanceof Blob) || entry.size === 0) return null;
  if (entry instanceof File) return entry;
  const blob: Blob = entry;
  const type = blob.type || "image/jpeg";
  const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
  return new File([blob], `upload.${ext}`, { type });
}

export function extractPhotoFiles(formData: FormData): File[] {
  return formData
    .getAll("photos")
    .map(photoFromFormDataEntry)
    .filter((file): file is File => file !== null);
}

export function validatePhotoFile(
  file: File,
): { ok: true; file: File } | { ok: false; message: string } {
  if (!ALLOWED_PHOTO_MIMES.has(file.type)) {
    return {
      ok: false,
      message: `"${file.name}" is not a supported image type. Use JPG, PNG, or WebP.`,
    };
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return {
      ok: false,
      message: `"${file.name}" is too large. Try a smaller image or fewer photos at once.`,
    };
  }

  return { ok: true, file };
}

export function validatePhotos(
  files: File[],
): { ok: true; files: File[] } | { ok: false; message: string } {
  if (files.length > MAX_PHOTO_FILES) {
    return {
      ok: false,
      message: `You can attach up to ${MAX_PHOTO_FILES} photos.`,
    };
  }

  for (const file of files) {
    const validation = validatePhotoFile(file);
    if (!validation.ok) return validation;
  }

  return { ok: true, files };
}
