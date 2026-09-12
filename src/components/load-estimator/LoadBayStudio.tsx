"use client";

import { useState } from "react";
import { LoadBayCanvas } from "@/components/load-estimator/LoadBayCanvas";
import { ProjectScaleSelector } from "@/components/load-estimator/ProjectScaleSelector";
import { ProjectStoryPanel } from "@/components/load-estimator/ProjectStoryPanel";
import {
  defaultLoadTierId,
  getLoadTier,
  resolveLoadTierId,
  type LoadTierId,
} from "@/content/load-tiers";

export function LoadBayStudio({
  initialTier = defaultLoadTierId,
  tierId: controlledTierId,
  levelId,
  showCta = true,
  onTierChange,
  onLevelChange,
}: {
  initialTier?: LoadTierId;
  tierId?: LoadTierId;
  levelId?: string;
  compact?: boolean;
  showCta?: boolean;
  onTierChange?: (id: LoadTierId) => void;
  onLevelChange?: (id: LoadTierId) => void;
}) {
  const seed = controlledTierId ?? (levelId ? resolveLoadTierId(levelId) : initialTier);
  const [internalTierId, setInternalTierId] = useState<LoadTierId>(seed);
  const tierId = controlledTierId ?? internalTierId;
  const tier = getLoadTier(tierId);

  function handleSelect(id: LoadTierId) {
    if (!controlledTierId) setInternalTierId(id);
    onTierChange?.(id);
    onLevelChange?.(id);
  }

  return (
    <div className="overflow-x-hidden rounded-[1.5rem] border border-navy/8 bg-paper shadow-[var(--shadow-card)] sm:rounded-[1.85rem]">
      <div className="border-b border-navy/8 px-4 py-5 sm:px-8 sm:py-7">
        <ProjectScaleSelector tierId={tierId} onSelect={handleSelect} />
      </div>

      <div className="grid gap-6 p-4 sm:gap-8 sm:p-8 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-center lg:gap-10 lg:p-10">
        <div className="order-1 min-w-0 lg:order-2">
          <LoadBayCanvas tier={tier} />
        </div>
        <div className="order-2 min-w-0 lg:order-1">
          <ProjectStoryPanel tier={tier} showCta={showCta} />
        </div>
      </div>
    </div>
  );
}
