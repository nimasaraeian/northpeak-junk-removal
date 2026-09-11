"use client";

import Image from "next/image";
import { loadTiers, type LoadTier } from "@/content/load-tiers";
import { northPeakTrailer } from "@/content/vehicle";

const bayVisuals = loadTiers.map((tier) => tier.visualSrc);
const { bed } = northPeakTrailer;

export function LoadBayCanvas({ tier }: { tier: LoadTier }) {
  const loadNote =
    tier.loadFillPercent > 0
      ? `${tier.loadLengthFt}′ of ${bed.lengthFt}′`
      : "Empty bay";

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-navy/8 bg-[#0a1118] sm:rounded-[2rem]">
      <div
        className="relative aspect-video w-full"
        role="img"
        aria-label={`NorthPeak truck — ${tier.label}`}
      >
        {bayVisuals.map((src) => (
          <Image
            key={src}
            alt=""
            src={src}
            fill
            unoptimized
            sizes="(min-width: 768px) 520px, 100vw"
            className="object-contain object-center transition-opacity duration-700 ease-out"
            style={{ opacity: src === tier.visualSrc ? 1 : 0 }}
            draggable={false}
            priority={src === tier.visualSrc}
          />
        ))}

        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: tier.glow * 0.18,
            background:
              "radial-gradient(ellipse 40% 35% at 55% 50%, rgba(214,118,43,0.35) 0%, transparent 70%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </div>

      <p className="border-t border-navy/8 bg-paper/95 px-4 py-2.5 text-center text-[0.72rem] text-stone">
        <span className="font-medium text-navy">
          {bed.lengthFt}′ × {bed.widthFt}′ × {bed.wallHeightFt}′
        </span>
        <span className="mx-2 text-stone-soft">·</span>
        <span className="font-medium text-[#D6762B]">{loadNote}</span>
        <span className="mx-2 text-stone-soft">·</span>
        <span>{tier.volumeRange}</span>
      </p>
    </div>
  );
}
