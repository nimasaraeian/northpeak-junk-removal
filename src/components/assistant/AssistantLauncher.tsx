"use client";

import { PeakAvatar } from "@/components/assistant/PeakAvatar";
import { cx } from "@/lib/utils";

export function AssistantLauncher({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-end px-4 pb-[env(safe-area-inset-bottom)] sm:bottom-6 sm:px-6">
      <div className="pointer-events-auto relative">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={open ? "northpeak-assistant-panel" : undefined}
          className={cx(
            "peak-assistant-launcher group relative flex h-[4.25rem] w-[4.25rem] items-center justify-center sm:h-[4.75rem] sm:w-[4.75rem]",
            "rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#D6762B]",
            "hover:-translate-y-0.5",
          )}
        >
          <PeakAvatar className="relative h-[4.25rem] w-[4.25rem] sm:h-[4.75rem] sm:w-[4.75rem]" />
          <span className="sr-only">{open ? "Close NorthPeak Assistant" : "Ask NorthPeak"}</span>
          <span className="pointer-events-none absolute -top-9 right-0 hidden rounded-full bg-[#1A3041] px-2.5 py-1 text-[0.65rem] font-semibold text-[#EDEBE8] opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
            Ask NorthPeak
          </span>
        </button>
      </div>
    </div>
  );
}
