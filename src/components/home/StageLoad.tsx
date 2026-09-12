"use client";

import { LoadBayStudio } from "@/components/load-estimator/LoadBayStudio";
import { Section } from "@/components/ui/Section";

export function StageLoad() {
  return (
    <Section
      id="stage-the-load"
      width="wide"
      className="bg-cream py-12 sm:py-20 md:py-28"
      eyebrow="How we size the load"
      title="See what fits in the truck"
      description="Pick a load size. The same truck fills from the front of the bay toward the rear."
    >
      <LoadBayStudio />
    </Section>
  );
}
