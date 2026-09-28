"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  convertLeadToClientAction,
  logActivityAction,
  updateLeadFieldsAction,
  updateLeadStatusAction,
} from "@/lib/admin/crm-actions";
import {
  allowedTransitions,
  LEAD_STATUS_LABELS,
  leadToQuotePrefill,
  quotePrefillSearchParams,
} from "@/lib/admin/crm";
import { LEAD_OWNERS, type LeadRow, type LeadStatus } from "@/lib/db/schema";

/**
 * The lead detail action rail.
 *
 * Log call / Log SMS / Add note all write an activity row and nothing else —
 * no call is placed and no message is sent in v2. The buttons say so, and
 * the `call` and `sms` activity kinds are the seam a provider hangs off in
 * v3 without the timeline changing shape.
 */
export function LeadActions({ lead }: { lead: LeadRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<"note" | "call" | "sms">("note");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [askLost, setAskLost] = useState(false);

  function run(work: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setError(null);
    startTransition(async () => {
      const result = await work();
      if (!result.ok) {
        setError(result.error ?? "That did not save.");
        return;
      }
      setToast(success);
      window.setTimeout(() => setToast(null), 2500);
      router.refresh();
    });
  }

  function setStatus(status: LeadStatus) {
    if (status === "lost") {
      setAskLost(true);
      return;
    }
    run(() => updateLeadStatusAction(lead.id, status), `Moved to ${LEAD_STATUS_LABELS[status]}.`);
  }

  const quoteHref = `/admin/quotes/new?${quotePrefillSearchParams(leadToQuotePrefill(lead))}`;

  return (
    <div className="grid gap-4">
      <div>
        <p className="ops-label">Stage</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {allowedTransitions(lead.status).map((status) => (
            <button
              key={status}
              type="button"
              className="ops-btn"
              data-variant={status === "won" ? "primary" : "ghost"}
              disabled={pending}
              onClick={() => setStatus(status)}
            >
              {LEAD_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
        {askLost ? (
          <div className="mt-2 rounded-lg border border-[var(--ops-border)] p-2.5">
            <label className="block">
              <span className="ops-label">Why lost?</span>
              <input
                className="ops-input mt-1.5"
                value={lostReason}
                onChange={(event) => setLostReason(event.target.value)}
                placeholder="Price, timing, went elsewhere…"
              />
            </label>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="ops-btn"
                data-variant="navy"
                disabled={pending}
                onClick={() => {
                  run(
                    () => updateLeadStatusAction(lead.id, "lost", lostReason),
                    "Marked lost.",
                  );
                  setAskLost(false);
                }}
              >
                Mark lost
              </button>
              <button
                type="button"
                className="ops-btn"
                data-variant="ghost"
                onClick={() => setAskLost(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-2">
        <p className="ops-label">Convert</p>
        <a href={quoteHref} className="ops-btn" data-variant="primary">
          Convert to quote
        </a>
        <button
          type="button"
          className="ops-btn"
          data-variant="ghost"
          disabled={pending || lead.clientId !== null}
          onClick={() =>
            run(() => convertLeadToClientAction(lead.id), "Client created from this lead.")
          }
        >
          {lead.clientId ? "Already a client" : "Convert to client"}
        </button>
      </div>

      <div className="grid gap-2">
        <p className="ops-label">Assignment</p>
        <label className="block">
          <span className="sr-only">Owner</span>
          <select
            className="ops-select"
            value={lead.owner}
            disabled={pending}
            onChange={(event) =>
              run(
                () => updateLeadFieldsAction(lead.id, { owner: event.target.value }),
                "Owner updated.",
              )
            }
          >
            {LEAD_OWNERS.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="ops-label">Next follow-up</span>
          <input
            type="date"
            className="ops-input mt-1.5"
            defaultValue={
              lead.nextFollowUpAt ? lead.nextFollowUpAt.toISOString().slice(0, 10) : ""
            }
            disabled={pending}
            onChange={(event) =>
              run(
                () => updateLeadFieldsAction(lead.id, { nextFollowUpAt: event.target.value }),
                "Follow-up set.",
              )
            }
          />
        </label>
      </div>

      <div className="grid gap-2">
        <p className="ops-label">Log</p>
        <div className="flex gap-2">
          {(["note", "call", "sms"] as const).map((option) => (
            <button
              key={option}
              type="button"
              className="ops-btn flex-1"
              data-variant={kind === option ? "navy" : "ghost"}
              onClick={() => setKind(option)}
            >
              {option === "note" ? "Note" : option === "call" ? "Call" : "SMS"}
            </button>
          ))}
        </div>
        <textarea
          className="ops-textarea"
          rows={3}
          value={note}
          placeholder={
            kind === "call"
              ? "What was said on the call…"
              : kind === "sms"
                ? "What you texted them…"
                : "Anything worth remembering…"
          }
          onChange={(event) => setNote(event.target.value)}
        />
        <button
          type="button"
          className="ops-btn"
          data-variant="ghost"
          disabled={pending || note.trim().length === 0}
          onClick={() =>
            run(async () => {
              const result = await logActivityAction("lead", lead.id, kind, note);
              if (result.ok) setNote("");
              return result;
            }, "Logged.")
          }
        >
          {pending ? "Saving…" : "Add to timeline"}
        </button>
        {kind !== "note" ? (
          <p className="text-xs text-[var(--ops-faint)]">
            Records that you did it — actually sending is v3.
          </p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[var(--ops-lost-ink)]">
          {error}
        </p>
      ) : null}
      {toast ? (
        <p role="status" className="text-sm text-[var(--ops-won-ink)]">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
