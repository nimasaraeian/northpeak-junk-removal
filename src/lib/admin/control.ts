import type { AiActionKind, AiActionStatus } from "@/lib/db/schema";

/**
 * Control Center domain copy and helpers — pure, no database.
 *
 * The approval queue is the human-in-the-loop model made concrete: the AI
 * proposes an action, a person approves/edits/rejects/defers it, and nothing
 * leaves the panel until they do.
 */

export const AI_ACTION_KIND_LABELS: Record<AiActionKind, string> = {
  send_estimate: "Send estimate to customer",
  send_message: "Send message to customer",
  publish_instagram: "Publish Instagram draft",
  start_google_ads: "Start Google Ads campaign",
  intake_summary: "Intake summary",
  marketing_draft: "Marketing draft",
  other: "Action",
};

export const AI_ACTION_STATUS_LABELS: Record<AiActionStatus, string> = {
  pending: "Awaiting you",
  approved: "Approved",
  rejected: "Rejected",
  deferred: "Deferred",
  blocked: "Blocked",
  done: "Done",
};

/** Maps a status onto the four pill tones the admin design system has. */
export const AI_ACTION_STATUS_TONE: Record<AiActionStatus, "draft" | "sent" | "won" | "lost"> = {
  pending: "draft",
  approved: "won",
  done: "won",
  deferred: "sent",
  blocked: "lost",
  rejected: "lost",
};

/**
 * The guardrails, stated once so every screen that touches an AI action can
 * show the same words. These are promises the UI keeps, not decoration:
 * the assistant never guesses weight, never approves load safety, never
 * computes a tax rule, and nothing is sent, booked, published or charged on
 * a draft alone.
 */
export const GUARDRAILS = {
  humanDecides: "The assistant only suggests. A person approves before anything is sent.",
  noWeightGuess: "Weight and volume are never guessed — they are confirmed by a person.",
  noSafety: "The software never signs off load safety or towing. A person decides that.",
  noTax: "Tax is not computed here. The owner or accountant confirms the rule.",
  noPayment: "“Paid” is recorded only by the owner's manual check, never by the assistant.",
  nothingUntilApproved: "Nothing is sent, booked, published or charged until you approve it.",
} as const;

export interface DecisionInput {
  decision: "approve" | "reject" | "defer";
  note?: string;
}

export function decisionToStatus(decision: DecisionInput["decision"]): AiActionStatus {
  if (decision === "approve") return "approved";
  if (decision === "reject") return "rejected";
  return "deferred";
}
