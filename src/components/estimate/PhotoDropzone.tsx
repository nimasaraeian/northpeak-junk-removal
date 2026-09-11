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

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <rect
        x="8"
        y="28"
        width="32"
        height="12"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M24 8v20M24 8l-7 7M24 8l7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 34h20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 4"
        opacity="0.55"
      />
    </svg>
  );
}

export function PhotoDropzone({
  photos,
  onChange,
  title = "Add photos",
  description = "Photos help us understand the job and provide a more accurate estimate.",
  hint,
}: {
  photos: LocalPhoto[];
  onChange: (photos: LocalPhoto[]) => void;
  title?: string;
  description?: string;
  hint?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
        rejections.push(`"${file.name}" is too large. Try a smaller image.`);
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
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={[
          "group block cursor-pointer rounded-2xl border-2 border-dashed px-5 py-8 text-center transition",
          isDragging
            ? "border-gold bg-gold/10 shadow-[inset_0_0_0_1px_rgba(201,162,39,0.25)]"
            : "border-navy/15 bg-cream/70 hover:border-gold/45 hover:bg-cream",
        ].join(" ")}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-gold-deep shadow-sm ring-1 ring-navy/5 transition group-hover:scale-[1.02]">
          <UploadIcon className="h-9 w-9" />
        </div>

        <p className="mt-4 text-base font-semibold text-navy">{title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone">
          {description}
        </p>

        <p className="mt-4 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-navy ring-1 ring-navy/10">
          {isDragging ? "Drop photos here" : "Drag & drop photos here, or click to browse"}
        </p>

        <p className="mt-3 text-xs leading-5 text-stone">
          {hint ??
            `Up to ${MAX_PHOTO_FILES} photos · JPG, PNG, or WebP`}
        </p>

        {photos.length > 0 ? (
          <p className="mt-2 text-xs font-medium text-gold-deep">
            {photos.length} photo{photos.length === 1 ? "" : "s"} selected
          </p>
        ) : null}
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
            <li key={photo.id} className="relative overflow-hidden rounded-xl bg-navy shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt={photo.name}
                className="aspect-square w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1.5 right-1.5 rounded-full bg-navy/85 px-2.5 py-1 text-[0.65rem] font-medium text-cream backdrop-blur-sm transition hover:bg-navy"
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
