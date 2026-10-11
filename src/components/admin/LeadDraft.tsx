"use client";

import { use } from "react";
import { CopyButton } from "@/components/admin/CopyButton";
import type { ActionPlan, ActionPlanItem } from "@/lib/office-manager/briefing";

/**
 * The AI-drafted parts of a lead row, streamed in after the page paints.
 *
 * The Today page renders its CRM lists immediately from the database, then
 * hands each row the `generateActionPlan` promise. These components `use()` it
 * inside a Suspense boundary, so the Anthropic call never blocks the page —
 * the lists are usable at once and the priority + draft message fill in when
 * the model responds. If the plan is empty (model off or failed), they render
 * nothing and the lists stand on their own.
 */

const PRIORITY_TONE: Record<ActionPlanItem["priority"], string> = {
  high: "lost",
  medium: "draft",
  low: "sent",
};

export function LeadPriorityPill({
  leadId,
  planPromise,
}: {
  leadId: number;
  planPromise: Promise<ActionPlan>;
}) {
  const plan = use(planPromise);
  const item = plan.get(leadId);
  if (!item) return null;
  return (
    <span className="ops-pill" data-status={PRIORITY_TONE[item.priority]}>
      {item.priority}
    </span>
  );
}

export function LeadDraftCard({
  leadId,
  planPromise,
}: {
  leadId: number;
  planPromise: Promise<ActionPlan>;
}) {
  const plan = use(planPromise);
  const item = plan.get(leadId);
  if (!item || (!item.why && !item.draftSms)) return null;

  return (
    <>
      {item.why ? (
        <p className="mt-2 text-xs text-[var(--ops-navy)]">
          <span className="font-semibold">Why:</span> {item.why}
        </p>
      ) : null}

      {item.draftSms ? (
        <div className="mt-2 rounded-xl border border-[var(--ops-border)] bg-[var(--ops-surface-2)] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.7rem] font-semibold tracking-[0.1em] text-[var(--ops-muted)] uppercase">
              Draft SMS — not sent
            </p>
            <CopyButton text={item.draftSms} />
          </div>
          <p className="mt-1.5 text-sm leading-6 text-[var(--ops-navy)]">{item.draftSms}</p>
        </div>
      ) : null}
    </>
  );
}
