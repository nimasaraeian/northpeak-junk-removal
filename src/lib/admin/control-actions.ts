"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireOperator } from "@/lib/admin/auth";
import { decisionToStatus } from "@/lib/admin/control";
import { getDb } from "@/lib/db/client";
import {
  activityLog,
  aiActions,
  AI_ACTION_ENTITIES,
  AI_ACTION_KINDS,
  type ActivityEntity,
} from "@/lib/db/schema";
import type { Db } from "@/lib/db/client";

/**
 * Control Center mutations.
 *
 * Like every CRM action, each one re-checks the session for itself before it
 * touches the database — `admin-security.test.ts` fails the build if one
 * skips it. Approving an action here records the owner's decision; it never
 * reaches out to an outside service on its own, because no integration is
 * wired yet (that is Phase 2). The decision is the fact we keep.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: number;
}

const DB_UNREACHABLE = "The database is not reachable.";

/** Logs to the shared timeline, but only for actions tied to a real record. */
async function logDecision(
  db: Db,
  entityType: ActivityEntity | "none",
  entityId: number | null,
  actor: string,
  body: string,
): Promise<void> {
  if (entityType === "none" || entityId === null) return;
  await db.insert(activityLog).values({
    entityType,
    entityId,
    actor,
    kind: "system",
    body,
  });
}

const decisionSchema = z.object({
  decision: z.enum(["approve", "reject", "defer"]),
  note: z.string().trim().max(2000).optional(),
});

export async function decideAiActionAction(
  actionId: number,
  rawDecision: string,
  note?: string,
): Promise<ActionResult> {
  const operator = await requireOperator();

  const parsed = decisionSchema.safeParse({ decision: rawDecision, note });
  if (!parsed.success) return { ok: false, error: "Unknown decision." };
  if (!Number.isInteger(actionId)) return { ok: false, error: "Unknown action." };

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const [current] = await db.select().from(aiActions).where(eq(aiActions.id, actionId)).limit(1);
  if (!current) return { ok: false, error: "That action no longer exists." };
  if (current.status !== "pending" && current.status !== "blocked") {
    return { ok: false, error: `This action was already ${current.status}.` };
  }
  if (current.status === "blocked" && parsed.data.decision === "approve") {
    return {
      ok: false,
      error: current.blockedReason
        ? `Blocked: ${current.blockedReason}. Resolve it before approving.`
        : "This action is blocked and cannot be approved yet.",
    };
  }

  const status = decisionToStatus(parsed.data.decision);

  await db
    .update(aiActions)
    .set({
      status,
      decidedBy: operator,
      decidedAt: new Date(),
      note: parsed.data.note ?? "",
    })
    .where(eq(aiActions.id, actionId));

  await logDecision(
    db,
    current.entityType,
    current.entityId,
    operator,
    `${operator} ${status} the action “${current.title}”.`,
  );

  revalidatePath("/admin/control");
  revalidatePath("/admin");
  return { ok: true };
}

const createSchema = z.object({
  kind: z.enum(AI_ACTION_KINDS),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(600).default(""),
  payload: z.record(z.string(), z.unknown()).default({}),
  entityType: z.enum(AI_ACTION_ENTITIES).default("none"),
  entityId: z.number().int().nullable().default(null),
  blockedReason: z.string().trim().max(300).optional(),
});

/** Enqueues a drafted action for the owner to decide on. */
export async function createAiActionAction(raw: unknown): Promise<ActionResult> {
  const operator = await requireOperator();

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That action did not validate." };
  }

  const db = getDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const { blockedReason, ...rest } = parsed.data;

  const [inserted] = await db
    .insert(aiActions)
    .values({
      ...rest,
      status: blockedReason ? "blocked" : "pending",
      blockedReason: blockedReason ?? null,
      createdBy: `${operator} (drafted)`,
    })
    .returning({ id: aiActions.id });

  revalidatePath("/admin/control");
  revalidatePath("/admin");
  return { ok: true, id: inserted?.id };
}
