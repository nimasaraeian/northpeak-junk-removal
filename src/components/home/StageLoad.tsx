"use client";

import { useState } from "react";
import Link from "next/link";
import { TruckVolumePad } from "@/components/estimate/TruckVolumePad";
import { Section } from "@/components/ui/Section";
import { summarizeVolume } from "@/lib/volume";

export function StageLoad() {
  const [levelId, setLevelId] = useState("empty");
  const load = summarizeVolume(levelId);

  return (
    <Section
      id="stage-the-load"
      width="wide"
      className="bg-cream py-12 sm:py-20 md:py-28"
      eyebrow="The load bay"
      title="Fill the truck"
      description="Drag to rotate the truck. Tap a fill level — cab-over dump box and controls stay together."
    >
      <TruckVolumePad levelId={levelId} onChange={setLevelId} />
      <p className="mt-4 text-sm text-stone">
        {load.cubicFeet > 0 ? (
          <>
            {load.volumeLabel} · {load.visitLabel}.{" "}
            <Link href="/estimate" className="font-semibold text-navy underline-offset-2 hover:underline">
              Continue to estimate →
            </Link>
          </>
        ) : (
          <>
            Spin it, fill it, then{" "}
            <Link href="/estimate" className="font-semibold text-navy underline-offset-2 hover:underline">
              send the range →
            </Link>
          </>
        )}
      </p>
    </Section>
  );
}
