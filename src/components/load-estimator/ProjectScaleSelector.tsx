"use client";

import { loadTiers, type LoadTierId } from "@/content/load-tiers";
import { cx } from "@/lib/utils";

export function ProjectScaleSelector({
  tierId,
  onSelect,
}: {
  tierId: LoadTierId;
  onSelect: (id: LoadTierId) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-center text-sm font-medium text-stone sm:mb-4">
        Select a load size
      </p>
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
        role="tablist"
        aria-label="Load size examples"
      >
        {loadTiers.map((tier) => {
          const selected = tier.id === tierId;
          return (
            <button
              key={tier.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSelect(tier.id)}
              className={cx(
                "rounded-2xl border px-3 py-3 text-left transition duration-300 sm:px-4 sm:py-3.5",
                selected
                  ? "border-[#D6762B] bg-[#EDEBE8] shadow-[0_6px_20px_rgba(214,118,43,0.1)]"
                  : "border-navy/10 bg-white hover:border-navy/18",
              )}
            >
              <span className="block text-sm font-semibold leading-tight text-navy">
                {tier.tabRange}
              </span>
              <span className="mt-1 block text-xs text-stone">{tier.tabSubtitle}</span>
              <span className="mt-2.5 block h-1 overflow-hidden rounded-full bg-navy/8" aria-hidden>
                <span
                  className="block h-full rounded-full bg-[#D6762B] transition-[width] duration-500"
                  style={{ width: `${tier.loadFillPercent}%` }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
