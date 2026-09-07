"use client";

import Image from "next/image";
import { useCallback, useId, useRef, useState } from "react";

export function BeforeAfter({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  beforeLabel = "Before",
  afterLabel = "After",
  beforeCaption = "Stored years of decisions.",
  afterCaption = "A room the house can use.",
}: {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeCaption?: string;
  afterCaption?: string;
}) {
  const [value, setValue] = useState(52);
  const compareId = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect?.width) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setValue(Math.min(92, Math.max(8, pct)));
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromClientX(event.clientX);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    setFromClientX(event.clientX);
  }

  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <figure className="relative overflow-hidden rounded-[1.4rem] bg-navy-deep">
      <div
        ref={frameRef}
        className="relative aspect-[4/3] touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="group"
        aria-label="Before and after comparison. Drag to compare."
      >
        <Image
          src={beforeSrc}
          alt={beforeAlt}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${value}%)` }}
        >
          <Image
            src={afterSrc}
            alt={afterAlt}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25" />
        <p className="pointer-events-none absolute bottom-5 left-5 eyebrow text-cream">
          {beforeLabel}
        </p>
        <p className="pointer-events-none absolute top-5 left-5 max-w-[12rem] text-sm text-cream/90 drop-shadow">
          {beforeCaption}
        </p>
        <p className="pointer-events-none absolute right-5 bottom-5 eyebrow text-gold-glow">
          {afterLabel}
        </p>
        <p className="pointer-events-none absolute top-5 right-5 max-w-[12rem] text-right text-sm text-cream drop-shadow">
          {afterCaption}
        </p>

        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-gold-glow shadow-[0_0_12px_rgba(251,178,74,0.7)]"
          style={{ left: `${value}%`, transform: "translateX(-50%)" }}
        />
        <div
          className="pointer-events-none absolute top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold-glow bg-navy/85 shadow-lg backdrop-blur-sm"
          style={{ left: `${value}%` }}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 text-gold-glow">
            <path d="M8 8 4 12l4 4M16 8l4 4-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <label className="sr-only" htmlFor={compareId}>
        Compare before and after
      </label>
      <input
        id={compareId}
        type="range"
        min={8}
        max={92}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="sr-only"
        tabIndex={-1}
      />
    </figure>
  );
}
