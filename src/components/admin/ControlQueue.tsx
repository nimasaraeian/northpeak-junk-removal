"use client";

import { useState, useTransition } from "react";
import { decideAiActionAction } from "@/lib/admin/control-actions";
import { useT } from "@/lib/i18n/provider";
import {
  AI_ACTION_KIND_LABELS,
  AI_ACTION_STATUS_LABELS,
  AI_ACTION_STATUS_TONE,
} from "@/lib/admin/control";
import type { AiActionRow } from "@/lib/db/schema";

/**
 * The owner's approval queue. Each row is a drafted action the assistant wants
 * to take; the owner approves, rejects or defers it. Approving records the
 * decision — it does not reach any outside service yet, so the card says so.
 */

function PayloadPreview({ payload }: { payload: Record<string, unknown> }) {
  const text =
    typeof payload.message === "string"
      ? payload.message
      : typeof payload.body === "string"
        ? payload.body
        : null;
  if (!text) return null;
  return (
    <blockquote className="mt-2 rounded-lg border border-[var(--ops-border)] bg-[var(--ops-surface-2)] p-3 text-sm text-[var(--ops-text)]">
      {text}
    </blockquote>
  );
}

function QueueCard({ action }: { action: AiActionRow }) {
  const { t } = useT();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const blocked = action.status === "blocked";

  function decide(decision: "approve" | "reject" | "defer") {
    setError(null);
    startTransition(async () => {
      const res = await decideAiActionAction(action.id, decision, note.trim() || undefined);
      if (!res.ok) setError(res.error ?? t("Something went wrong."));
    });
  }

  return (
    <div className="ops-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="ops-label">{t(AI_ACTION_KIND_LABELS[action.kind])}</p>
          <h3 className="mt-0.5 text-sm font-semibold text-[var(--ops-navy)]">{action.title}</h3>
        </div>
        <span className="ops-pill" data-status={AI_ACTION_STATUS_TONE[action.status]}>
          {t(AI_ACTION_STATUS_LABELS[action.status])}
        </span>
      </div>

      {action.summary ? (
        <p className="mt-1 text-sm text-[var(--ops-muted)]">{action.summary}</p>
      ) : null}

      <PayloadPreview payload={action.payload} />

      {blocked ? (
        <p className="mt-3 rounded-lg border border-[var(--ops-warn-border)] bg-[var(--ops-warn-bg)] p-2 text-xs font-medium text-[var(--ops-warn-ink)]">
          {t("Blocked")}{action.blockedReason ? `: ${action.blockedReason}` : ""}. {t("Resolve this before it can be approved.")}
        </p>
      ) : null}

      <label className="mt-3 block">
        <span className="ops-label">{t("Note (optional)")}</span>
        <input
          className="ops-input mt-1"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("e.g. send after 2pm, or why you're rejecting")}
          disabled={pending}
        />
      </label>

      {error ? <p className="mt-2 text-xs text-[var(--ops-lost-ink)]">{error}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="ops-btn"
          data-variant="primary"
          onClick={() => decide("approve")}
          disabled={pending || blocked}
          title={blocked ? t("Resolve the block first") : undefined}
        >
          {t("Approve")}
        </button>
        <button className="ops-btn" data-variant="ghost" onClick={() => decide("defer")} disabled={pending}>
          {t("Defer")}
        </button>
        <button className="ops-btn" data-variant="ghost" onClick={() => decide("reject")} disabled={pending}>
          {t("Reject")}
        </button>
      </div>
      <p className="mt-2 text-[0.7rem] text-[var(--ops-faint)]">
        {t("Approving records your decision. It does not send anything on its own — outside connections come later.")}
      </p>
    </div>
  );
}

export function ControlQueue({ actions }: { actions: AiActionRow[] }) {
  const { t } = useT();
  if (actions.length === 0) {
    return (
      <div className="ops-card p-8 text-center text-sm text-[var(--ops-muted)]">
        {t("Nothing is waiting on you. When the assistant drafts something, it appears here for approval.")}
      </div>
    );
  }
  return (
    <div className="grid gap-3">
      {actions.map((action) => (
        <QueueCard key={action.id} action={action} />
      ))}
    </div>
  );
}
