import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidBookingDate } from "@/lib/booking/booking-core";
import { voiceAuthorized } from "@/lib/voice/auth";
import { bookEstimateVisit } from "@/lib/voice/receptionist";

/**
 * Books an estimate visit from a live call. The agent only tells the caller
 * it's confirmed after this returns ok — a failure comes back as an error the
 * agent reads out and then logs a follow-up instead.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  callId: z.string().trim().max(120).optional(),
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(40),
  address: z.string().trim().max(240).optional(),
  area: z.string().trim().max(120).optional(),
  date: z.string().trim().max(32),
  window: z.enum(["morning", "midday", "afternoon"]),
  itemsDescription: z.string().trim().max(2000).optional(),
  accessNotes: z.string().trim().max(1000).optional(),
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
      { error: parsed.error.issues[0]?.message ?? "That booking did not validate." },
      { status: 400 },
    );
  }

  if (!isValidBookingDate(parsed.data.date)) {
    return NextResponse.json({ error: "That date is not valid." }, { status: 400 });
  }

  const result = await bookEstimateVisit(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Could not book the visit." }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    reference: result.reference,
    leadId: result.leadId,
    jobId: result.jobId,
    alreadyBooked: result.alreadyBooked ?? false,
  });
}
