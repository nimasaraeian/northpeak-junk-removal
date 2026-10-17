"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import {
  CALL_FLAG_LABELS,
  CALL_REASON_LABELS,
  fillTemplate,
  type CallFlag,
  type CallItem,
} from "@/lib/admin/sales";
import { useT } from "@/lib/i18n/provider";
import { LogCallForm } from "./LogCallForm";
import { SlaChip } from "./SlaChip";

function dollars(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-CA")}`;
}

/** One person to call: who, why now, a tap-to-dial link, and the log form inline. */
export function CallListRow({ item, rank }: { item: CallItem; rank: number }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const href = (item.kind === "lead" ? `/admin/leads/${item.id}` : `/admin/clients/${item.id}`) as Route;
  const tel = item.phone.replace(/[^\d+]/g, "");

  return (
    <li className="p-3 sm:p-4">
      <div className="flex flex-wrap items-start gap-3">
        <span className="mt-0.5 w-6 shrink-0 text-end text-sm font-semibold tabular-nums text-[var(--ops-faint)]">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={href} className="text-sm font-semibold text-[var(--ops-navy)] hover:underline">
              {item.name || t("Unnamed lead")}
            </Link>
            <SlaChip clock={item.clock} />
            {item.valueCents > 0 ? (
              <span className="text-xs font-semibold text-[var(--ops-gold-ink)]">~{dollars(item.valueCents)}</span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs font-semibold text-[var(--ops-text)]">{t(CALL_REASON_LABELS[item.reason])}</p>
          <p className="mt-0.5 text-xs text-[var(--ops-muted)]">
            {fillTemplate(t(item.why), item.whyVars)}
            {item.area ? ` · ${item.area}` : ""}
            {item.owner && item.owner !== "unassigned" ? ` · ${item.owner}` : ""}
          </p>
          {item.flags.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {item.flags.map((flag) => (
                <span key={flag} className="ops-pill" data-status="draft">
                  {t(CALL_FLAG_LABELS[flag as CallFlag] ?? flag)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {tel ? (
            <a href={`tel:${tel}`} className="ops-btn" data-variant="navy">
              {t("Call")} {item.phone}
            </a>
          ) : (
            <span className="text-xs text-[var(--ops-faint)]">{t("No phone on file")}</span>
          )}
          <button type="button" className="ops-btn" data-variant="ghost" onClick={() => setOpen(!open)}>
            {open ? t("Close") : t("Log call")}
          </button>
        </div>
      </div>
      {open ? (
        <div className="mt-3 rounded-lg border border-[var(--ops-border)] bg-[var(--ops-surface-2)] p-3 sm:ms-9">
          <LogCallForm
            leadId={item.kind === "lead" ? item.id : undefined}
            clientId={item.kind === "client" ? item.id : undefined}
            onSaved={() => setOpen(false)}
          />
        </div>
      ) : null}
    </li>
  );
}
