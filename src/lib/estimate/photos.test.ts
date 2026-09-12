import assert from "node:assert/strict";
import test from "node:test";
import {
  extractPhotoFiles,
  MAX_PHOTO_BYTES,
  MAX_PHOTO_FILES,
  validatePhotos,
} from "@/lib/estimate/photos";

function makeFile(name: string, type: string, size: number) {
  const buffer = new Uint8Array(size);
  return new File([buffer], name, { type });
}

test("validatePhotos accepts up to 8 supported images", () => {
  const files = Array.from({ length: 8 }, (_, index) =>
    makeFile(`photo-${index}.jpg`, "image/jpeg", 1024),
  );
  const result = validatePhotos(files);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.files.length, 8);
});

test("validatePhotos rejects more than 8 photos", () => {
  const files = Array.from({ length: 9 }, (_, index) =>
    makeFile(`photo-${index}.jpg`, "image/jpeg", 1024),
  );
  const result = validatePhotos(files);
  assert.equal(result.ok, false);
});

test("validatePhotos rejects oversized images", () => {
  const result = validatePhotos([
    makeFile("large.jpg", "image/jpeg", MAX_PHOTO_BYTES + 1),
  ]);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /too large/i);
});

test("validatePhotos rejects unsupported MIME types", () => {
  const result = validatePhotos([makeFile("doc.svg", "image/svg+xml", 1024)]);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /WebP/);
});

test("extractPhotoFiles reads photos field from FormData", () => {
  const formData = new FormData();
  const file = makeFile("space.jpg", "image/jpeg", 2048);
  formData.append("photos", file);
  const files = extractPhotoFiles(formData);
  assert.equal(files.length, 1);
  assert.equal(files[0]?.name, "space.jpg");
});

test("constants match product limits", () => {
  assert.equal(MAX_PHOTO_FILES, 8);
  assert.equal(MAX_PHOTO_BYTES, 10 * 1024 * 1024);
});
