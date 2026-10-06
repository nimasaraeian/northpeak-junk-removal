"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useT } from "@/lib/i18n/provider";
import { saveSettingsAction, type ActionResult } from "@/lib/admin/actions";
import { ITEM_FLAGS, type PricingSettings } from "@/lib/quote-engine";

/**
 * Pricing settings. Money fields are entered in cents, labelled as such,
 * because that is what the engine stores.
 */

function SaveButton() {
  const { t } = useT();
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="ops-btn" data-variant="navy" disabled={pending}>
      {pending ? t("Saving…") : t("Save settings")}
    </button>
  );
}

function CentsField({ name, label, value, hint }: { name: string; label: string; value: number; hint?: string }) {
  return (
    <label className="block">
      <span className="ops-label">{label}</span>
      <div className="mt-1.5 flex items-center gap-2">
        <input name={name} type="number" min={0} step={1} defaultValue={value} className="ops-input ops-num" />
        <span className="shrink-0 text-xs text-[var(--ops-faint)]">¢ · ${(value / 100).toFixed(2)}</span>
      </div>
      {hint ? <span className="mt-1 block text-xs text-[var(--ops-faint)]">{hint}</span> : null}
    </label>
  );
}

function NumberField({
  name,
  label,
  value,
  hint,
  step = 1,
  min = 0,
}: {
  name: string;
  label: string;
  value: number;
  hint?: string;
  step?: number;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="ops-label">{label}</span>
      <input name={name} type="number" min={min} step={step} defaultValue={value} className="ops-input ops-num mt-1.5" />
      {hint ? <span className="mt-1 block text-xs text-[var(--ops-faint)]">{hint}</span> : null}
    </label>
  );
}

export function SettingsForm({
  settings,
  measuredTrailerCubicFeet,
}: {
  settings: PricingSettings;
  measuredTrailerCubicFeet: number;
}) {
  const { t } = useT();
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveSettingsAction, null);

  return (
    <form action={formAction} className="grid gap-4">
      {!settings.truckCapacityVerified ? (
        <p role="status" className="rounded-lg border border-[var(--ops-warn-border)] bg-[var(--ops-warn-bg)] px-4 py-3 text-sm leading-6 text-[var(--ops-warn-ink)]">
          <strong>{t("Confirm the truck measurement.")}</strong>{" "}
          {t("Capacity is seeded at")} {measuredTrailerCubicFeet} ft³ —{" "}
          {t("the measured dump box. Confirm it against a real full load, adjust if needed, and save once; the banner clears on save.")}
          {settings.truckCapacityFt3 !== measuredTrailerCubicFeet ? (
            <> {t("Currently set to")} <strong>{settings.truckCapacityFt3} ft³</strong>.</>
          ) : null}
        </p>
      ) : null}

      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Volume pricing")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <NumberField name="truckCapacityFt3" label={t("Truck capacity (ft³)")} value={settings.truckCapacityFt3} hint={t("Usable box volume.")} />
          <CentsField name="ratePerYd3Cents" label={t("Rate per cubic yard")} value={settings.ratePerYd3Cents} />
          <CentsField name="minJobCents" label={t("Minimum job")} value={settings.minJobCents} />
          <NumberField name="packingPct" label={t("Packing factor (%)")} value={settings.packingPct} min={10} hint={t("10–30. Air between the items.")} />
          <NumberField name="rangeSpreadPct" label={t("Range spread (%)")} value={settings.rangeSpreadPct} hint={t("Half-width either side of the subtotal.")} />
        </div>
      </section>

      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Published tier floors")}</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--ops-muted)]">
          {t("The low end of a quote is held up to whichever tier the load falls into, so a quote never lands under the ladder the site advertises. Blank a name to drop a bracket.")}
        </p>
        <input type="hidden" name="floorCount" value={settings.priceFloors.length} />
        <div className="mt-3 overflow-x-auto">
          <table className="ops-table">
            <thead>
              <tr>
                <th>{t("Tier")}</th>
                <th>{t("Up to (fraction of truck)")}</th>
                <th>{t("Floor")}</th>
              </tr>
            </thead>
            <tbody>
              {settings.priceFloors.map((bracket, index) => (
                <tr key={`${bracket.label}-${index}`}>
                  <td>
                    <input name={`floor_label_${index}`} defaultValue={bracket.label} className="ops-input" aria-label={t("Tier")} />
                  </td>
                  <td>
                    <input name={`floor_maxFraction_${index}`} type="number" min={0.01} max={10} step={0.05} defaultValue={bracket.maxFraction} className="ops-input ops-num w-28" aria-label={t("Up to (fraction of truck)")} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <input name={`floor_floorCents_${index}`} type="number" min={0} step={1} defaultValue={bracket.floorCents} className="ops-input ops-num w-28" aria-label={t("Floor")} />
                      <span className="shrink-0 text-xs text-[var(--ops-faint)]">¢ · ${(bracket.floorCents / 100).toFixed(2)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Item surcharges")}</h2>
        <p className="mt-1 text-xs text-[var(--ops-muted)]">{t("Charged once per unit of a flagged item.")}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ITEM_FLAGS.map((flag) => (
            <CentsField key={flag} name={`surcharge_${flag}`} label={t(flag)} value={settings.surchargeCents[flag]} />
          ))}
        </div>
      </section>

      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Labor adders")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <CentsField name="labor_stairsPerFlight" label={t("Per flight of stairs")} value={settings.laborCents.stairsPerFlight} />
          <CentsField name="labor_longCarry" label={t("Long carry (over 15 m)")} value={settings.laborCents.longCarry} />
          <CentsField name="labor_disassembly" label={t("Per disassembly")} value={settings.laborCents.disassembly} />
        </div>
      </section>

      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Heavy material")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <CentsField name="heavyRatePerTonneCents" label={t("Charged per tonne")} value={settings.heavyRatePerTonneCents} />
        </div>
      </section>

      <section className="ops-internal p-4">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--ops-lost-ink)]">{t("Internal cost model — never shown to a customer")}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CentsField name="tippingFeePerTonneCents" label={t("Tipping fee per tonne")} value={settings.tippingFeePerTonneCents} hint={t("Placeholder — check the current North Shore rate.")} />
          <CentsField name="laborRatePerHourCents" label={t("Crew rate per hour")} value={settings.laborRatePerHourCents} />
          <CentsField name="fuelFlatCents" label={t("Fuel, flat")} value={settings.fuelFlatCents} />
          <NumberField name="avgDensityKgPerYd3" label={t("Avg density (kg/yd³)")} value={settings.avgDensityKgPerYd3} hint={t("Used to estimate disposal weight.")} />
        </div>
      </section>

      {state?.error ? <p role="alert" className="text-sm text-[var(--ops-lost-ink)]">{state.error}</p> : null}
      {state?.ok ? <p role="status" className="text-sm text-[var(--ops-won-ink)]">{t("Saved. New quotes price from these values.")}</p> : null}

      <div>
        <SaveButton />
      </div>
    </form>
  );
}
