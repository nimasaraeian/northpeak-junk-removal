"use client";

import { TransitionLink } from "@/components/motion/TransitionLink";
import { processSteps } from "@/content/site";
import { Section } from "@/components/ui/Section";

function StepIcon({ step }: { step: string }) {
  const common = "h-8 w-8 stroke-[1.4] text-navy";
  if (step === "01") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common} aria-hidden>
        <rect x="7" y="2.5" width="10" height="19" rx="2" />
        <path d="M10 5.5h4M10 18.5h4" />
        <circle cx="14.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (step === "02") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common} aria-hidden>
        <path d="M7 3.5h7l3 3V20.5H7V3.5Z" />
        <path d="M14 3.5v3h3M9.5 11h5M9.5 14.5h5M9.5 18h3.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common} aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M4 10h16" />
      <path d="M8.5 14h.01M12 14h.01M15.5 14h.01M8.5 17h.01M12 17h.01" />
    </svg>
  );
}

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      className="bg-paper pt-14 sm:pt-20"
      eyebrow="The process"
      title="How It Works"
      description="Three steps. Clear range. No theatre before anyone arrives."
      action={
        <TransitionLink href="/how-it-works" className="text-sm font-semibold text-navy">
          See the full process →
        </TransitionLink>
      }
    >
      <ol className="grid gap-8 md:grid-cols-3 md:gap-4 lg:gap-6">
        {processSteps.map((item, index) => (
          <li key={item.step} className="relative flex gap-4 md:flex-col md:items-start md:gap-0">
            {index < processSteps.length - 1 ? (
              <span
                className="pointer-events-none absolute top-5 left-[2.65rem] hidden h-px w-[calc(100%-1rem)] bg-stone-soft/70 md:block"
                aria-hidden
              />
            ) : null}

            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-navy-deep shadow-[0_8px_20px_-10px_rgba(208,137,43,0.9)]">
              {item.step.replace(/^0/, "")}
            </div>

            <div className="min-w-0 pt-0.5 md:mt-5 md:pt-0">
              <div className="mb-3 hidden md:block">
                <StepIcon step={item.step} />
              </div>
              <h3 className="text-xl font-semibold text-navy sm:text-2xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-stone">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
