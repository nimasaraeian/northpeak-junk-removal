import { NextResponse } from "next/server";
import { listJobsBetween } from "@/lib/admin/crm-data";
import { voiceAuthorized } from "@/lib/voice/auth";
import { computeAvailableSlots } from "@/lib/voice/receptionist";

/**
 * Free estimate-visit slots, for the AI receptionist to offer on a live call.
 * Protected by the shared voice secret; returns a short list the agent can read.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!voiceAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();
  const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const to = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  try {
    const existing = await listJobsBetween(from, to);
    const slots = computeAvailableSlots(existing, now);
    return NextResponse.json({ ok: true, slots });
  } catch {
    return NextResponse.json({ error: "Could not read availability." }, { status: 500 });
  }
}
