"use client";

import { useState, useTransition } from "react";
import { updateLeadStatusAction } from "@/lib/admin/crm-actions";
import { PIPELINE_ORDER } from "@/lib/admin/crm";
import type { LeadRow, LeadStatus } from "@/lib/db/schema";

type T = (s: string) => string;

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  booked: "Booked",
  won: "Won",
  lost: "Lost",
};

export function KanbanBoard({
  leads,
  t,
  onOpen,
  onChanged,
  onError,
}: {
  leads: LeadRow[];
  t: T;
  onOpen: (id: number) => void;
  onChanged: () => void;
  onError: (msg: string) => void;
}) {
  const [pending, start] = useTransition();
  const [dragId, setDragId] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<LeadStatus | null>(null);

  const byStatus = (s: LeadStatus) => leads.filter((l) => l.status === s);

  function drop(target: LeadStatus) {
    setOverCol(null);
    const id = dragId;
    setDragId(null);
    if (id === null) return;
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.status === target) return;
    start(async () => {
      const r = await updateLeadStatusAction(id, target);
      if (!r.ok) onError(r.error ?? "Could not move the lead.");
      else onChanged();
    });
  }

  return (
    <div className="kan" aria-busy={pending}>
      {PIPELINE_ORDER.map((s) => {
        const items = byStatus(s);
        return (
          <div
            key={s}
            className={`col${overCol === s ? " over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (overCol !== s) setOverCol(s);
            }}
            onDragLeave={() => setOverCol((c) => (c === s ? null : c))}
            onDrop={() => drop(s)}
          >
            <h4>
              {t(STATUS_LABEL[s])}
              <b>{items.length}</b>
            </h4>
            {items.map((l) => (
              <div
                key={l.id}
                className={`cc${dragId === l.id ? " drag" : ""}`}
                draggable
                onDragStart={() => setDragId(l.id)}
                onDragEnd={() => setDragId(null)}
                onClick={() => onOpen(l.id)}
              >
                <b>{l.name}</b>
                <span>
                  {[l.area, l.owner === "unassigned" ? null : l.owner].filter(Boolean).join(" · ") || "—"}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
