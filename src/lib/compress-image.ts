import { IMAGE_QUALITY, MAX_IMAGE_EDGE } from "@/lib/estimate/photos";

/**
 * Browser-only image compression.
 *
 * Phone cameras produce 4-12MB JPEGs. Eight of those blow past any sane Server
 * Action body limit, so every image is resized to `MAX_IMAGE_EDGE` on its
 * longest edge and re-encoded as JPEG before it ever leaves the device.
 *
 * Only import this from client components.
 */

export interface CompressedImage {
  /** The file to upload — compressed, or the original when that was smaller. */
  file: File;
  /** Size of the file the visitor picked, for before/after copy. */
  originalSize: number;
  width: number;
  height: number;
}

function scaledSize(width: number, height: number) {
  const longestEdge = Math.max(width, height);
  if (longestEdge <= MAX_IMAGE_EDGE) return { width, height };
  const ratio = MAX_IMAGE_EDGE / longestEdge;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

async function decode(file: File): Promise<CanvasImageSource & { width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    try {
      // `from-image` applies EXIF orientation so portrait phone shots stay upright.
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Safari < 17 and some older Android browsers reject the options bag.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Could not read ${file.name}.`));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function toJpegBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", IMAGE_QUALITY);
  });
}

function jpegName(name: string) {
  return `${name.replace(/\.[^./\\]+$/, "") || "photo"}.jpg`;
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const source = await decode(file);
  const { width, height } = scaledSize(source.width, source.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser blocked image processing.");
  context.drawImage(source, 0, 0, width, height);

  const blob = await toJpegBlob(canvas);
  if ("close" in source) source.close();

  // Re-encoding a small PNG can grow it. Keep whichever is actually smaller.
  if (!blob || blob.size >= file.size) {
    return { file, originalSize: file.size, width, height };
  }

  return {
    file: new File([blob], jpegName(file.name), {
      type: "image/jpeg",
      lastModified: Date.now(),
    }),
    originalSize: file.size,
    width,
    height,
  };
}
