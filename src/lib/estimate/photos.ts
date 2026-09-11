export const MAX_PHOTO_FILES = 8;
/** Telegram sendPhoto limit — generous for phone camera photos. */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export const ALLOWED_PHOTO_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function normalizeUpload(entry: FormDataEntryValue): File | null {
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
    .map(normalizeUpload)
    .filter((file): file is File => file !== null);
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
    if (file.size > MAX_PHOTO_BYTES) {
      return {
        ok: false,
        message: `"${file.name}" is too large. Try a smaller image or fewer photos at once.`,
      };
    }

    if (!ALLOWED_PHOTO_MIMES.has(file.type)) {
      return {
        ok: false,
        message: `"${file.name}" is not a supported image type. Use JPG, PNG, or WebP.`,
      };
    }
  }

  return { ok: true, files };
}
