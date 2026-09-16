"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * The assistant is a floating launcher that nobody taps in the first seconds of
 * a visit, but its bundle (panel, conversation state, stylesheet, sticker art)
 * was loading with the page and hydrating on every route. Splitting it out and
 * mounting it once the browser is idle keeps it off the critical path.
 */
const NorthPeakAssistant = dynamic(
  () => import("@/components/assistant/NorthPeakAssistant").then((m) => m.NorthPeakAssistant),
  { ssr: false },
);

export function AssistantMount() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Fall back to a short timeout where requestIdleCallback is unavailable
    // (Safari below 17).
    if (typeof window.requestIdleCallback !== "function") {
      const timer = window.setTimeout(() => setReady(true), 1500);
      return () => window.clearTimeout(timer);
    }

    const handle = window.requestIdleCallback(() => setReady(true), { timeout: 3000 });
    return () => window.cancelIdleCallback(handle);
  }, []);

  if (!ready) return null;

  return <NorthPeakAssistant />;
}
