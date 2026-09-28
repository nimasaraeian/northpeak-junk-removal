import { NextResponse } from "next/server";
import { site } from "@/content/site";
import {
  checkIntakeRate,
  decideIntake,
  intakeSecret,
  INTAKE_SECRET_HEADER,
  isOriginAllowed,
} from "@/lib/admin/lead-intake";
import { isDatabaseConfigured } from "@/lib/db/client";
import { insertWebsiteLead } from "@/lib/leads/crm-intake";

/**
 * Public lead intake.
 *
 * The one unauthenticated route that writes to the CRM. It inserts a lead
 * and an activity row and does nothing else — no reads, no updates, no
 * other table. A caller needs the shared secret in a header, and a browser
 * caller also needs to be on our own origin.
 *
 * Every decision before the insert lives in `@/lib/admin/lead-intake` as
 * pure functions, so the auth and validation behaviour is unit-tested
 * without standing up a request.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !isOriginAllowed(origin, site.url)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": `Content-Type, ${INTAKE_SECRET_HEADER}`,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  if (!isOriginAllowed(origin, site.url)) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (!isOriginAllowed(origin, site.url)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Behind Vercel the client IP is the first hop in x-forwarded-for.
  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rate = checkIntakeRate(key);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many submissions." },
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(rate.retryAfterSeconds) },
      },
    );
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    // Left null; `decideIntake` rejects it after the secret check, so a
    // caller without the secret cannot tell valid JSON from invalid.
  }

  const decision = decideIntake({
    secretHeader: request.headers.get(INTAKE_SECRET_HEADER),
    expectedSecret: intakeSecret(),
    body,
  });

  if (!decision.ok) {
    return NextResponse.json({ error: decision.error }, { status: decision.status, headers });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not available." }, { status: 503, headers });
  }

  // Same insert the estimate form runs, so a lead is the same row whichever
  // door it came through.
  const result = await insertWebsiteLead({
    name: decision.lead.name,
    phone: decision.lead.phone,
    email: decision.lead.email,
    area: decision.lead.area,
    message: decision.lead.message,
    source: decision.lead.source ?? "website_form",
    origin: "website_form",
  });

  if (!result.ok) {
    return NextResponse.json({ error: "Could not record that lead." }, { status: 500, headers });
  }

  // The id is useful to the caller for correlation; nothing else is
  // returned, so a probe with a leaked secret learns nothing about the
  // pipeline.
  return NextResponse.json({ ok: true, id: result.id ?? null }, { status: 201, headers });
}
