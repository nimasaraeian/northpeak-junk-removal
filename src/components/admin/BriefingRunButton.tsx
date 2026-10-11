"use client";

import { useState, useTransition } from "react";
import { sendBriefingNowAction } from "@/lib/office-manager/run-briefing-action";

export function BriefingRunButton() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  function run() {
    setStatus(null);
    startTransition(async () => {
      const result = await sendBriefingNowAction();
      setStatus(
        result.ok
          ? { ok: true, message: "Sent to Telegram." }
          : { ok: false, message: result.error ?? "Could not send." },
      );
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="ops-btn" onClick={run} disabled={pending}>
        {pending ? "Sending…" : "Send to Telegram now"}
      </button>
      {status ? (
        <span
          className="text-sm"
          style={{ color: status.ok ? "var(--ops-gold-ink)" : "#b4543f" }}
        >
          {status.message}
        </span>
      ) : null}
    </div>
  );
}
