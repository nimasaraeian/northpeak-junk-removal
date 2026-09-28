"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LeadCardBody } from "@/components/admin/crm-bits";
import { updateLeadStatusAction } from "@/lib/admin/crm-actions";
import { canTransition, LEAD_STATUS_LABELS, PIPELINE_ORDER } from "@/lib/admin/crm";
import type { LeadRow, LeadStatus } from "@/lib/db/schema";

/**
 * The pipeline board.
 *
 * Drag with the HTML5 drag-and-drop API rather than a library: six columns
 * of cards is exactly the case it handles well, and it keeps the admin
 * bundle free of a dependency the rest of the panel would not use.
 *
 * Touch devices get no HTML5 drag at all, so every card also carries a
 * "Move" select. That is the path Sina actually uses from a phone, and it is
 * the reason the board is usable on mobile rather than just visible.
 *
 * The move is applied optimistically and rolled back by a refresh if the
 * server rejects it, so a drag feels instant on a phone connection.
 */

interface LeadBoardProps {
  leads: LeadRow[];
  /** Passed in from the server so the card ages are stable through hydration. */
  now: string;
}

type Move = { id: number; status: LeadStatus };

export function LeadBoard({ leads, now }: LeadBoardProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const nowDate = useMemo(() => new Date(now), [now]);

  const [optimisticLeads, applyMove] = useOptimistic(leads, (current: LeadRow[], move: Move) =>
    current.map((lead) => (lead.id === move.id ? { ...lead, status: move.status } : lead)),
  );

  const [dragging, setDragging] = useState<LeadRow | null>(null);
  const [hoverColumn, setHoverColumn] = useState<LeadStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lostPrompt, setLostPrompt] = useState<{ lead: LeadRow } | null>(null);

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(
      PIPELINE_ORDER.map((status) => [status, [] as LeadRow[]]),
    ) as Record<LeadStatus, LeadRow[]>;
    for (const lead of optimisticLeads) (grouped[lead.status] ?? grouped.new).push(lead);
    return grouped;
  }, [optimisticLeads]);

  function move(lead: LeadRow, status: LeadStatus, lostReason?: string) {
    if (!canTransition(lead.status, status)) {
      setError(`A ${lead.status} lead cannot move to ${status}.`);
      return;
    }
    setError(null);

    startTransition(async () => {
      applyMove({ id: lead.id, status });
      const result = await updateLeadStatusAction(lead.id, status, lostReason);
      if (!result.ok) setError(result.error ?? "That move did not save.");
      router.refresh();
    });
  }

  function requestMove(lead: LeadRow, status: LeadStatus) {
    // Lost always needs a reason, so it routes through a prompt first.
    if (status === "lost") {
      setLostPrompt({ lead });
      return;
    }
    move(lead, status);
  }

  return (
    <>
      {error ? (
        <p
          role="alert"
          className="mb-3 rounded-lg border border-[#e7bcbc] bg-[var(--ops-lost-bg)] px-3 py-2 text-sm text-[var(--ops-lost-ink)]"
        >
          {error}
        </p>
      ) : null}

      {/* Horizontal scroll on mobile, six columns on a wide screen. */}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-3 xl:min-w-0">
          {PIPELINE_ORDER.map((status) => {
            const cards = columns[status];
            return (
              <section
                key={status}
                className="flex w-[15rem] shrink-0 flex-col rounded-xl border border-[var(--ops-border)] bg-[var(--ops-surface-2)] xl:w-auto xl:flex-1"
                data-hover={hoverColumn === status}
                style={
                  hoverColumn === status
                    ? { outline: "2px dashed var(--ops-gold)", outlineOffset: "-2px" }
                    : undefined
                }
                onDragOver={(event) => {
                  if (!dragging || !canTransition(dragging.status, status)) return;
                  event.preventDefault();
                  setHoverColumn(status);
                }}
                onDragLeave={() => setHoverColumn((c) => (c === status ? null : c))}
                onDrop={(event) => {
                  event.preventDefault();
                  setHoverColumn(null);
                  if (dragging) requestMove(dragging, status);
                  setDragging(null);
                }}
                aria-label={LEAD_STATUS_LABELS[status]}
              >
                <header className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ops-muted)]">
                    {LEAD_STATUS_LABELS[status]}
                  </h2>
                  <span className="ops-num rounded-full bg-[var(--ops-surface)] px-2 py-0.5 text-xs font-semibold text-[var(--ops-muted)]">
                    {cards.length}
                  </span>
                </header>

                <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
                  {cards.length === 0 ? (
                    <p className="px-1 py-6 text-center text-xs text-[var(--ops-faint)]">
                      Nothing here.
                    </p>
                  ) : null}

                  {cards.map((lead) => (
                    <article
                      key={lead.id}
                      draggable
                      onDragStart={() => setDragging(lead)}
                      onDragEnd={() => {
                        setDragging(null);
                        setHoverColumn(null);
                      }}
                      className="ops-card cursor-grab p-2.5 active:cursor-grabbing"
                    >
                      <Link href={`/admin/leads/${lead.id}`} className="block">
                        <LeadCardBody lead={lead} now={nowDate} />
                      </Link>

                      {/* The mobile path: no HTML5 drag on touch. */}
                      <label className="mt-2 block">
                        <span className="sr-only">Move {lead.name} to another stage</span>
                        <select
                          className="ops-select text-xs"
                          value={lead.status}
                          onChange={(event) =>
                            requestMove(lead, event.target.value as LeadStatus)
                          }
                        >
                          {PIPELINE_ORDER.map((option) => (
                            <option
                              key={option}
                              value={option}
                              disabled={option !== lead.status && !canTransition(lead.status, option)}
                            >
                              {LEAD_STATUS_LABELS[option]}
                            </option>
                          ))}
                        </select>
                      </label>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {lostPrompt ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            className="ops-card w-full max-w-sm p-4"
            onSubmit={(event) => {
              event.preventDefault();
              const reason = new FormData(event.currentTarget).get("reason");
              move(lostPrompt.lead, "lost", typeof reason === "string" ? reason : "");
              setLostPrompt(null);
            }}
          >
            <h2 className="text-sm font-semibold text-[var(--ops-navy)]">
              Why did {lostPrompt.lead.name} go?
            </h2>
            <p className="mt-1 text-xs text-[var(--ops-muted)]">
              Worth a line — it is the only way the lost column tells you anything later.
            </p>
            <input
              name="reason"
              className="ops-input mt-3"
              placeholder="Price, timing, went elsewhere…"
              autoFocus
            />
            <div className="mt-4 flex gap-2">
              <button type="submit" className="ops-btn flex-1" data-variant="navy">
                Mark lost
              </button>
              <button
                type="button"
                className="ops-btn"
                data-variant="ghost"
                onClick={() => setLostPrompt(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
