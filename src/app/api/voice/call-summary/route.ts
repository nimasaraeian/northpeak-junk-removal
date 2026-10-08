import { NextResponse } from "next/server";
import { z } from "zod";
import { voiceAuthorized } from "@/lib/voice/auth";
import { logCallSummary } from "@/lib/voice/receptionist";

/**
 * Stores the call summary + outcome on the lead, and flags anything unclear for
 * Nima's follow-up. Called by the agent at the end of every call, whether or
 * not a visit was booked.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  leadId: z.number().int().positive().optional(),
  name: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  summary: z.string().trim().min(1).max(4000),
  followUp: z.boolean().optional(),
});

export async function POST(request: Request) {
  if (!voiceAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "That summary did not validate." },
      { status: 400 },
    );
  }

  const result = await logCallSummary(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Could not record the call." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, leadId: result.leadId });
}
