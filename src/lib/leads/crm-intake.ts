import { after } from "next/server";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { activityLog, leads, type LeadSource } from "@/lib/db/schema";

/**
 * Files a website lead into the CRM pipeline.
 *
 * This is the connector that makes `/admin/leads` fill up on its own. It is
 * called from two places, and they share this one function so the row a
 * website enquiry produces is identical either way:
 *
 * - `POST /api/leads/intake`, for anything posting from outside the app.
 * - `submitEstimateCore`, our own estimate form — a direct call rather than
 *   an HTTP round trip to our own endpoint. See the note on `dispatchCrmLead`.
 *
 * Nothing user-facing ever waits on this, and nothing it does can fail a
 * submission. The customer's experience of the estimate form is decided
 * before this is scheduled, exactly as it is for the lead webhook.
 */

export interface CrmLeadInput {
  name: string;
  phone: string;
  email: string;
  area: string;
  message: string;
  source: LeadSource;
  /** How it reached us, for the timeline's first line. */
  origin: "website_form" | "manual";
  note?: string;
}

export interface CrmLeadResult {
  ok: boolean;
  id?: number;
  error?: string;
}

/**
 * The insert itself. Awaited by the API route, which wants a status code.
 *
 * Returns rather than throws: a CRM write must never be the reason a
 * customer is told their enquiry failed.
 */
export async function insertWebsiteLead(input: CrmLeadInput): Promise<CrmLeadResult> {
  const db = getDb();
  if (!db) return { ok: false, error: "No database configured." };

  try {
    const [inserted] = await db
      .insert(leads)
      .values({
        name: input.name,
        phone: input.phone,
        email: input.email,
        area: input.area,
        message: input.message,
        source: input.source,
        createdFrom: input.origin,
        status: "new",
        owner: "unassigned",
      })
      .returning({ id: leads.id });

    if (!inserted) return { ok: false, error: "Insert returned no row." };

    await db.insert(activityLog).values({
      entityType: "lead",
      entityId: inserted.id,
      actor: "website",
      kind: "system",
      body: input.note ?? "Lead arrived from the website form.",
    });

    return { ok: true, id: inserted.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Insert failed." };
  }
}

/**
 * Fire-and-forget version, for the estimate form.
 *
 * Deliberately a direct call rather than `fetch`-ing our own
 * `/api/leads/intake`: a server-to-server request to ourselves needs an
 * absolute origin that differs per environment, adds a cold start and a
 * network hop inside the request we are already serving, and can fail for
 * reasons that have nothing to do with the data. The endpoint still exists
 * and is the supported path for anything outside this app — it just runs the
 * same `insertWebsiteLead` underneath, so both routes produce the same row.
 *
 * Scheduled with `after()` so it runs once the response is on its way, and
 * wrapped so a database problem can never surface to the customer.
 */
export function dispatchCrmLead(input: CrmLeadInput): void {
  // No database configured means no CRM to file into — the same "unset is a
  // no-op" contract the lead webhook has for a missing URL. Returning before
  // `after()` also keeps this callable from a plain unit test, where there is
  // no request scope for `after` to attach to.
  if (!isDatabaseConfigured()) return;

  try {
    after(async () => {
      try {
        await insertWebsiteLead(input);
      } catch {
        // Swallowed on purpose. The lead has already reached the team through
        // Telegram and the webhook; the CRM row is the third copy, and losing
        // it must not be visible anywhere on the public path.
      }
    });
  } catch {
    // `after` throws if it is somehow reached outside a request. Nothing on
    // the customer's path may fail because of the CRM.
  }
}
