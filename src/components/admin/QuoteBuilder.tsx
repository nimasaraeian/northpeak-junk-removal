"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/provider";
import { PhotoAssist, type VisionOverall } from "@/components/admin/PhotoAssist";
import { saveQuoteAction, type QuotePayload } from "@/lib/admin/actions";
import { buildCustomerText } from "@/lib/admin/customer-text";
import type { VisionSuggestion } from "@/lib/admin/vision";
import type { CatalogItemRow, QuoteRow, QuoteStatus } from "@/lib/db/schema";
import {
  computeQuote,
  formatCents,
  HEAVY_MATERIALS,
  type CarryDistance,
  type HeavyMaterial,
  type ItemFlag,
  type PricingSettings,
} from "@/lib/quote-engine";

/**
 * The New Quote screen.
 *
 * Three panels on desktop — photos, items, price — stacked on mobile in that
 * order. The price shown is a live preview computed in the browser from the
 * same pure engine the server uses; `saveQuoteAction` recomputes before write.
 */

interface DraftLine {
  key: string;
  catalogId: number | null;
  custom: boolean;
  label: string;
  qty: number;
  cubicFeetEach: number;
  surchargeCents: number | null;
  flags: ItemFlag[];
  suggested?: boolean;
  confidence?: number;
}

export interface LinkTargets {
  clients: { id: number; name: string; area: string }[];
  leads: { id: number; name: string; area: string }[];
}

export interface QuoteBuilderProps {
  catalog: CatalogItemRow[];
  linkTargets?: LinkTargets;
  prefill?: {
    name?: string;
    phone?: string;
    area?: string;
    clientId?: number | null;
    leadId?: number | null;
  };
  settings: PricingSettings;
  operator: string;
  photoAssistAvailable: boolean;
  existing?: QuoteRow | null;
}

let keyCounter = 0;
function nextKey(): string {
  keyCounter += 1;
  return `line-${keyCounter}`;
}

function toDraftLines(quote: QuoteRow | null | undefined): DraftLine[] {
  if (!quote) return [];
  return quote.itemLines.map((line) => ({
    key: nextKey(),
    catalogId: line.catalogId,
    custom: line.custom,
    label: line.label,
    qty: line.qty,
    cubicFeetEach: line.cubicFeetEach,
    surchargeCents: line.surchargeCents,
    flags: line.flags ?? [],
  }));
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="ops-label">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <span className="mt-1 block text-xs text-[var(--ops-faint)]">{hint}</span> : null}
    </label>
  );
}

