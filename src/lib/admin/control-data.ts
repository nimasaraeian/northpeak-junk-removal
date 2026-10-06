import { desc, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { activityLog, aiActions, type ActivityRow, type AiActionRow } from "@/lib/db/schema";

/**
 * Control Center reads.
 *
 * Every loader is defensive about the `ai_actions` table not existing yet:
 * the v3 migration is applied by hand in Neon, and until it runs these
 * queries would throw "relation does not exist". Rather than crash the panel,
 * a missing table reads as an empty queue — the page renders with a note.
 */

/** Postgres "undefined_table" — the migration has not been applied yet. */
function isMissingTable(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  const message = String((error as { message?: string } | null)?.message ?? "");
  return code === "42P01" || /relation .* does not exist/i.test(message);
}

export interface ControlData {
  tableReady: boolean;
  queue: AiActionRow[];
  recentActivity: ActivityRow[];
  /** Decided actions, for the "what happened" history. */
  recentDecisions: AiActionRow[];
}

export async function loadControlData(): Promise<ControlData> {
  const db = getDb();
  if (!db) {
    return { tableReady: false, queue: [], recentActivity: [], recentDecisions: [] };
  }

  let queue: AiActionRow[] = [];
  let recentDecisions: AiActionRow[] = [];
  let tableReady = true;

  try {
    [queue, recentDecisions] = await Promise.all([
      db
        .select()
        .from(aiActions)
        .where(inArray(aiActions.status, ["pending", "blocked"]))
        .orderBy(desc(aiActions.createdAt)),
      db
        .select()
        .from(aiActions)
        .where(inArray(aiActions.status, ["approved", "rejected", "deferred", "done"]))
        .orderBy(desc(aiActions.decidedAt))
        .limit(12),
    ]);
  } catch (error) {
    if (isMissingTable(error)) {
      tableReady = false;
    } else {
      throw error;
    }
  }

  const recentActivity = await db
    .select()
    .from(activityLog)
    .orderBy(desc(activityLog.createdAt))
    .limit(12);

  return { tableReady, queue, recentActivity, recentDecisions };
}

/** How many actions are waiting on the owner — for the dashboard badge. */
export async function countPendingActions(): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  try {
    const rows = await db
      .select({ id: aiActions.id })
      .from(aiActions)
      .where(inArray(aiActions.status, ["pending", "blocked"]));
    return rows.length;
  } catch (error) {
    if (isMissingTable(error)) return 0;
    throw error;
  }
}
