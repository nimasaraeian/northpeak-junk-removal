import { after } from "next/server";

/**
 * Generous enough for an Apps Script cold start, short enough that a hung
 * endpoint cannot hold a serverless invocation open. Nothing user-facing waits
 * on this either way — the submission result is already decided before the
 * webhook is scheduled.
 */
export const LEAD_WEBHOOK_TIMEOUT_MS = 5_000;

export type LeadSource = "estimate" | "contact";

/**
 * The exact JSON body posted to `LEAD_WEBHOOK_URL`.
 *
 * Deliberately PII-minimal: enough to call the lead back and file the row, and
 * nothing more. No photos, and no free text — the description, access notes and
 * contact message stay in the Telegram notification, which is the channel the
 * team already treats as confidential.
 *
 * Snake-case keys are the wire format the Apps Script receiver reads; do not
 * rename one without updating `automation/google-apps-script/Code.gs`.
 */
export interface LeadWebhookPayload {
  name: string;
  phone: string;
  email: string;
  service: string;
  city: string;
  load_size: string;
  source: LeadSource;
  submitted_at: string;
}

export interface LeadWebhookInput {
  name: string;
  phone: string;
  email: string;
  /** Human-readable service name. Absent for contact-form leads. */
  service?: string;
  /** Service-area city resolved from the postal code. Absent for contact. */
  city?: string;
  /** Truck-volume selection. Absent for contact. */
  loadSize?: string;
  source: LeadSource;
  submittedAt: Date;
}

export interface LeadWebhookOptions {
  /** Overrides `process.env.LEAD_WEBHOOK_URL`. */
  url?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  /**
   * How the background POST is scheduled. Tests pass a collector so they can
   * await the work; production uses `after()`.
   */
  schedule?: (work: () => Promise<void>) => void;
}

function text(value: string | undefined): string {
  return value?.trim() ?? "";
}

/**
 * Pure payload builder, kept separate from delivery so the wire format can be
 * asserted without a network stub.
 */
export function buildLeadWebhookPayload(input: LeadWebhookInput): LeadWebhookPayload {
  // An unparseable date would make `toISOString` throw, and this function is on
  // the success path of a submission that has already been accepted.
  const submittedAt = Number.isNaN(input.submittedAt?.getTime?.() ?? NaN)
    ? new Date()
    : input.submittedAt;

  return {
    name: text(input.name),
    phone: text(input.phone),
    email: text(input.email),
    service: text(input.service),
    city: text(input.city),
    load_size: text(input.loadSize),
    source: input.source,
    submitted_at: submittedAt.toISOString(),
  };
}

/** Never throws, never rejects. Failures are logged and dropped. */
async function postLead(
  url: string,
  payload: LeadWebhookPayload,
  fetchImpl: typeof fetch,
  timeoutMs: number,
): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // An Apps Script /exec URL answers with a 302 to
      // script.googleusercontent.com. doPost has already run by the time that
      // redirect is issued, so following it only collects the result.
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(
        `[lead-webhook] ${payload.source} lead not accepted: HTTP ${response.status}`,
      );
    }
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "AbortError"
        ? "request timed out"
        : error instanceof Error
          ? error.message
          : "network error";
    console.error(`[lead-webhook] ${payload.source} lead failed: ${reason}`);
  } finally {
    clearTimeout(timeout);
  }
}

function scheduleAfterResponse(work: () => Promise<void>): void {
  try {
    // Keeps the serverless invocation alive until the POST settles without the
    // response waiting on it.
    after(work);
  } catch {
    // `after` throws outside a request scope (unit tests, scripts). A detached
    // promise is still never awaited by the caller.
    void work();
  }
}

/**
 * Copies a delivered lead to `LEAD_WEBHOOK_URL`.
 *
 * Returns immediately and synchronously. It is a no-op when the variable is
 * unset, and no failure inside it can reach the caller: the submission result
 * has already been decided by the time this runs.
 */
export function dispatchLeadWebhook(
  input: LeadWebhookInput,
  options: LeadWebhookOptions = {},
): void {
  try {
    const url = (options.url ?? process.env.LEAD_WEBHOOK_URL ?? "").trim();
    if (!url) return;

    const payload = buildLeadWebhookPayload(input);
    const fetchImpl = options.fetchImpl ?? fetch;
    const timeoutMs = options.timeoutMs ?? LEAD_WEBHOOK_TIMEOUT_MS;
    const schedule = options.schedule ?? scheduleAfterResponse;

    schedule(() => postLead(url, payload, fetchImpl, timeoutMs));
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown error";
    console.error(`[lead-webhook] dispatch failed: ${reason}`);
  }
}