export function QuoteBuilder({
  catalog,
  settings,
  operator,
  photoAssistAvailable,
  existing,
  linkTargets,
  prefill,
}: QuoteBuilderProps) {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();

  const [lines, setLines] = useState<DraftLine[]>(() => toDraftLines(existing));
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState(existing?.customerName ?? prefill?.name ?? "");
  const [customerPhone, setCustomerPhone] = useState(existing?.customerPhone ?? prefill?.phone ?? "");
  const [customerArea, setCustomerArea] = useState(existing?.customerArea ?? prefill?.area ?? "");
  const [clientId, setClientId] = useState<number | null>(existing?.clientId ?? prefill?.clientId ?? null);
  const [leadId, setLeadId] = useState<number | null>(prefill?.leadId ?? null);
  const [notes, setNotes] = useState(existing?.notes ?? "");

  const [stairsFlights, setStairsFlights] = useState(existing?.labor.stairsFlights ?? 0);
  const [carryDistance, setCarryDistance] = useState<CarryDistance>(existing?.labor.carryDistance ?? "standard");
  const [disassembly, setDisassembly] = useState(existing?.labor.disassembly ?? 0);
  const [packingPct, setPackingPct] = useState(existing?.packingPct ?? settings.packingPct);

  const [heavyMode, setHeavyMode] = useState(existing?.heavyMode ?? false);
  const [heavyMaterial, setHeavyMaterial] = useState<HeavyMaterial>(existing?.heavy?.materialType ?? "concrete");
  const [heavyWeightKg, setHeavyWeightKg] = useState(existing?.heavy?.estWeightKg ?? 0);

  const [discountType, setDiscountType] = useState<"none" | "percent" | "amount">(existing?.discount?.type ?? "none");
  const [discountValue, setDiscountValue] = useState(
    existing?.discount ? (existing.discount.type === "percent" ? existing.discount.value : existing.discount.value / 100) : 0,
  );
  const [discountReason, setDiscountReason] = useState(existing?.discount?.reason ?? "");

  const [complexJob, setComplexJob] = useState<VisionOverall | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const catalogByName = useMemo(() => {
    const map = new Map<string, CatalogItemRow>();
    for (const row of catalog) map.set(row.name.toLowerCase(), row);
    return map;
  }, [catalog]);

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return catalog
      .filter((row) => row.name.toLowerCase().includes(term) || row.category.toLowerCase().includes(term))
      .slice(0, 8);
  }, [catalog, search]);

  const discount = useMemo(() => {
    if (discountType === "none" || discountValue <= 0) return null;
    return {
      type: discountType,
      value: discountType === "percent" ? discountValue : Math.round(discountValue * 100),
      reason: discountReason,
    } as const;
  }, [discountType, discountValue, discountReason]);

  const computation = useMemo(
    () =>
      computeQuote(
        {
          items: lines.map((line) => ({
            catalogId: line.catalogId,
            label: line.label,
            qty: line.qty,
            cubicFeetEach: line.cubicFeetEach,
            surchargeCents: line.surchargeCents,
            flags: line.flags,
          })),
          packingPct,
          labor: { stairsFlights, carryDistance, disassembly },
          heavyMode,
          heavy: heavyMode ? { materialType: heavyMaterial, estWeightKg: heavyWeightKg } : null,
          discount,
        },
        settings,
      ),
    [lines, packingPct, stairsFlights, carryDistance, disassembly, heavyMode, heavyMaterial, heavyWeightKg, discount, settings],
  );

  function addCatalogItem(row: CatalogItemRow) {
    setLines((current) => {
      const existingIndex = current.findIndex((line) => line.catalogId === row.id && !line.suggested);
      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = { ...next[existingIndex], qty: next[existingIndex].qty + 1 };
        return next;
      }
      return [
        ...current,
        {
          key: nextKey(),
          catalogId: row.id,
          custom: false,
          label: row.name,
          qty: 1,
          cubicFeetEach: row.cubicFeet,
          surchargeCents: row.defaultSurchargeCents,
          flags: row.flags ?? [],
        },
      ];
    });
    setSearch("");
  }

  function addCustomLine() {
    setLines((current) => [
      ...current,
      { key: nextKey(), catalogId: null, custom: true, label: "", qty: 1, cubicFeetEach: 0, surchargeCents: null, flags: [] },
    ]);
  }

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch, suggested: false } : line)));
  }

  function removeLine(key: string) {
    setLines((current) => current.filter((line) => line.key !== key));
  }

  function acceptSuggestions(items: VisionSuggestion[], overall: VisionOverall) {
    setComplexJob(overall.complexJob ? overall : null);
    if (overall.complexJob || items.length === 0) return;
    setLines((current) => [
      ...current,
      ...items.map((item) => {
        const matched = item.matchedCatalogName ? catalogByName.get(item.matchedCatalogName.toLowerCase()) : undefined;
        return {
          key: nextKey(),
          catalogId: matched?.id ?? null,
          custom: !matched,
          label: matched?.name ?? item.label,
          qty: item.qty,
          cubicFeetEach: matched?.cubicFeet ?? item.estCubicFeetEach,
          surchargeCents: matched?.defaultSurchargeCents ?? null,
          flags: matched?.flags ?? item.flags,
          suggested: true,
          confidence: item.confidence,
        };
      }),
    ]);
  }

  function payloadFor(status: QuoteStatus): QuotePayload {
    return {
      id: existing?.id ?? null,
      clientId,
      leadId,
      customerName,
      customerPhone,
      customerArea,
      items: lines
        .filter((line) => line.label.trim().length > 0)
        .map((line) => ({
          catalogId: line.catalogId,
          custom: line.custom,
          label: line.label.trim(),
          qty: Math.max(1, Math.round(line.qty)),
          cubicFeetEach: Math.max(0, line.cubicFeetEach),
          surchargeCents: line.surchargeCents,
          flags: line.flags,
        })),
      packingPct,
      labor: { stairsFlights, carryDistance, disassembly },
      heavyMode,
      heavy: heavyMode ? { materialType: heavyMaterial, estWeightKg: heavyWeightKg } : null,
      discount,
      status,
      notes,
    };
  }

  function save(status: QuoteStatus) {
    setSaveError(null);
    startTransition(async () => {
      const result = await saveQuoteAction(payloadFor(status));
      if (!result.ok) {
        setSaveError(result.error ?? t("That did not save."));
        return;
      }
      router.push(result.id ? `/admin/quotes/${result.id}` : "/admin/quotes");
      router.refresh();
    });
  }

  async function copyCustomerText() {
    const text = buildCustomerText({
      customerName,
      items: lines.filter((line) => line.label.trim()).map((line) => ({ label: line.label, qty: line.qty })),
      computation,
      heavyMaterial: heavyMode ? heavyMaterial : null,
      operatorName: operator,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setSaveError(t("Could not reach the clipboard. Long-press the price panel to copy manually."));
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,22rem)]">
      {/* Panel 1 — photos */}
      <div className="flex flex-col gap-4">
        {photoAssistAvailable ? (
          <PhotoAssist onSuggestions={acceptSuggestions} />
        ) : (
          <section className="ops-card p-4">
            <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Photos")}</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--ops-muted)]">
              {t("Photo assist is off — set")} <code className="font-mono">ANTHROPIC_API_KEY</code>{" "}
              {t("on the deployment. Pick items from the catalog instead.")}
            </p>
          </section>
        )}
      </div>

      {/* Panel 2 — items and job shape */}
      <div className="flex flex-col gap-4">
        {complexJob ? (
          <p role="status" className="rounded-lg border border-[var(--ops-warn-border)] bg-[var(--ops-warn-bg)] px-3 py-2 text-sm leading-6 text-[var(--ops-warn-ink)]">
            <strong>{t("Complex job — price manually.")}</strong>{" "}
            {complexJob.reason || t("These photos need a person to look at them.")}
          </p>
        ) : null}

        <section className="ops-card p-4">
          <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Items")}</h2>

          <div className="relative mt-3">
            <input
              type="search"
              className="ops-input"
              placeholder={t("Search the catalog — sofa, mattress, fridge…")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label={t("Search the item catalog")}
            />
            {matches.length > 0 ? (
              <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-[var(--ops-border-strong)] bg-white shadow-[var(--ops-shadow-panel)]">
                {matches.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => addCatalogItem(row)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-[var(--ops-surface-2)]"
                    >
                      <span>
                        {row.name}
                        <span className="block text-xs text-[var(--ops-faint)]">{row.category}</span>
                      </span>
                      <span className="ops-num shrink-0 text-xs text-[var(--ops-muted)]">{row.cubicFeet} ft³</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {lines.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--ops-muted)]">{t("No items yet. Search the catalog above, or add a custom line.")}</p>
          ) : (
            <ul className="mt-4 grid gap-2">
              {lines.map((line) => (
                <li key={line.key} className="rounded-lg border border-[var(--ops-border)] p-2.5" data-suggested={line.suggested ? "true" : undefined}>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      className="ops-input min-w-0 flex-1"
                      value={line.label}
                      placeholder={t("Item name")}
                      onChange={(event) => updateLine(line.key, { label: event.target.value })}
                      aria-label={t("Item name")}
                    />
                    <div className="flex items-center gap-1">
                      <button type="button" className="ops-btn px-2.5" data-variant="ghost" onClick={() => updateLine(line.key, { qty: Math.max(1, line.qty - 1) })} aria-label="−">−</button>
                      <input
                        type="number"
                        min={1}
                        className="ops-input ops-num w-14 text-center"
                        value={line.qty}
                        onChange={(event) => updateLine(line.key, { qty: Math.max(1, Number(event.target.value) || 1) })}
                        aria-label={t("Quantity")}
                      />
                      <button type="button" className="ops-btn px-2.5" data-variant="ghost" onClick={() => updateLine(line.key, { qty: line.qty + 1 })} aria-label="+">+</button>
                    </div>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      className="ops-input ops-num w-20"
                      value={line.cubicFeetEach}
                      onChange={(event) => updateLine(line.key, { cubicFeetEach: Math.max(0, Number(event.target.value) || 0) })}
                      aria-label="ft³"
                    />
                    <span className="text-xs text-[var(--ops-faint)]">ft³</span>
                    <button type="button" className="ops-btn px-2.5" data-variant="ghost" onClick={() => removeLine(line.key)} aria-label="×">×</button>
                  </div>

                  {(line.flags.length > 0 || line.suggested) ? (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-[var(--ops-faint)]">
                      {line.suggested ? (
                        <span className="rounded bg-[var(--ops-warn-bg)] px-1.5 py-0.5 font-semibold text-[var(--ops-warn-ink)]">
                          {t("from photos")}
                          {typeof line.confidence === "number" ? ` · ${Math.round(line.confidence * 100)}%` : ""}
                        </span>
                      ) : null}
                      {line.flags.map((flag) => (
                        <span key={flag} className="rounded bg-[var(--ops-surface-2)] px-1.5 py-0.5 font-medium">{t(flag)}</span>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <button type="button" className="ops-btn mt-3" data-variant="ghost" onClick={addCustomLine}>{t("Add custom item")}</button>
        </section>

        <section className="ops-card p-4">
          <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Access & labor")}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label={t("Stairs (flights)")}>
              <input type="number" min={0} className="ops-input ops-num" value={stairsFlights} onChange={(event) => setStairsFlights(Math.max(0, Number(event.target.value) || 0))} />
            </Field>
            <Field label={t("Carry distance")}>
              <select className="ops-select" value={carryDistance} onChange={(event) => setCarryDistance(event.target.value as CarryDistance)}>
                <option value="standard">{t("Standard")}</option>
                <option value="long">{t("Long carry (over 15 m)")}</option>
              </select>
            </Field>
            <Field label={t("Disassembly (items)")}>
              <input type="number" min={0} className="ops-input ops-num" value={disassembly} onChange={(event) => setDisassembly(Math.max(0, Number(event.target.value) || 0))} />
            </Field>
            <Field label={`${t("Packing factor")} — ${packingPct}%`} hint={t("Air between the items. 10–30%.")}>
              <input type="range" min={10} max={30} step={1} className="w-full" value={packingPct} onChange={(event) => setPackingPct(Number(event.target.value))} />
            </Field>
          </div>

          <div className="mt-4 rounded-lg border border-[var(--ops-border)] p-3">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--ops-text)]">
              <input type="checkbox" checked={heavyMode} onChange={(event) => setHeavyMode(event.target.checked)} />
              {t("Heavy material — price by weight")}
            </label>
            <p className="mt-1 text-xs leading-5 text-[var(--ops-muted)]">{t("Soil, concrete, tile, shingles. Replaces volume pricing entirely.")}</p>
            {heavyMode ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label={t("Material")}>
                  <select className="ops-select" value={heavyMaterial} onChange={(event) => setHeavyMaterial(event.target.value as HeavyMaterial)}>
                    {HEAVY_MATERIALS.map((material) => (
                      <option key={material} value={material}>{t(material)}</option>
                    ))}
                  </select>
                </Field>
                <Field label={t("Estimated weight (kg)")}>
                  <input type="number" min={0} step={50} className="ops-input ops-num" value={heavyWeightKg} onChange={(event) => setHeavyWeightKg(Math.max(0, Number(event.target.value) || 0))} />
                </Field>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {/* Panel 3 — live price */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <section className="ops-card p-4">
          <p className="ops-label">{t("Estimate")}</p>
          <p className="ops-num mt-1 text-3xl font-semibold tracking-tight text-[var(--ops-navy)]">
            {formatCents(computation.lowCents)} – {formatCents(computation.highCents)}
          </p>
          <p className="mt-1 text-xs text-[var(--ops-faint)]">
            {computation.heavyMode
              ? t("Priced by weight")
              : `${computation.packedCubicFeet.toFixed(0)} ft³ ${t("packed")} · ${computation.cubicYards.toFixed(1)} yd³`}
            {computation.minJobApplied ? ` · ${t("minimum job")}` : ""}
          </p>

          {computation.floorApplied ? (
            <p className="mt-2 text-xs text-[var(--ops-muted)]">{t("Adjusted to published tier floor")} ({computation.floorLabel}).</p>
          ) : null}

          {computation.multiLoad ? (
            <p className="mt-2 rounded border border-[var(--ops-warn-border)] bg-[var(--ops-warn-bg)] px-2 py-1 text-xs font-medium text-[var(--ops-warn-ink)]">
              {computation.loads} {t("truckloads")}
            </p>
          ) : null}

          <ul className="mt-3 grid gap-1.5 border-t border-[var(--ops-border)] pt-3 text-sm">
            {computation.breakdown.map((row) => (
              <li key={row.label} className="flex items-baseline justify-between gap-3">
                <span className="text-[var(--ops-muted)]">
                  {t(row.label)}
                  {row.detail ? <span className="block text-xs text-[var(--ops-faint)]">{row.detail}</span> : null}
                </span>
                <span className="ops-num shrink-0 font-medium">{formatCents(row.amountCents)}</span>
              </li>
            ))}
          </ul>

          <div className="ops-internal mt-4 p-3">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--ops-lost-ink)]">{t("Internal — do not share")}</p>
            <dl className="mt-2 grid gap-1 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--ops-muted)]">{t("Est. weight")}</dt>
                <dd className="ops-num">{Math.round(computation.internal.estWeightKg)} kg</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--ops-muted)]">{t("Disposal")}</dt>
                <dd className="ops-num">{formatCents(computation.internal.disposalCents)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--ops-muted)]">{t("Crew")} · {computation.internal.laborHoursEst}h</dt>
                <dd className="ops-num">{formatCents(computation.internal.laborCostCents)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--ops-muted)]">{t("Fuel")}</dt>
                <dd className="ops-num">{formatCents(computation.internal.fuelCents)}</dd>
              </div>
              <div className="mt-1 flex justify-between gap-2 border-t border-[var(--ops-border-strong)] pt-1 font-semibold">
                <dt>{t("Cost")}</dt>
                <dd className="ops-num">{formatCents(computation.internal.totalCents)}</dd>
              </div>
              <div className="flex justify-between gap-2 font-semibold">
                <dt>{t("Margin")}</dt>
                <dd className="ops-num" style={{ color: computation.internal.marginCents >= 0 ? "var(--ops-won-ink)" : "var(--ops-lost-ink)" }}>
                  {formatCents(computation.internal.marginCents)} · {computation.internal.marginPct.toFixed(0)}%
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-4 grid gap-3 border-t border-[var(--ops-border)] pt-4">
            <Field label={t("Discount")}>
              <div className="flex gap-2">
                <select className="ops-select" value={discountType} onChange={(event) => setDiscountType(event.target.value as "none" | "percent" | "amount")}>
                  <option value="none">{t("None")}</option>
                  <option value="percent">{t("Percent")}</option>
                  <option value="amount">{t("Amount ($)")}</option>
                </select>
                <input
                  type="number"
                  min={0}
                  className="ops-input ops-num w-24"
                  value={discountValue}
                  disabled={discountType === "none"}
                  onChange={(event) => setDiscountValue(Math.max(0, Number(event.target.value) || 0))}
                  aria-label={t("Discount")}
                />
              </div>
            </Field>
            {discountType !== "none" ? (
              <Field label={t("Reason")}>
                <input className="ops-input" value={discountReason} placeholder={t("Repeat customer, neighbour rate…")} onChange={(event) => setDiscountReason(event.target.value)} />
              </Field>
            ) : null}
          </div>

          {linkTargets ? (
            <div className="mt-4 grid gap-3 border-t border-[var(--ops-border)] pt-4">
              <Field label={t("Link to client")} hint={t("Files the quote on their profile and updates lifetime value.")}>
                <select className="ops-select" value={clientId ?? ""} onChange={(event) => setClientId(event.target.value ? Number(event.target.value) : null)}>
                  <option value="">{t("Not linked")}</option>
                  {linkTargets.clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}{client.area ? ` · ${client.area}` : ""}</option>
                  ))}
                </select>
              </Field>
              <Field label={t("Link to lead")} hint={t("Moves the pipeline card to Quoted on save.")}>
                <select className="ops-select" value={leadId ?? ""} onChange={(event) => setLeadId(event.target.value ? Number(event.target.value) : null)}>
                  <option value="">{t("Not linked")}</option>
                  {linkTargets.leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>{lead.name}{lead.area ? ` · ${lead.area}` : ""}</option>
                  ))}
                </select>
              </Field>
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 border-t border-[var(--ops-border)] pt-4">
            <Field label={t("Customer")}>
              <input className="ops-input" value={customerName} placeholder={t("Name")} onChange={(event) => setCustomerName(event.target.value)} />
            </Field>
            <Field label={t("Phone")}>
              <input className="ops-input ops-num" type="tel" inputMode="tel" value={customerPhone} placeholder="604…" onChange={(event) => setCustomerPhone(event.target.value)} />
            </Field>
            <Field label={t("Area")}>
              <input className="ops-input" value={customerArea} placeholder="North Vancouver" onChange={(event) => setCustomerArea(event.target.value)} />
            </Field>
            <Field label={t("Notes")}>
              <textarea className="ops-textarea" rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} />
            </Field>
          </div>

          {saveError ? <p role="alert" className="mt-3 text-sm text-[var(--ops-lost-ink)]">{saveError}</p> : null}

          <div className="mt-4 grid gap-2">
            <button type="button" className="ops-btn" data-variant="ghost" disabled={pending} onClick={() => save("draft")}>
              {pending ? t("Saving…") : t("Save draft")}
            </button>
            <button type="button" className="ops-btn" data-variant="navy" disabled={pending} onClick={() => save("sent")}>
              {t("Mark sent")}
            </button>
            <button type="button" className="ops-btn" data-variant="primary" onClick={() => void copyCustomerText()}>
              {copied ? t("Copied") : t("Copy customer text")}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
