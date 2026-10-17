"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addMemberAction } from "@/lib/admin/users-actions";
import { useT } from "@/lib/i18n/provider";

const ROLES = ["owner", "manager", "sales", "crew"] as const;
const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  sales: "Sales",
  crew: "Crew",
};

/** "Add member" — collapsed to a button until opened. Creates the record and
 *  opens the new member's profile so the rest can be filled in right away. */
export function AddMemberForm() {
  const router = useRouter();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("crew");

  if (!open) {
    return (
      <button type="button" className="ops-btn" data-variant="primary" onClick={() => setOpen(true)}>
        + {t("Add member")}
      </button>
    );
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await addMemberAction({ name: name.trim(), email: email.trim(), role });
      if (!result.ok || !result.id) {
        setError(result.error ?? t("Could not add that member."));
        return;
      }
      router.push(`/admin/team/${result.id}`);
      router.refresh();
    });
  }

  return (
    <section className="ops-card w-full max-w-lg p-4">
      <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Add member")}</h2>
      <div className="mt-3 grid gap-3">
        <label className="block">
          <span className="ops-label">{t("Name")}</span>
          <input className="ops-input mt-1.5" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
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
            <span className="ops-label">{t("Role")}</span>
            <select className="ops-select mt-1.5" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(ROLE_LABELS[r])}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-[var(--ops-faint)]">
          {t("Creates the profile. Personal sign-in (invite link) comes next; for now everyone uses the shared password.")}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="ops-btn"
            data-variant="primary"
            disabled={pending || !name.trim() || !email.trim()}
            onClick={submit}
          >
            {pending ? t("Adding…") : t("Add & open profile")}
          </button>
          <button
            type="button"
            className="ops-btn"
            data-variant="ghost"
            disabled={pending}
            onClick={() => {
              setOpen(false);
              setError(null);
            }}
          >
            {t("Cancel")}
          </button>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-[var(--ops-lost-ink)]">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
