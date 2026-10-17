"use client";

import { SLA_STAGE_LABELS, slaSpan, type SlaClock } from "@/lib/admin/sales";
import { useT } from "@/lib/i18n/provider";

/** The speed-to-lead timer: green with time to spare, amber, red, pulsing red when late. */
export function SlaChip({ clock, withStage = false }: { clock: SlaClock | null; withStage?: boolean }) {
  const { t } = useT();
  if (!clock) return null;
  const late = clock.remainingMinutes < 0;
  const text = `${slaSpan(clock)} ${late ? t("late") : t("left")}`;
  return (
    <span
      className="ops-sla"
      data-state={clock.state}
      title={`${t(SLA_STAGE_LABELS[clock.stage])} · ${t("target")} ${clock.targetMinutes} ${t("business minutes")}`}
    >
      {withStage ? `${t(SLA_STAGE_LABELS[clock.stage])} · ` : ""}
      {text}
    </span>
  );
}
