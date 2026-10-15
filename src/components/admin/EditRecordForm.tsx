"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteClientAction,
  deleteLeadAction,
  updateClientAction,
  updateLeadDetailsAction,
} from "@/lib/admin/crm-actions";
import { LEAD_SOURCE_LABELS } from "@/lib/admin/crm";
import { LEAD_SOURCES, type LeadSource } from "@/lib/db/schema";
import { useT } from "@/lib/i18n/provider";

export interface EditRecordInitial {
  name: string;
  phone: string;
  email: string;
  area: string;
  source: LeadSource;
  /** Address for clients; ignored for leads. */
  address?: string;
  /** "What they want" for leads; "Notes" for clients. */
  message: string;
}

/**
 * Edit + delete for a lead or a client. Collapsed to an "Edit" button until
 * opened, and a destructive "Delete" with a confirm. One component for both
 * because the fields are the same six, mirroring NewRecordForm.
 */
export function EditRecordForm({
  kind,
  id,
  initial,
}: {
  kind: "lead" | "client";
  id: number;
  initial: EditRecordInitial;
}) {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(initial.email);
  const [area, setArea] = useState(initial.area);
  const [address, setAddress] = useState(initial.address ?? "");
  const [source, setSource] = useState<LeadSource>(initial.source);
  const [message, setMessage] = useState(initial.message);

  function save() {
    setError(null);
    startTransition(async () => {
      const result =
        kind === "lead"
          ? await updateLeadDetailsAction(id, {
              name: name.trim(),
              phone: phone.trim(),
              email: email.trim(),
              area: area.trim(),
              source,
              message: message.trim(),
            })
          : await updateClientAction(id, {
              name: name.trim(),
              phone: phone.trim(),
              email: email.trim(),
              address: address.trim(),
              area: area.trim(),
              source,
              notes: message.trim(),
            });
      if (!result.ok) {
        setError(result.error ?? t("Those changes did not save."));
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  function remove() {
    const label = kind === "lead" ? t("this lead") : t("this client");
    if (!window.confirm(`${t("Delete")} ${label}? ${t("This cannot be undone.")}`)) return;
    setError(null);
    startTransition(async () => {
      const result =
        kind === "lead" ? await deleteLeadAction(id) : await deleteClientAction(id);
      if (!result.ok) {
        setError(result.error ?? t("Could not delete that."));
        return;
      }
      router.push(kind === "lead" ? "/admin/leads" : "/admin/clients");
      router.refresh();
    });
  }

  return (
    <section className="ops-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Details")}</h2>
        {!editing ? (
          <button
            type="button"
            className="ops-btn"
            data-variant="ghost"
            onClick={() => setEditing(true)}
          >
            {t("Edit")}
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-3 grid gap-3">
          <label className="block">
            <span className="ops-label">{t("Name")}</span>
            <input
              className="ops-input mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="ops-label">{t("Phone")}</span>
              <input
                className="ops-input ops-num mt-1.5"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="ops-label">{t("Email")}</span>
              <input
                className="ops-input mt-1.5"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="ops-label">{t("Area")}</span>
              <input
                className="ops-input mt-1.5"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="ops-label">{t("Source")}</span>
              <select
                className="ops-select mt-1.5"
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
              >
                {LEAD_SOURCES.map((value) => (
                  <option key={value} value={value}>
                    {t(LEAD_SOURCE_LABELS[value])}
                  </option>
                ))}
              </select>
            </label>
            {kind === "client" ? (
              <label className="block sm:col-span-2">
                <span className="ops-label">{t("Address")}</span>
                <input
                  className="ops-input mt-1.5"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </label>
            ) : null}
          </div>
          <label className="block">
            <span className="ops-label">{kind === "lead" ? t("What they want") : t("Notes")}</span>
            <textarea
              className="ops-textarea mt-1.5"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className="ops-btn"
              data-variant="primary"
              disabled={pending}
              onClick={save}
            >
              {pending ? t("Saving…") : t("Save changes")}
            </button>
            <button
              type="button"
              className="ops-btn"
              data-variant="ghost"
              disabled={pending}
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-3 border-t border-[var(--ops-border)] pt-3">
        <button
          type="button"
          className="text-sm font-medium text-[var(--ops-lost-ink)] hover:underline"
          disabled={pending}
          onClick={remove}
        >
          {kind === "lead" ? t("Delete lead") : t("Delete client")}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-sm text-[var(--ops-lost-ink)]">
          {error}
        </p>
      ) : null}
    </section>
  );
}
