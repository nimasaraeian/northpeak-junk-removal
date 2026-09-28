"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createJobAction, logActivityAction } from "@/lib/admin/crm-actions";
import { reviewSmsText } from "@/lib/admin/crm";
import type { ClientRow } from "@/lib/db/schema";

/**
 * Client profile actions.
 *
 * "Send review SMS" builds the message and copies it — nothing is sent in
 * v2. Copying still logs an `sms` activity row, so the timeline records that
 * a review was asked for even while the sending is manual.
 */
export function ClientActions({
  client,
  reviewUrl,
}: {
  client: ClientRow;
  /** The g.page short link from site config; null when unset. */
  reviewUrl: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [note, setNote] = useState("");

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  function run(work: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setError(null);
    startTransition(async () => {
      const result = await work();
      if (!result.ok) {
        setError(result.error ?? "That did not save.");
        return;
      }
      flash(success);
      router.refresh();
    });
  }

  async function copyReviewSms() {
    const text = reviewSmsText(client.name, reviewUrl);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Could not reach the clipboard on this device.");
      return;
    }
    run(
      () => logActivityAction("client", client.id, "sms", `Review request copied: ${text}`),
      "Copied — paste it into Messages.",
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <p className="ops-label">Actions</p>
        <a
          href={`/admin/quotes/new?name=${encodeURIComponent(client.name)}&phone=${encodeURIComponent(client.phone)}&area=${encodeURIComponent(client.area)}&clientId=${client.id}`}
          className="ops-btn"
          data-variant="primary"
        >
          New quote for this client
        </a>
        <button
          type="button"
          className="ops-btn"
          data-variant="ghost"
          disabled={pending}
          onClick={() =>
            run(
              () =>
                createJobAction({
                  clientId: client.id,
                  quoteId: null,
                  address: client.address ?? client.area,
                  notes: "",
                  assignedTo: "unassigned",
                  scheduledStart: "",
                  scheduledEnd: "",
                }),
              "Job created — drag it onto the calendar.",
            )
          }
        >
          Schedule job
        </button>
        <button
          type="button"
          className="ops-btn"
          data-variant="ghost"
          disabled={pending}
          onClick={() => void copyReviewSms()}
        >
          Send review SMS
        </button>
        <p className="text-xs text-[var(--ops-faint)]">
          {reviewUrl
            ? "Copies the message with your Google review link. Sending is v3."
            : "No Google review link configured, so the message goes out without one. Sending is v3."}
        </p>
      </div>

      <div className="grid gap-2">
        <p className="ops-label">Add a note</p>
        <textarea
          className="ops-textarea"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Gate code, dog, best time to call…"
        />
        <button
          type="button"
          className="ops-btn"
          data-variant="ghost"
          disabled={pending || note.trim().length === 0}
          onClick={() =>
            run(async () => {
              const result = await logActivityAction("client", client.id, "note", note);
              if (result.ok) setNote("");
              return result;
            }, "Note added.")
          }
        >
          {pending ? "Saving…" : "Add note"}
        </button>
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
