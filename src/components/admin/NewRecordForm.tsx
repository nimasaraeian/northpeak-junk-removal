"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClientAction, createLeadAction } from "@/lib/admin/crm-actions";
import { LEAD_SOURCE_LABELS } from "@/lib/admin/crm";
import { LEAD_OWNERS, LEAD_SOURCES } from "@/lib/db/schema";

/**
 * Add-a-lead and add-a-client, which are the same six fields either way.
 *
 * One component rather than two near-identical forms: the only differences
 * are the owner/follow-up pair (leads) and the address field (clients).
 */
export function NewRecordForm({ kind }: { kind: "lead" | "client" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setError(null);
    const values = Object.fromEntries(formData.entries()) as Record<string, string>;

    startTransition(async () => {
      const result =
        kind === "lead"
          ? await createLeadAction({
              name: values.name ?? "",
              phone: values.phone ?? "",
              email: values.email ?? "",
              area: values.area ?? "",
              source: values.source,
              message: values.message ?? "",
              owner: values.owner,
              nextFollowUpAt: values.nextFollowUpAt ?? "",
            })
          : await createClientAction({
              name: values.name ?? "",
              phone: values.phone ?? "",
              email: values.email ?? "",
              address: values.address ?? "",
              area: values.area ?? "",
              source: values.source,
              notes: values.message ?? "",
            });

      if (!result.ok) {
        setError(result.error ?? "That did not save.");
        return;
      }

      if (kind === "lead") {
        router.push("id" in result && result.id ? `/admin/leads/${result.id}` : "/admin/leads");
      } else {
        router.push(
          "clientId" in result && result.clientId
            ? `/admin/clients/${result.clientId}`
            : "/admin/clients",
        );
      }
      router.refresh();
    });
  }

  return (
    <form action={submit} className="ops-card grid max-w-2xl gap-3 p-4">
      <label className="block">
        <span className="ops-label">Name</span>
        <input name="name" required className="ops-input mt-1.5" autoFocus />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="ops-label">Phone</span>
          <input name="phone" type="tel" inputMode="tel" className="ops-input ops-num mt-1.5" />
        </label>
        <label className="block">
          <span className="ops-label">Email</span>
          <input name="email" type="email" className="ops-input mt-1.5" />
        </label>
        <label className="block">
          <span className="ops-label">Area</span>
          <input name="area" className="ops-input mt-1.5" placeholder="North Vancouver" />
        </label>
        <label className="block">
          <span className="ops-label">Source</span>
          <select name="source" defaultValue="other" className="ops-select mt-1.5">
            {LEAD_SOURCES.map((source) => (
              <option key={source} value={source}>
                {LEAD_SOURCE_LABELS[source]}
              </option>
            ))}
          </select>
        </label>

        {kind === "client" ? (
          <label className="block sm:col-span-2">
            <span className="ops-label">Address</span>
            <input name="address" className="ops-input mt-1.5" />
          </label>
        ) : (
          <>
            <label className="block">
              <span className="ops-label">Owner</span>
              <select name="owner" defaultValue="unassigned" className="ops-select mt-1.5">
                {LEAD_OWNERS.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="ops-label">Next follow-up</span>
              <input name="nextFollowUpAt" type="date" className="ops-input mt-1.5" />
            </label>
          </>
        )}
      </div>

      <label className="block">
        <span className="ops-label">{kind === "lead" ? "What they want" : "Notes"}</span>
        <textarea name="message" rows={3} className="ops-textarea mt-1.5" />
      </label>

      {error ? (
        <p role="alert" className="text-sm text-[var(--ops-lost-ink)]">
          {error}
        </p>
      ) : null}

      <div>
        <button type="submit" className="ops-btn" data-variant="primary" disabled={pending}>
          {pending ? "Saving…" : kind === "lead" ? "Add lead" : "Add client"}
        </button>
      </div>
    </form>
  );
}
