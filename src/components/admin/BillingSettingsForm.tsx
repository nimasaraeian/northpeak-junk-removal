"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useT } from "@/lib/i18n/provider";
import { saveBillingSettingsAction, type ActionResult } from "@/lib/admin/billing-actions";
import type { BillingSettings } from "@/content/billing";

function SaveButton() {
  const { t } = useT();
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="ops-btn" data-variant="navy" disabled={pending}>
      {pending ? t("Saving…") : t("Save billing settings")}
    </button>
  );
}

/** GST/PST, deposit, terms — the invoice defaults. The DB row overrides code. */
export function BillingSettingsForm({ settings }: { settings: BillingSettings }) {
  const { t } = useT();
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    saveBillingSettingsAction,
    null,
  );

  return (
    <form action={formAction} className="ops-card p-4">
      <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Billing & tax")}</h2>
      <p className="mt-1 text-sm text-[var(--ops-muted)]">
        {t("These set the tax lines and footer on every invoice.")}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="ops-label">{t("GST rate (%)")}</span>
          <input
            name="gstPct"
            type="number"
            min={0}
            step={0.1}
            defaultValue={settings.gstPct}
            className="ops-input ops-num mt-1.5"
          />
        </label>
        <label className="block">
          <span className="ops-label">{t("PST rate (%)")}</span>
          <input
            name="pstPct"
            type="number"
            min={0}
            step={0.1}
            defaultValue={settings.pstPct}
            className="ops-input ops-num mt-1.5"
          />
          <span className="mt-1 block text-xs text-[var(--ops-faint)]">
            {t("0 hides the PST line (BC junk-removal default).")}
          </span>
        </label>
        <label className="block">
          <span className="ops-label">{t("GST/HST number")}</span>
          <input
            name="gstNumber"
            defaultValue={settings.gstNumber}
            className="ops-input mt-1.5"
            placeholder="123456789 RT0001"
          />
        </label>
        <label className="block">
          <span className="ops-label">{t("Default deposit (%)")}</span>
          <input
            name="depositPct"
            type="number"
            min={0}
            step={1}
            defaultValue={settings.depositPct}
            className="ops-input ops-num mt-1.5"
          />
        </label>
        <label className="block">
          <span className="ops-label">{t("Payment terms (net days)")}</span>
          <input
            name="netDays"
            type="number"
            min={0}
            step={1}
            defaultValue={settings.netDays}
            className="ops-input ops-num mt-1.5"
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="ops-label">{t("Invoice footer / payment instructions")}</span>
        <textarea
          name="terms"
          rows={2}
          defaultValue={settings.terms}
          className="ops-textarea mt-1.5"
        />
      </label>

      <div className="mt-4 flex items-center gap-3">
        <SaveButton />
        {state?.ok ? (
          <span className="text-sm text-[var(--ops-won-ink)]">{t("Saved.")}</span>
        ) : null}
        {state && !state.ok ? (
          <span role="alert" className="text-sm text-[var(--ops-lost-ink)]">
            {state.error}
          </span>
        ) : null}
      </div>
    </form>
  );
}
