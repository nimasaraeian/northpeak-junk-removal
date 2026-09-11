"use client";

import { useId, useRef, useState } from "react";
import {
  ALLOWED_PHOTO_MIMES,
  MAX_PHOTO_BYTES,
  MAX_PHOTO_FILES,
} from "@/lib/estimate/photos";

export interface LocalPhoto {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
}

export function PhotoDropzone({
  photos,
  onChange,
}: {
  photos: LocalPhoto[];
  onChange: (photos: LocalPhoto[]) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;

    const next = [...photos];
    const rejections: string[] = [];

    for (const file of Array.from(fileList)) {
      if (next.length >= MAX_PHOTO_FILES) {
        rejections.push(`You can add up to ${MAX_PHOTO_FILES} photos.`);
        break;
      }

      if (!ALLOWED_PHOTO_MIMES.has(file.type)) {
        rejections.push(`"${file.name}" is not supported. Use JPG, PNG, or WebP.`);
        continue;
      }

      if (file.size > MAX_PHOTO_BYTES) {
        rejections.push(`"${file.name}" is larger than 8 MB.`);
        continue;
      }

      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setNotice(rejections.length > 0 ? rejections.join(" ") : null);
    onChange(next);
  }

  function removePhoto(id: string) {
    const match = photos.find((photo) => photo.id === id);
    if (match) URL.revokeObjectURL(match.previewUrl);
    onChange(photos.filter((photo) => photo.id !== id));
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
        className="block cursor-pointer rounded-2xl border border-dashed border-navy/15 bg-cream/70 px-4 py-6 text-sm text-stone transition hover:border-gold/50"
      >
        <p className="font-semibold text-navy">Add photos</p>
        <p className="mt-2">
          Photos help us understand the job and provide a more accurate estimate.
        </p>
        <p className="mt-2 text-xs leading-5 text-stone">
          Add up to {MAX_PHOTO_FILES} photos of the items or space you want cleared.
        </p>
        <p className="mt-3 text-xs tracking-wide text-gold-deep uppercase">
          {photos.length} / {MAX_PHOTO_FILES} selected · JPG, PNG, or WebP · 8MB max
        </p>
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      {notice ? <p className="mt-3 text-sm text-gold-deep">{notice}</p> : null}
      {photos.length > 0 ? (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <li key={photo.id} className="relative overflow-hidden rounded-xl bg-navy">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt={photo.name}
                className="aspect-square w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 rounded-full bg-navy/80 px-2 py-0.5 text-[0.65rem] text-cream"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
