"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/compress-image";
import { MAX_IMAGES, type VisionSuggestion } from "@/lib/admin/vision";

/**
 * Photo assist panel.
 *
 * Photos are compressed in the browser, sent as base64, analysed, and
 * dropped. Nothing is stored — there is no blob storage in v1 — so the
 * previews here live only as object URLs for this page view.
 *
 * Suggestions go to `onSuggestions` as editable rows. This component never
 * prices anything and never writes to the quote directly.
 */

export interface VisionOverall {
  complexJob: boolean;
  reason: string;
}

interface Preview {
  url: string;
  name: string;
  mediaType: string;
  base64: string;
}

async function toBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  // Chunked, because spreading a multi-megabyte array into String.fromCharCode
  // overflows the argument limit on large photos.
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function PhotoAssist({
  onSuggestions,
}: {
  onSuggestions: (items: VisionSuggestion[], overall: VisionOverall) => void;
}) {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [status, setStatus] = useState<"idle" | "reading" | "analysing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [complex, setComplex] = useState<VisionOverall | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setComplex(null);
    setStatus("reading");

    try {
      const picked = Array.from(fileList).slice(0, MAX_IMAGES - previews.length);
      const next: Preview[] = [];
      for (const file of picked) {
        const compressed = await compressImage(file);
        next.push({
          url: URL.createObjectURL(compressed.file),
          name: file.name,
          mediaType: compressed.file.type || "image/jpeg",
          base64: await toBase64(compressed.file),
        });
      }
      setPreviews((current) => [...current, ...next].slice(0, MAX_IMAGES));
    } catch {
      setError("Those photos could not be read on this device.");
    } finally {
      setStatus("idle");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    setPreviews((current) => {
      const target = current[index];
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((_, i) => i !== index);
    });
  }

  async function analyse() {
    if (previews.length === 0) return;
    setStatus("analysing");
    setError(null);
    setComplex(null);

    try {
      const response = await fetch("/api/admin/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: previews.map((preview) => ({
            mediaType: preview.mediaType,
            data: preview.base64,
          })),
        }),
      });

      const payload = (await response.json()) as {
        items?: VisionSuggestion[];
        overall?: VisionOverall;
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Photo assist failed.");
        return;
      }

      const overall = payload.overall ?? { complexJob: false, reason: "" };
      if (overall.complexJob) setComplex(overall);
      onSuggestions(payload.items ?? [], overall);
    } catch {
      setError("Could not reach photo assist.");
    } finally {
      setStatus("idle");
    }
  }

  const busy = status !== "idle";

  return (
    <section className="ops-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">Photos</h2>
        <span className="text-xs text-[var(--ops-faint)]">
          {previews.length}/{MAX_IMAGES} · not saved
        </span>
      </div>
      <p className="mt-1 text-xs leading-5 text-[var(--ops-muted)]">
        Suggestions land in the item list as editable rows. Nothing is priced until you confirm
        it.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {previews.map((preview, index) => (
          <div key={preview.url} className="relative overflow-hidden rounded-lg border border-[var(--ops-border)]">
            {/* Local object URL for a photo we never upload to our own storage;
                next/image would add nothing but a loader. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.url} alt={preview.name} className="h-24 w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white"
              aria-label={`Remove ${preview.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <label className="ops-btn cursor-pointer" data-variant="ghost">
          Add photos
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={busy || previews.length >= MAX_IMAGES}
            onChange={(event) => void handleFiles(event.target.files)}
          />
        </label>
        <button
          type="button"
          className="ops-btn"
          data-variant="navy"
          disabled={busy || previews.length === 0}
          onClick={() => void analyse()}
        >
          {status === "analysing" ? "Reading photos…" : "Suggest items"}
        </button>
      </div>

      {complex ? (
        <p
          role="status"
          className="mt-3 rounded-lg border border-[var(--ops-warn-border)] bg-[var(--ops-warn-bg)] px-3 py-2 text-sm leading-6 text-[var(--ops-warn-ink)]"
        >
          <strong>Complex job — price manually.</strong>{" "}
          {complex.reason || "These photos need a person to look at them."}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 text-sm text-[var(--ops-lost-ink)]">
          {error}
        </p>
      ) : null}
    </section>
  );
}
