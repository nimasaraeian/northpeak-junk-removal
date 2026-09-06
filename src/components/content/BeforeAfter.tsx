"use client";

import Image from "next/image";
import { useId, useState } from "react";

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

  return (
    <figure className="relative overflow-hidden rounded-[1.4rem] bg-navy-deep">
      <div className="relative aspect-[4/3]">
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
          className="pointer-events-none absolute inset-y-0 w-px bg-gold-glow shadow-[0_0_12px_rgba(251,178,74,0.7)]"
          style={{ left: `${value}%` }}
        />
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
        className="absolute inset-0 cursor-ew-resize opacity-0"
      />
    </figure>
  );
}
