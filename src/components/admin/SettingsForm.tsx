"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveSettingsAction, type ActionResult } from "@/lib/admin/actions";
import { ITEM_FLAGS, type PricingSettings } from "@/lib/quote-engine";

/**
 * Pricing settings.
 *
 * Money fields are entered in cents, labelled as such, because that is what
 * the engine stores and a silent dollars-to-cents conversion in a settings
 * form is the kind of thing that mis-prices a quarter's work before anyone
 * notices.
 */

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="ops-btn" data-variant="navy" disabled={pending}>
      {pending ? "Saving…" : "Save settings"}
    </button>
  );
}

function CentsField({
  name,
  label,
  value,
  hint,
}: {
  name: string;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="ops-label">{label}</span>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          name={name}
          type="number"
          min={0}
          step={1}
          defaultValue={value}
          className="ops-input ops-num"
        />
        <span className="shrink-0 text-xs text-[var(--ops-faint)]">
          ¢ · ${(value / 100).toFixed(2)}
        </span>
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
      <input
        name={name}
        type="number"
        min={min}
        step={step}
        defaultValue={value}
        className="ops-input ops-num mt-1.5"
      />
      {hint ? <span className="mt-1 block text-xs text-[var(--ops-faint)]">{hint}</span> : null}
    </label>
  );
}

export function SettingsForm({
  settings,
  measuredTrailerCubicFeet,
}: {
  settings: PricingSettings;
  /** The box volume the public site already publishes, for the banner. */
  measuredTrailerCubicFeet: number;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    saveSettingsAction,
    null,
  );

  return (
    <form action={formAction} className="grid gap-4">
      {!settings.truckCapacityVerified ? (
        <p
          role="status"
          className="rounded-lg border border-[var(--ops-warn-border)] bg-[var(--ops-warn-bg)] px-4 py-3 text-sm leading-6 text-[var(--ops-warn-ink)]"
        >
          <strong>Verify truck dimensions.</strong> Truck capacity is still the seeded placeholder
          of {settings.truckCapacityFt3} ft³. Measure the real box and save this page once — the
          banner clears on save. Worth reconciling with the{" "}
          {measuredTrailerCubicFeet} ft³ the site already publishes for the 7 × 12 × 3 ft dump
          box; every quote scales off whichever number lands here.
        </p>
      ) : null}

      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">Volume pricing</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <NumberField
            name="truckCapacityFt3"
            label="Truck capacity (ft³)"
            value={settings.truckCapacityFt3}
            hint="Usable box volume."
          />
          <CentsField
            name="ratePerYd3Cents"
            label="Rate per cubic yard"
            value={settings.ratePerYd3Cents}
          />
          <CentsField name="minJobCents" label="Minimum job" value={settings.minJobCents} />
          <NumberField
            name="packingPct"
            label="Packing factor (%)"
            value={settings.packingPct}
            min={10}
            hint="10–30. Air between the items."
          />
          <NumberField
            name="rangeSpreadPct"
            label="Range spread (%)"
            value={settings.rangeSpreadPct}
            hint="Half-width either side of the subtotal."
          />
        </div>
      </section>

      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">Item surcharges</h2>
        <p className="mt-1 text-xs text-[var(--ops-muted)]">
          Charged once per unit of a flagged item.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ITEM_FLAGS.map((flag) => (
            <CentsField
              key={flag}
              name={`surcharge_${flag}`}
              label={flag}
              value={settings.surchargeCents[flag]}
            />
          ))}
        </div>
      </section>

      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">Labor adders</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <CentsField
            name="labor_stairsPerFlight"
            label="Per flight of stairs"
            value={settings.laborCents.stairsPerFlight}
          />
          <CentsField
            name="labor_longCarry"
            label="Long carry (over 15 m)"
            value={settings.laborCents.longCarry}
          />
          <CentsField
            name="labor_disassembly"
            label="Per disassembly"
            value={settings.laborCents.disassembly}
          />
        </div>
      </section>

      <section className="ops-card p-4">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">Heavy material</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <CentsField
            name="heavyRatePerTonneCents"
            label="Charged per tonne"
            value={settings.heavyRatePerTonneCents}
          />
        </div>
      </section>

      <section className="ops-internal p-4">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--ops-lost-ink)]">
          Internal cost model — never shown to a customer
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CentsField
            name="tippingFeePerTonneCents"
            label="Tipping fee per tonne"
            value={settings.tippingFeePerTonneCents}
            hint="Placeholder — check the current North Shore rate."
          />
          <CentsField
            name="laborRatePerHourCents"
            label="Crew rate per hour"
            value={settings.laborRatePerHourCents}
          />
          <CentsField name="fuelFlatCents" label="Fuel, flat" value={settings.fuelFlatCents} />
          <NumberField
            name="avgDensityKgPerYd3"
            label="Avg density (kg/yd³)"
            value={settings.avgDensityKgPerYd3}
            hint="Used to estimate disposal weight."
          />
        </div>
      </section>

      {state?.error ? (
        <p role="alert" className="text-sm text-[var(--ops-lost-ink)]">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="text-sm text-[var(--ops-won-ink)]">
          Saved. New quotes price from these values.
        </p>
      ) : null}

      <div>
        <SaveButton />
      </div>
    </form>
  );
}
