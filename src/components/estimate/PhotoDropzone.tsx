"use client";

import { useId, useRef, useState } from "react";
import {
  MAX_PHOTO_FILES,
  validatePhotoFile,
} from "@/lib/estimate/photos";

export interface LocalPhoto {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  valid: boolean;
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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M5 10.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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

      const validation = validatePhotoFile(file);
      if (!validation.ok) {
        rejections.push(validation.message);
        continue;
      }

      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file: validation.file,
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
        valid: true,
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
          {hint ?? `Up to ${MAX_PHOTO_FILES} photos · JPG, PNG, or WebP`}
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
            <li key={photo.id} className="relative overflow-visible">
              <div className="relative overflow-hidden rounded-xl bg-navy shadow-sm ring-1 ring-navy/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt={photo.name}
                  className="aspect-square w-full object-cover"
                />

                {photo.valid ? (
                  <span
                    className="absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
                    title="Ready to send"
                    aria-label="Photo ready to send"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-navy text-cream shadow-md ring-2 ring-white transition hover:bg-gold-deep"
                aria-label={`Remove ${photo.name}`}
                title="Remove photo"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
