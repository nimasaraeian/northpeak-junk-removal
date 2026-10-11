"use client";

import { useState, useTransition } from "react";
import {
  executeOperationAction,
  interpretCommandAction,
} from "@/lib/office-manager/command-actions";
import type { InterpretResult, ProposedOperation } from "@/lib/office-manager/command";

/**
 * Natural-language command box for the CRM.
 *
 * Type an instruction in any language → the assistant proposes ONE specific
 * change → you approve → it runs. Nothing touches the CRM before you approve,
 * and every change it makes is written to that record's timeline.
 */

type Pending =
  | { op: ProposedOperation; summary: string; command: string }
  | null;

const EXAMPLES = [
  "این لید رو ببر مرحله‌ی won",
  "برای مشتری احمدی یادداشت بذار: فردا صبح زنگ بزنیم",
  "پیگیری لید سارا رو بذار برای دوشنبه",
];

export function CommandConsole() {
  const [command, setCommand] = useState("");
  const [pending, setPending] = useState<Pending>(null);
  const [notice, setNotice] = useState<{ tone: "info" | "error" | "ok"; text: string } | null>(null);
  const [interpreting, startInterpret] = useTransition();
  const [executing, startExecute] = useTransition();

  function interpret(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setPending(null);
    setNotice(null);
    startInterpret(async () => {
      let result: InterpretResult;
      try {
        result = await interpretCommandAction(trimmed);
      } catch {
        setNotice({ tone: "error", text: "Something went wrong. Try again." });
        return;
      }
      if (result.status === "proposal") {
        setPending({ op: result.op, summary: result.summary, command: trimmed });
      } else if (result.status === "clarify") {
        setNotice({ tone: "info", text: result.message });
      } else {
        setNotice({ tone: "error", text: result.message });
      }
    });
  }

  function approve() {
    if (!pending) return;
    const { op } = pending;
    startExecute(async () => {
      let res: { ok: boolean; error?: string };
      try {
        res = await executeOperationAction(op);
      } catch {
        setNotice({ tone: "error", text: "The change couldn't be applied. Try again." });
        return;
      }
      if (res.ok) {
        setNotice({ tone: "ok", text: "Done — the change is applied and logged to the timeline." });
        setPending(null);
        setCommand("");
      } else {
        setNotice({ tone: "error", text: res.error ?? "The change was rejected." });
      }
    });
  }

  const busy = interpreting || executing;

  return (
    <div className="space-y-4">
      <div className="ops-card p-4">
        <label className="ops-label" htmlFor="cmd">
          Command
        </label>
        <textarea
          id="cmd"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") interpret(command);
          }}
          rows={3}
          dir="auto"
          placeholder="Tell the assistant what to change — in any language."
          className="mt-2 w-full resize-y rounded-xl border border-[var(--ops-border)] bg-[var(--ops-surface-2)] p-3 text-sm text-[var(--ops-navy)] outline-none focus:border-[var(--ops-gold)]"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--ops-muted)]">Nothing runs until you approve.</p>
          <button
            type="button"
            className="ops-btn"
            data-variant="primary"
            disabled={busy || !command.trim()}
            onClick={() => interpret(command)}
          >
            {interpreting ? "Reading…" : "Interpret"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              dir="auto"
              className="rounded-full border border-[var(--ops-border)] px-3 py-1 text-xs text-[var(--ops-muted)] transition-colors hover:border-[var(--ops-gold)] hover:text-[var(--ops-navy)]"
              onClick={() => {
                setCommand(ex);
                interpret(ex);
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {notice ? (
        <div
          className="ops-card p-4 text-sm"
          data-tone={notice.tone}
          dir="auto"
          style={{
            borderColor:
              notice.tone === "error"
                ? "var(--ops-danger, #c0392b)"
                : notice.tone === "ok"
                  ? "var(--ops-gold)"
                  : "var(--ops-border)",
          }}
        >
          <p className="text-[var(--ops-navy)]">{notice.text}</p>
        </div>
      ) : null}

      {pending ? (
        <div className="ops-card p-4">
          <p className="ops-label">Proposed change — not applied yet</p>
          <p className="mt-2 text-xs text-[var(--ops-muted)]" dir="auto">
            You asked: “{pending.command}”
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--ops-navy)]" dir="auto">
            {pending.summary}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              className="ops-btn"
              data-variant="primary"
              disabled={executing}
              onClick={approve}
            >
              {executing ? "Applying…" : "Approve & run"}
            </button>
            <button
              type="button"
              className="ops-btn"
              data-variant="ghost"
              disabled={executing}
              onClick={() => {
                setPending(null);
                setNotice(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
