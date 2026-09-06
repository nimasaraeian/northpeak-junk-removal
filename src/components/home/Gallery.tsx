"use client";

import { useState } from "react";
import { BeforeAfter } from "@/components/content/BeforeAfter";
import { Section } from "@/components/ui/Section";
import { galleryJobs } from "@/content/gallery";
import { cx } from "@/lib/utils";

export function Gallery() {
  const [activeId, setActiveId] = useState(galleryJobs[0]?.id ?? "");
  const job = galleryJobs.find((item) => item.id === activeId) ?? galleryJobs[0];

  if (!job) return null;

  return (
    <Section
      id="results"
      className="bg-cream"
      eyebrow="Results"
      title="Before / after"
      description="Drag the frame across each job. More published jobs land here as the crew finishes them."
    >
      <div className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="max-w-md">
          <p className="font-serif text-3xl text-navy">Real results. Brighter spaces.</p>
          <p className="mt-4 text-sm leading-7 text-stone">
            Same room, different tomorrow. Each job carries a before image, after
            image, service, and neighbourhood.
          </p>

          <div className="mt-6 flex flex-col gap-2" role="tablist" aria-label="Completed jobs">
            {galleryJobs.map((item) => {
              const selected = item.id === job.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveId(item.id)}
                  className={cx(
                    "rounded-2xl border px-4 py-3 text-left transition",
                    selected
                      ? "border-navy/25 bg-navy text-cream"
                      : "border-navy/10 bg-white/60 text-navy hover:border-navy/20",
                  )}
                >
                  <span
                    className={cx(
                      "block text-[0.65rem] font-semibold tracking-[0.16em] uppercase",
                      selected ? "text-gold-glow" : "text-stone",
                    )}
                  >
                    {item.service}
                  </span>
                  <span className="mt-1 block font-serif text-xl">{item.location}</span>
                </button>
              );
            })}
          </div>
        </div>

        <BeforeAfter
          key={job.id}
          beforeSrc={job.beforeSrc}
          afterSrc={job.afterSrc}
          beforeAlt={job.beforeAlt}
          afterAlt={job.afterAlt}
          beforeCaption={job.beforeCaption}
          afterCaption={job.afterCaption}
        />
      </div>
    </Section>
  );
}
