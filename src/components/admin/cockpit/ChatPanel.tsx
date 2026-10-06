"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Team chat tab.
 *
 * Talks to /api/admin/messages directly (not the cockpit's aggregate load), so
 * sending or receiving a message never reloads the rest of the panel. Polls
 * every few seconds for the delta since the last id it holds.
 */

interface Msg {
  id: number;
  author: string;
  body: string;
  createdAt: string;
}

const POLL_MS = 6000;

const timeFmt = new Intl.DateTimeFormat("en-CA", { hour: "2-digit", minute: "2-digit" });

export function ChatPanel({ t, operator }: { t: (s: string) => string; operator: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [ready, setReady] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const lastId = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);

  const scrollToEnd = useCallback(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const merge = useCallback((incoming: Msg[]) => {
    if (incoming.length === 0) return;
    setMsgs((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const next = [...prev];
      for (const m of incoming) if (!seen.has(m.id)) next.push(m);
      return next;
    });
    lastId.current = Math.max(lastId.current, ...incoming.map((m) => m.id));
  }, []);

  // Initial load.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/messages", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { ready: boolean; messages: Msg[] };
        if (!active) return;
        setReady(data.ready);
        merge(data.messages);
        requestAnimationFrame(scrollToEnd);
      } catch {
        // A failed load just leaves an empty thread; the poll retries.
      }
    })();
    return () => {
      active = false;
    };
  }, [merge, scrollToEnd]);

  // Poll for new messages.
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/messages?after=${lastId.current}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { ready: boolean; messages: Msg[] };
        setReady(data.ready);
        if (data.messages.length > 0) {
          merge(data.messages);
          if (atBottom.current) requestAnimationFrame(scrollToEnd);
        }
      } catch {
        // Ignore a dropped poll; the next tick retries.
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [merge, scrollToEnd]);

  const send = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? t("Could not send."));
        return;
      }
      setInput("");
      merge([data.message as Msg]);
      requestAnimationFrame(scrollToEnd);
    } catch {
      setError(t("Could not send."));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card chat">
      {!ready ? (
        <div className="empty">
          {t("Team chat isn't set up yet — run the 0003 migration in Neon, then reload.")}
        </div>
      ) : (
        <div
          className="chat-log"
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
          }}
        >
          {msgs.length === 0 ? (
            <div className="empty">{t("No messages yet. Say hello to the team.")}</div>
          ) : (
            msgs.map((m) => {
              const mine = m.author === operator;
              return (
                <div key={m.id} className={`msg${mine ? " mine" : ""}`}>
                  <div className="bubble">
                    {!mine ? <span className="who">{m.author}</span> : null}
                    <span className="txt">{m.body}</span>
                    <span className="when">{timeFmt.format(new Date(m.createdAt))}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="chat-compose">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          placeholder={t("Message the team…")}
        />
        <button className="btn p" onClick={() => void send()} disabled={sending || !input.trim()}>
          {sending ? t("Sending…") : t("Send")}
        </button>
      </div>
      {error ? <div className="chat-err">{error}</div> : null}
    </div>
  );
}
