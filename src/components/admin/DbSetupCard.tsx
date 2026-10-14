"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyPendingMigrationsAction } from "@/lib/admin/actions";
import { useT } from "@/lib/i18n/provider";

/**
 * One-click database setup for the Billing + Finance tables. Idempotent, so
 * it is safe to press any time; after a successful run the modules can hold
 * data. Shown in Settings so it is easy to find but out of the main flow.
 */
export function DbSetupCard() {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="ops-card p-4">
      <h2 className="text-sm font-semibold text-[var(--ops-navy)]">
        {t("Database setup — Billing & Finance")}
      </h2>
      <p className="mt-1 text-sm text-[var(--ops-muted)]">
        {t(
          "Run this once to create the invoice, payment, time and expense tables. Safe to press again — it only adds what is missing.",
        )}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="ops-btn"
          data-variant="navy"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await applyPendingMigrationsAction();
              if (!result.ok) {
                setError(result.error ?? t("The database update did not complete."));
                return;
              }
              setDone(true);
              router.refresh();
            });
          }}
        >
          {pending ? t("Applying…") : done ? t("Applied ✓") : t("Apply database updates")}
        </button>
        {done ? (
          <span className="text-sm text-[var(--ops-won-ink)]">
            {t("Billing and Finance are ready.")}
          </span>
        ) : null}
        {error ? (
          <span role="alert" className="text-sm text-[var(--ops-lost-ink)]">
            {error}
          </span>
        ) : null}
      </div>
    </section>
  );
}
