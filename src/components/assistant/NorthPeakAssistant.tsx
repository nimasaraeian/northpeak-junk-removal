"use client";

import "./assistant.css";
import { useCallback, useEffect, useState } from "react";
import { AssistantLauncher } from "@/components/assistant/AssistantLauncher";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { trackAssistantEvent } from "@/lib/assistant/analytics";
import { MAX_USER_MESSAGE_LENGTH } from "@/lib/assistant/conversation";
import { resolveAssistantActions } from "@/lib/assistant/navigation";
import type {
  AssistantApiResponse,
  AssistantChatMessage,
} from "@/lib/assistant/types";

const GREETING_KEY = "northpeak-assistant-greeting-dismissed";

function readGreetingHidden() {
  if (typeof window === "undefined") return true;
  return window.sessionStorage.getItem(GREETING_KEY) === "1";
}

export function NorthPeakAssistant() {
  const [open, setOpen] = useState(false);
  const [greetingHidden, setGreetingHidden] = useState(readGreetingHidden);
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  const dismissGreeting = useCallback(() => {
    setGreetingHidden(true);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(GREETING_KEY, "1");
    }
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const sendMessage = useCallback(
    async (rawContent: string, source: "composer" | "quick_action" = "composer") => {
      const content = rawContent.trim();
      if (!content || pending) return;

      if (content.length > MAX_USER_MESSAGE_LENGTH) return;

      const nextMessages: AssistantChatMessage[] = [
        ...messages,
        { role: "user", content },
      ];

      setMessages(nextMessages);
      setDraft("");
      setPending(true);
      dismissGreeting();

      if (source === "quick_action") {
        trackAssistantEvent("assistant_quick_action");
      } else {
        trackAssistantEvent("assistant_message_sent");
      }

      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages }),
        });

        const payload = (await response.json()) as AssistantApiResponse & { error?: string };

        if (!response.ok || !payload.message) {
          throw new Error(payload.error ?? "Assistant unavailable");
        }

        const actions = resolveAssistantActions(payload.actions).map((action) => action.key);

        if (actions.includes("estimate")) {
          trackAssistantEvent("assistant_estimate_cta");
        }
        if (actions.includes("contact")) {
          trackAssistantEvent("assistant_contact_cta");
        }

        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content: payload.message,
            _actions: actions,
          },
        ]);
      } catch {
        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content:
              "Sorry — I can't answer that right now. You can still request an estimate or contact our team.",
            _actions: ["estimate", "contact"],
          },
        ]);
      } finally {
        setPending(false);
      }
    },
    [dismissGreeting, messages, pending],
  );

  return (
    <>
      <AssistantLauncher
        open={open}
        showGreeting={!greetingHidden}
        onToggle={() => {
          setOpen((value) => {
            const next = !value;
            if (next) {
              trackAssistantEvent("assistant_open");
              dismissGreeting();
            }
            return next;
          });
        }}
      />

      <AssistantPanel
        open={open}
        onClose={close}
        messages={messages}
        pending={pending}
        draft={draft}
        onDraftChange={setDraft}
        onSend={() => sendMessage(draft, "composer")}
        onQuickAction={(prompt) => sendMessage(prompt, "quick_action")}
      />
    </>
  );
}
