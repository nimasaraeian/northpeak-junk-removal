"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireOperator } from "@/lib/admin/auth";
import { statusChangeBody } from "@/lib/admin/crm";
import {
  CALL_FLAGS,
  CALL_OUTCOME_LABELS,
  CALL_OUTCOMES,
  defaultFollowUp,
  statusAfterCall,
} from "@/lib/admin/sales";
import { getMigratedDb } from "@/lib/db/migrations";
import { activityLog, CALL_DIRECTIONS, calls, clients, leads } from "@/lib/db/schema";

/**
 * Sales-engine mutations.
 *
 * `requireOperator()` comes first in every action, before any database call —
 * `admin-security.test.ts` checks it. A logged call writes three things at
 * once: the call row, the lead's next follow-up (and status, when the outcome
 * moves it), and a timeline entry, so the lead page, the call list and the
 * timers all agree the moment the form is saved.
 */

export interface LogCallResult {
  ok: boolean;
  error?: string;
  /** What changed, for the confirmation toast. */
  statusChangedTo?: string;
  nextFollowUpAt?: string | null;
}

const DB_UNREACHABLE = "The database is not reachable.";

const callSchema = z.object({
  leadId: z.number().int().positive().optional(),
  clientId: z.number().int().positive().optional(),
  outcome: z.enum(CALL_OUTCOMES),
  direction: z.enum(CALL_DIRECTIONS).default("outbound"),
  notes: z.string().trim().max(4000).default(""),
  flags: z.array(z.enum(CALL_FLAGS)).max(CALL_FLAGS.length).default([]),
  /**
   * ISO string to set a specific follow-up, "" to clear it, or omitted to use
   * the outcome's default (no answer → two business hours, and so on).
   */
  nextFollowUpAt: z.string().trim().max(40).optional(),
  /** Booked / not interested: the lost reason when the outcome closes a lead. */
  lostReason: z.string().trim().max(400).optional(),
});

export async function logCallAction(raw: unknown): Promise<LogCallResult> {
  const operator = await requireOperator();

  const parsed = callSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That call did not validate." };
  }
  const input = parsed.data;
  if (!input.leadId && !input.clientId) return { ok: false, error: "Pick a lead or a client." };

  let followUp: Date | null;
  if (input.nextFollowUpAt === undefined) {
    followUp = defaultFollowUp(input.outcome, new Date());
  } else if (input.nextFollowUpAt === "") {
    followUp = null;
  } else {
    const parsedDate = new Date(input.nextFollowUpAt);
    if (Number.isNaN(parsedDate.getTime())) return { ok: false, error: "That follow-up date is not valid." };
    followUp = parsedDate;
  }

  const db = await getMigratedDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const lead = input.leadId
    ? (await db.select().from(leads).where(eq(leads.id, input.leadId)).limit(1))[0]
    : undefined;
  if (input.leadId && !lead) return { ok: false, error: "That lead no longer exists." };

  const clientId = input.clientId ?? lead?.clientId ?? null;
  if (input.clientId) {
    const [client] = await db.select({ id: clients.id }).from(clients).where(eq(clients.id, input.clientId)).limit(1);
    if (!client) return { ok: false, error: "That client no longer exists." };
  }

  await db.insert(calls).values({
    leadId: lead?.id ?? null,
    clientId,
    actor: operator,
    direction: input.direction,
    outcome: input.outcome,
    notes: input.notes,
    flags: input.flags,
    nextFollowUpAt: followUp,
  });

  const label = CALL_OUTCOME_LABELS[input.outcome];
  const body = input.notes ? `Call · ${label} — ${input.notes}` : `Call · ${label}`;

  let statusChangedTo: string | undefined;
  if (lead) {
    const next = statusAfterCall(lead.status, input.outcome);
    const lostReason = next === "lost" ? input.lostReason?.trim() || label : null;

    await db
      .update(leads)
      .set({
        nextFollowUpAt: followUp,
        ...(next ? { status: next, lostReason } : {}),
      })
      .where(eq(leads.id, lead.id));

    await db.insert(activityLog).values({
      entityType: "lead",
      entityId: lead.id,
      actor: operator,
      kind: "call",
      body,
    });

    if (next) {
      statusChangedTo = next;
      await db.insert(activityLog).values({
        entityType: "lead",
        entityId: lead.id,
        actor: operator,
        kind: "status_change",
        body: statusChangeBody("lead", lead.status, next, lostReason),
      });
    }
    revalidatePath(`/admin/leads/${lead.id}`);
  }

  if (clientId && !lead) {
    await db.insert(activityLog).values({
      entityType: "client",
      entityId: clientId,
      actor: operator,
      kind: "call",
      body,
    });
    revalidatePath(`/admin/clients/${clientId}`);
  }

  for (const path of ["/admin", "/admin/calls", "/admin/leads", "/admin/today"]) revalidatePath(path);

  return { ok: true, statusChangedTo, nextFollowUpAt: followUp?.toISOString() ?? null };
}
