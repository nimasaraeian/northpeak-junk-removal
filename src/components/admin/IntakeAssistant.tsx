"use client";

import { useState, useTransition } from "react";
import { createAiActionAction } from "@/lib/admin/control-actions";
import { GuardrailNote } from "@/components/admin/GuardrailNote";
import { GUARDRAILS } from "@/lib/admin/control";
import type { IntakeResult } from "@/lib/admin/intake";

/**
 * Reads a lead's inbound message and surfaces the stated facts plus a drafted
 * clarifying question. The operator can send that question to the approval
 * queue — it does not go to the customer until the owner approves it there.
 */
export function IntakeAssistant({
  leadId,
  message,
  leadName,
}: {
  leadId: number;
  message: string;
  leadName: string;
}) {
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [pending, startTransition] = useTransition();

  async function analyze() {
    setError(null);
    setQueued(false);
    setAnalyzing(true);
    try {
      const res = await fetch("/api/admin/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Intake assist failed.");
        return;
      }
      setResult(data as IntakeResult);
      setQuestion((data as IntakeResult).clarifyingQuestion ?? "");
    } catch {
      setError("Could not reach the assistant.");
    } finally {
      setAnalyzing(false);
    }
  }

  function queueQuestion() {
    setError(null);
    startTransition(async () => {
      const res = await createAiActionAction({
        kind: "send_message",
        title: `Ask ${leadName || "the customer"} a clarifying question`,
        summary: "Drafted from the inbound message by the intake assistant.",
        payload: { message: question },
        entityType: "lead",
        entityId: leadId,
      });
      if (res.ok) setQueued(true);
      else setError(res.error ?? "Could not queue the question.");
    });
  }

  if (!message.trim()) {
    return (
      <div className="ops-card p-4 text-sm text-[var(--ops-muted)]">
        No inbound message on this lead to read.
      </div>
    );
  }

  return (
    <div className="ops-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">Intake assistant</h2>
        <button className="ops-btn" data-variant="navy" onClick={analyze} disabled={analyzing}>
          {analyzing ? "Reading…" : result ? "Re-read message" : "Read message"}
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-xs text-[var(--ops-lost-ink)]">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-3 grid gap-3">
          {result.items.length > 0 ? (
            <div>
              <p className="ops-label">Items mentioned</p>
              <ul className="mt-1 grid gap-1 text-sm">
                {result.items.map((item, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span>{item.label}</span>
                    <span className="ops-num text-[var(--ops-muted)]">
                      {item.qty === null ? "qty not stated" : `×${item.qty}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <dl className="grid gap-1 text-sm">
            <Row label="Address" value={result.address} />
            <Row label="Access" value={result.access} />
            <Row label="Preferred time" value={result.preferredTime} />
          </dl>

          <div>
            <p className="ops-label">Weight / volume</p>
            <p className="text-sm font-medium text-[var(--ops-navy)]">
              Not estimated — confirmed on site by a person.
            </p>
          </div>

          <div>
            <p className="ops-label">Draft question for the customer</p>
            <textarea
              className="ops-textarea mt-1"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                className="ops-btn"
                data-variant="primary"
                onClick={queueQuestion}
                disabled={pending || queued || !question.trim()}
              >
                {queued ? "Added to approval queue ✓" : "Send to approval queue"}
              </button>
              {queued ? (
                <span className="text-xs text-[var(--ops-muted)]">
                  It will only reach the customer once approved on the Control page.
                </span>
              ) : null}
            </div>
          </div>

          <GuardrailNote lines={[GUARDRAILS.noWeightGuess, GUARDRAILS.nothingUntilApproved]} />
        </div>
      ) : (
        <p className="mt-2 text-sm text-[var(--ops-muted)]">
          Pull the stated facts out of the customer's message and draft a question for anything
          missing. The assistant never guesses weight or volume.
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--ops-muted)]">{label}</dt>
      <dd className={value ? "text-[var(--ops-text)]" : "text-[var(--ops-faint)]"}>
        {value || "not stated"}
      </dd>
    </div>
  );
}
