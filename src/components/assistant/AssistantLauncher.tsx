"use client";

import { PeakAvatar } from "@/components/assistant/PeakAvatar";
import { cx } from "@/lib/utils";

export function AssistantLauncher({
  open,
  showGreeting,
  onToggle,
}: {
  open: boolean;
  showGreeting: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-end px-4 pb-[env(safe-area-inset-bottom)] sm:bottom-6 sm:px-6">
      <div className="pointer-events-auto relative">
        {!open && showGreeting ? (
          <span className="peak-assistant-bubble absolute right-[calc(100%+0.65rem)] bottom-3 hidden max-w-[13rem] rounded-2xl border border-[#888887]/25 bg-white px-3.5 py-2.5 text-xs leading-5 text-[#1A3041] shadow-[0_18px_40px_-20px_rgba(26,48,65,0.45)] sm:block">
            <span className="font-semibold">Need help figuring out what you need removed?</span>
          </span>
        ) : null}

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={open ? "northpeak-assistant-panel" : undefined}
          className={cx(
            "peak-assistant-launcher group relative flex h-16 w-16 items-center justify-center rounded-[1.35rem] sm:h-[4.5rem] sm:w-[4.5rem]",
            "bg-[#EDEBE8] shadow-[0_20px_44px_-18px_rgba(26,48,65,0.55)] ring-2 ring-[#D6762B]/35 transition",
            "hover:-translate-y-0.5 hover:ring-[#D6762B]/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6762B]",
            open && "ring-[#D6762B]/70",
          )}
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-[1.35rem] bg-[radial-gradient(circle_at_50%_35%,rgb(214_118_43_/_0.14),transparent_62%)]"
            aria-hidden
          />
          <PeakAvatar className="relative h-11 w-11 sm:h-12 sm:w-12" />
          <span className="sr-only">{open ? "Close NorthPeak Assistant" : "Ask NorthPeak"}</span>
          <span className="pointer-events-none absolute -top-9 right-0 hidden rounded-full bg-[#1A3041] px-2.5 py-1 text-[0.65rem] font-semibold text-[#EDEBE8] opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
            Ask NorthPeak
          </span>
        </button>
      </div>
    </div>
  );
}
