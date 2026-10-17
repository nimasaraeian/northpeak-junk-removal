"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logCallAction } from "@/lib/admin/sales-actions";
import {
  BUSINESS_HOURS,
  CALL_FLAG_LABELS,
  CALL_FLAGS,
  CALL_OUTCOME_LABELS,
  CALL_OUTCOMES,
  defaultFollowUp,
  readCallNote,
  type CallFlag,
  type CallOutcome,
} from "@/lib/admin/sales";
import { LEAD_STATUS_LABELS } from "@/lib/admin/crm";
import type { LeadStatus } from "@/lib/db/schema";
import { useT } from "@/lib/i18n/provider";

const when = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_HOURS.timeZone,
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/**
 * Log a call in three taps: pick what happened, type a line, save.
 *
 * As the note is typed it is read for an outcome ("no answer", "booked"),
 * flags ("too expensive", "got another quote") and a day ("call Friday").
 * Suggestions show as dashed chips and are used unless the operator picks
 * something else, so a miss costs a click and never a wrong record. The next
 * call date is filled in from the outcome and can be changed before saving.
 */
export function LogCallForm({
  leadId,
  clientId,
  onSaved,
}: {
  leadId?: number;
  clientId?: number;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [picked, setPicked] = useState<CallOutcome | null>(null);
  const [flagsOn, setFlagsOn] = useState<CallFlag[]>([]);
  const [flagsOff, setFlagsOff] = useState<CallFlag[]>([]);
  const [followUpInput, setFollowUpInput] = useState("");
  const [lostReason, setLostReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const reading = useMemo(() => readCallNote(notes, new Date()), [notes]);
  const outcome = picked ?? reading.outcome;
  const flags = CALL_FLAGS.filter(
    (f) => !flagsOff.includes(f) && (flagsOn.includes(f) || reading.flags.includes(f)),
  );
  const autoFollowUp = outcome ? reading.followUp ?? defaultFollowUp(outcome, new Date()) : null;
  const followUp = followUpInput ? new Date(followUpInput) : autoFollowUp;

  function toggleFlag(flag: CallFlag) {
    const active = flags.includes(flag);
    setFlagsOn((on) => (active ? on.filter((f) => f !== flag) : [...on, flag]));
    setFlagsOff((off) => (active ? [...off, flag] : off.filter((f) => f !== flag)));
  }

  function reset() {
    setNotes("");
    setPicked(null);
    setFlagsOn([]);
    setFlagsOff([]);
    setFollowUpInput("");
    setLostReason("");
  }

  function save() {
    if (!outcome) {
      setError(t("Pick what happened on the call."));
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await logCallAction({
        leadId,
        clientId,
        outcome,
        notes,
        flags,
        nextFollowUpAt: followUp ? followUp.toISOString() : "",
        lostReason: lostReason || undefined,
      });
      if (!result.ok) {
        setError(result.error ?? t("That did not save."));
        return;
      }
      const parts = [t("Call saved.")];
      if (result.statusChangedTo) {
        parts.push(`${t("Moved to")} ${t(LEAD_STATUS_LABELS[result.statusChangedTo as LeadStatus])}.`);
      }
      if (result.nextFollowUpAt) parts.push(`${t("Next call")}: ${when.format(new Date(result.nextFollowUpAt))}`);
      setToast(parts.join(" "));
      window.setTimeout(() => setToast(null), 4000);
      reset();
      onSaved?.();
      router.refresh();
    });
  }

  return (
    <div className="grid gap-3">
      <div>
        <p className="ops-label">{t("What happened?")}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CALL_OUTCOMES.map((o) => (
            <button
              key={o}
              type="button"
              className="ops-chip"
              aria-pressed={outcome === o}
              data-suggested={!picked && reading.outcome === o}
              onClick={() => setPicked(picked === o ? null : o)}
            >
              {t(CALL_OUTCOME_LABELS[o])}
            </button>
          ))}
        </div>
      </div>

      <label className="grid gap-1">
        <span className="ops-label">{t("Notes")}</span>
        <textarea
          className="ops-textarea"
          rows={3}
          value={notes}
          maxLength={4000}
          placeholder={t("e.g. Thinks it's too expensive, comparing quotes — call Friday")}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      <div>
        <p className="ops-label">{t("Flags")}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CALL_FLAGS.map((f) => (
            <button
              key={f}
              type="button"
              className="ops-chip"
              aria-pressed={flags.includes(f)}
              data-suggested={reading.flags.includes(f) && !flagsOn.includes(f)}
              onClick={() => toggleFlag(f)}
            >
              {t(CALL_FLAG_LABELS[f])}
            </button>
          ))}
        </div>
      </div>

      {outcome === "not_interested" ? (
        <label className="grid gap-1">
          <span className="ops-label">{t("Why not? (saved as the lost reason)")}</span>
          <input
            className="ops-input"
            value={lostReason}
            maxLength={400}
            placeholder={t("e.g. Went with a cheaper company")}
            onChange={(e) => setLostReason(e.target.value)}
          />
        </label>
      ) : null}

      <label className="grid gap-1">
        <span className="ops-label">{t("Next call")}</span>
        <input
          type="datetime-local"
          className="ops-input"
          value={followUpInput}
          onChange={(e) => setFollowUpInput(e.target.value)}
        />
        <span className="text-xs text-[var(--ops-muted)]">
          {followUp
            ? `${followUpInput ? t("Set by you") : t("Suggested")}: ${when.format(followUp)}`
            : outcome
              ? t("No follow-up needed")
              : t("Pick an outcome to suggest a time")}
        </span>
      </label>

      <button type="button" className="ops-btn" data-variant="primary" disabled={pending} onClick={save}>
        {pending ? t("Saving…") : t("Save call")}
      </button>

      {error ? <p className="text-sm text-[var(--ops-lost-ink)]">{error}</p> : null}
      {toast ? (
        <p role="status" className="text-sm text-[var(--ops-won-ink)]">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
