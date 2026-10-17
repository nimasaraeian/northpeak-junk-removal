"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFirstOwnerAction } from "@/lib/admin/users-actions";
import { useT } from "@/lib/i18n/provider";

/**
 * One-time bootstrap: create the first owner account. Shown on /admin/team only
 * while there are no users yet. The current ADMIN_PASSWORD session stays valid
 * until (and after) this; real user login arrives in the next step.
 */
export function FirstOwnerForm({ defaultName }: { defaultName?: string }) {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createFirstOwnerAction({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (!result.ok) {
        setError(result.error ?? t("That did not save."));
        return;
      }
      setPassword("");
      router.refresh();
    });
  }

  return (
    <section className="ops-card max-w-lg p-4">
      <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Create the first owner")}</h2>
      <p className="mt-1 text-sm text-[var(--ops-muted)]">
        {t(
          "This becomes the account that can invite everyone else. Your current password login keeps working until you switch to personal sign-in.",
        )}
      </p>
      <div className="mt-4 grid gap-3">
        <label className="block">
          <span className="ops-label">{t("Name")}</span>
          <input
            className="ops-input mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="ops-label">{t("Email")}</span>
          <input
            className="ops-input mt-1.5"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="ops-label">{t("Password")}</span>
          <input
            className="ops-input mt-1.5"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="mt-1 block text-xs text-[var(--ops-faint)]">
            {t("At least 8 characters.")}
          </span>
        </label>
        <div>
          <button
            type="button"
            className="ops-btn"
            data-variant="primary"
            disabled={pending || !name.trim() || !email.trim() || password.length < 8}
            onClick={submit}
          >
            {pending ? t("Creating…") : t("Create owner account")}
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
