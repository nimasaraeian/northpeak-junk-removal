"use client";

import { useEffect, useId, useRef } from "react";
import { AssistantMessage } from "@/components/assistant/AssistantMessage";
import { AssistantQuickActions } from "@/components/assistant/AssistantQuickActions";
import { PeakAvatar } from "@/components/assistant/PeakAvatar";
import { site } from "@/content/site";
import type { AssistantChatMessage } from "@/lib/assistant/types";
import { cx } from "@/lib/utils";

export function AssistantPanel({
  open,
  onClose,
  messages,
  pending,
  draft,
  onDraftChange,
  onSend,
  onQuickAction,
}: {
  open: boolean;
  onClose: () => void;
  messages: AssistantChatMessage[];
  pending: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onQuickAction: (prompt: string) => void;
}) {
  const titleId = useId();
  const descId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, pending]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-end sm:justify-end sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[#1A3041]/45 backdrop-blur-[2px] sm:bg-[#1A3041]/25"
        aria-label="Close NorthPeak Assistant"
        onClick={onClose}
      />

      <div
        id="northpeak-assistant-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={cx(
          "relative flex w-full flex-col overflow-hidden border border-[#888887]/25 bg-[#EDEBE8] shadow-[0_28px_80px_-24px_rgba(26,48,65,0.55)]",
          "h-[min(100dvh,720px)] max-h-[100dvh] rounded-t-[1.5rem] pb-[env(safe-area-inset-bottom)]",
          "sm:mb-24 sm:h-[min(620px,calc(100dvh-7rem))] sm:max-h-[min(620px,calc(100dvh-7rem))] sm:w-[min(100vw-2rem,400px)] sm:rounded-[1.35rem]",
        )}
      >
        <header className="flex items-start gap-3 border-b border-[#888887]/20 bg-[#1A3041] px-4 py-4 text-[#EDEBE8] sm:px-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EDEBE8]/10 ring-1 ring-[#D6762B]/35">
            <PeakAvatar className="h-9 w-9" animated={false} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-[#D6762B] uppercase">
              AI Assistant
            </p>
            <h2 id={titleId} className="text-lg font-semibold sm:text-xl">
              Ask NorthPeak
            </h2>
            <p id={descId} className="mt-1 text-xs leading-5 text-[#EDEBE8]/75">
              {site.tagline}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EDEBE8]/15 text-[#EDEBE8]/85 transition hover:border-[#EDEBE8]/35 hover:bg-white/10"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <AssistantMessage
                role="assistant"
                content={`Hi — I'm the NorthPeak Assistant.\nI can help you figure out what we remove, whether we service your area, how estimates work, or where to go next.`}
              />
              <AssistantQuickActions disabled={pending} onSelect={onQuickAction} />
            </div>
          ) : (
            messages.map((message, index) => (
              <AssistantMessage
                key={`${message.role}-${index}`}
                role={message.role}
                content={message.content}
                actions={message._actions ?? []}
              />
            ))
          )}

          {pending ? (
            <div className="flex items-center gap-2 text-xs text-[#888887]">
              <span className="peak-assistant-typing inline-flex gap-1">
                <span />
                <span />
                <span />
              </span>
              PEAK is thinking...
            </div>
          ) : null}
        </div>

        <form
          className="border-t border-[#888887]/20 bg-white/70 px-4 py-3 sm:px-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
        >
          <label className="sr-only" htmlFor="northpeak-assistant-input">
            Ask about junk removal
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="northpeak-assistant-input"
              ref={inputRef}
              rows={1}
              value={draft}
              disabled={pending}
              placeholder="Ask about junk removal..."
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSend();
                }
              }}
              className="max-h-28 min-h-11 flex-1 resize-y rounded-2xl border border-[#888887]/25 bg-white px-3.5 py-2.5 text-sm text-[#1A3041] outline-none focus:border-[#D6762B]/55"
            />
            <button
              type="submit"
              disabled={pending || !draft.trim()}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#D6762B] px-4 text-sm font-semibold text-white transition hover:bg-[#bf6624] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
