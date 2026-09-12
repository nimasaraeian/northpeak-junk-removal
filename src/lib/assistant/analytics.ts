import type { AssistantAnalyticsEvent } from "@/lib/assistant/types";

export function trackAssistantEvent(event: AssistantAnalyticsEvent, detail?: string) {
  if (process.env.NODE_ENV === "development") {
    console.info("[assistant-analytics]", event, detail ?? "");
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("northpeak-assistant", {
        detail: { event, detail },
      }),
    );
  }
}
