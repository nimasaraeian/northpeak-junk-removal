"use client";

import { Button } from "@/components/ui/Button";
import type { LoadTier } from "@/content/load-tiers";
import { persistLoadTier } from "@/lib/load-estimator";

export function ProjectStoryPanel({
  tier,
  showCta = true,
}: {
  tier: LoadTier;
  showCta?: boolean;
}) {
  return (
    <div className="flex h-full flex-col justify-center">
      <h3 className="font-serif text-2xl leading-tight text-navy sm:text-[1.9rem]">
        {tier.label}
      </h3>
      <p className="mt-3 text-lg leading-relaxed text-ink/90">{tier.tagline}</p>
      <p className="mt-3 text-sm font-medium text-stone">{tier.approxLine}</p>

      <p className="mt-6 text-sm font-semibold text-navy">This load size is great for:</p>
      <ul className="mt-3 space-y-2.5">
        {tier.greatFor.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mt-0.5 h-4 w-4 shrink-0 text-[#D6762B]"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 0 1 0 1.42l-7.25 7.25a1 1 0 0 1-1.42 0l-3.25-3.25a1 1 0 1 1 1.42-1.42l2.54 2.54 6.54-6.54a1 1 0 0 1 1.42 0Z"
                clipRule="evenodd"
              />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs leading-relaxed text-stone">
        {tier.visitFeel}
        {tier.volumeRange ? ` · ${tier.volumeRange}` : null}
      </p>

      {showCta ? (
        <div className="mt-8">
          <Button
            href={`/estimate?load=${tier.id}`}
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => persistLoadTier(tier.id)}
          >
            Get My Estimate
          </Button>
        </div>
      ) : null}
    </div>
  );
}
