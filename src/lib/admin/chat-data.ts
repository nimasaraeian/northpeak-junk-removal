import { asc, desc, gt } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { messages, type MessageRow } from "@/lib/db/schema";

/**
 * Team-chat reads.
 *
 * Defensive about a missing table: the cockpit ships before the operator runs
 * the 0003 migration, so a read must return an empty history rather than throw
 * and blank the whole panel. Mirrors the Control Center's `isMissingTable`
 * handling.
 */

export const CHAT_PAGE_SIZE = 200;

function isMissingTable(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  const message = String((error as { message?: string } | null)?.message ?? "");
  return code === "42P01" || /relation .* does not exist/i.test(message);
}

export interface ChatHistory {
  ready: boolean;
  messages: MessageRow[];
}

/**
 * The most recent messages, oldest-first so the view reads top-to-bottom.
 *
 * When `afterId` is given, returns only messages newer than it — the poll path,
 * so the client fetches just the delta.
 */
export async function listMessages(afterId?: number): Promise<ChatHistory> {
  const db = getDb();
  if (!db) return { ready: false, messages: [] };

  try {
    if (afterId && Number.isInteger(afterId)) {
      // Poll path: just the delta, oldest-first.
      const rows = await db
        .select()
        .from(messages)
        .where(gt(messages.id, afterId))
        .orderBy(asc(messages.id))
        .limit(CHAT_PAGE_SIZE);
      return { ready: true, messages: rows };
    }
    // Initial load: the most recent page, then flip to oldest-first for display.
    const latest = await db
      .select()
      .from(messages)
      .orderBy(desc(messages.id))
      .limit(CHAT_PAGE_SIZE);
    return { ready: true, messages: latest.reverse() };
  } catch (error) {
    if (isMissingTable(error)) return { ready: false, messages: [] };
    throw error;
  }
}
