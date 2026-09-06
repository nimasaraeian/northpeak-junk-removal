"use client";

import { useId, useRef } from "react";

export interface LocalPhoto {
  id: string;
  name: string;
  size: number;
  previewUrl: string;
}

const MAX_FILES = 8;
const MAX_BYTES = 8 * 1024 * 1024;

export function PhotoDropzone({
  photos,
  onChange,
}: {
  photos: LocalPhoto[];
  onChange: (photos: LocalPhoto[]) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;

    const next = [...photos];
    for (const file of Array.from(fileList)) {
      if (next.length >= MAX_FILES) break;
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_BYTES) continue;
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
      });
    }
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
        <p className="font-semibold text-navy">Photos of the space</p>
        <p className="mt-2">
          Drop up to {MAX_FILES} images here, or choose files. They stay on this
          device for now. In the next phase they upload to a private bucket and
          tighten the estimate range.
        </p>
        <p className="mt-3 text-xs tracking-wide text-gold-deep uppercase">
          {photos.length} / {MAX_FILES} selected · JPG or PNG · 8MB max
        </p>
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />
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
