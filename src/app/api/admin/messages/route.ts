import { NextResponse } from "next/server";
import { z } from "zod";
import { operatorOrNull } from "@/lib/admin/auth";
import { listMessages } from "@/lib/admin/chat-data";
import { getDb } from "@/lib/db/client";
import { messages } from "@/lib/db/schema";

/**
 * Team chat — read and post.
 *
 * `proxy.ts` already gates /api/admin/*, but every handler re-checks the
 * session for itself (a matcher edit must not be able to open this quietly),
 * exactly like the vision route.
 *
 * GET  ?after=<id>  → messages newer than <id>, for the client's poll.
 * POST { body }     → inserts one message authored by the signed-in operator.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isMissingTable(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  const message = String((error as { message?: string } | null)?.message ?? "");
  return code === "42P01" || /relation .* does not exist/i.test(message);
}

export async function GET(request: Request) {
  const operator = await operatorOrNull();
  if (!operator) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const afterRaw = new URL(request.url).searchParams.get("after");
  const afterId = afterRaw ? Number(afterRaw) : undefined;

  const history = await listMessages(Number.isFinite(afterId) ? afterId : undefined);
  return NextResponse.json(history);
}

const postSchema = z.object({ body: z.string().trim().min(1).max(4000) });

export async function POST(request: Request) {
  const operator = await operatorOrNull();
  if (!operator) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let raw: unknown = null;
  try {
    raw = await request.json();
  } catch {
    // Left null; the schema rejects it below.
  }

  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Write a message first." }, { status: 400 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "The database is not reachable." }, { status: 503 });

  try {
    const [row] = await db
      .insert(messages)
      .values({ author: operator, body: parsed.data.body })
      .returning();
    return NextResponse.json({ ok: true, message: row }, { status: 201 });
  } catch (error) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { error: "Team chat isn't set up yet — run the 0003 migration." },
        { status: 503 },
      );
    }
    throw error;
  }
}
