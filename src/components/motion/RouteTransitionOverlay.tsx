"use client";

import type { TransitionPhase } from "@/components/motion/PageTransitionProvider";

export function RouteTransitionOverlay({
  phase,
}: {
  phase: TransitionPhase;
}) {
  const active = phase !== "idle";

  return (
    <div
      aria-hidden="true"
      data-active={active ? "true" : "false"}
      data-phase={phase}
      className="page-transition-overlay fixed inset-0 z-[var(--page-transition-z)]"
    >
      <div className="page-transition-doorway">
        <div className="page-transition-panel page-transition-panel--left" />
        <div className="page-transition-glow" />
        <div className="page-transition-panel page-transition-panel--right" />
      </div>
    </div>
  );
}
