import { z } from "zod";

/**
 * Intake assistant — reads a customer's inbound message and pulls out the
 * facts that are actually stated, then drafts one clarifying question for the
 * gaps. It is an assistant, never the decider:
 *
 * - It only reports what the message says. Anything not stated is "unknown".
 * - It NEVER estimates weight or volume — those are confirmed by a person,
 *   not guessed from a sentence. There is no field for them here on purpose.
 * - Its output is a draft: the operator reads it, and the clarifying question
 *   only goes to the customer once the owner approves it from the queue.
 */

export const MAX_MESSAGE_CHARS = 6000;

export const intakeRequestSchema = z.object({
  message: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
});

export const intakeItemSchema = z.object({
  label: z.string().trim().min(1).max(120),
  /** Null when the message does not say how many. Never guessed. */
  qty: z.number().int().min(1).max(500).nullable(),
});

export const intakeResultSchema = z.object({
  items: z.array(intakeItemSchema).max(40),
  address: z.string().trim().max(300).nullable(),
  access: z.string().trim().max(300).nullable(),
  preferredTime: z.string().trim().max(200).nullable(),
  points: z.array(z.string().trim().min(1).max(200)).max(12),
  clarifyingQuestion: z.string().trim().max(500),
});

export type IntakeItem = z.infer<typeof intakeItemSchema>;
export type IntakeResult = z.infer<typeof intakeResultSchema>;

export const INTAKE_TOOL_NAME = "report_intake";

export const INTAKE_TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    items: {
      type: "array",
      description: "Each distinct item the customer mentions wanting removed.",
      items: {
        type: "object",
        properties: {
          label: { type: "string", description: "Short name, e.g. 'fridge', 'mattress', 'boxes'." },
          qty: {
            type: ["integer", "null"],
            description: "How many, ONLY if the message says. null when not stated — never guess.",
          },
        },
        required: ["label", "qty"],
        additionalProperties: false,
      },
    },
    address: {
      type: ["string", "null"],
      description: "Address or area, only if stated. null otherwise.",
    },
    access: {
      type: ["string", "null"],
      description: "Access notes the customer stated (stairs, elevator, parking). null otherwise.",
    },
    preferredTime: {
      type: ["string", "null"],
      description: "Preferred day/time, only if stated. null otherwise.",
    },
    points: {
      type: "array",
      description: "The key facts found in the message, each a short phrase.",
      items: { type: "string" },
    },
    clarifyingQuestion: {
      type: "string",
      description:
        "One short, friendly question asking for the most important missing details (usually quantity, stairs, and parking). Do not ask for weight.",
    },
  },
  required: ["items", "address", "access", "preferredTime", "points", "clarifyingQuestion"],
  additionalProperties: false,
};

export function buildIntakeSystemPrompt(): string {
  return [
    "You help a junk removal team in North Vancouver, BC read a new customer's message.",
    "",
    `Call the ${INTAKE_TOOL_NAME} tool exactly once. Do not write prose.`,
    "",
    "Hard rules:",
    "- Report ONLY what the message states. Do not infer or assume.",
    "- Never estimate or guess weight or volume. There is no field for them — leave them out entirely.",
    "- If a quantity is not given, set qty to null. Do not guess a number.",
    "- If the address, access, or time is not given, set it to null.",
    "- Keep the clarifying question to one or two sentences, friendly and specific. Ask for the",
    "  most useful missing facts — usually how many of each item, how many flights of stairs or if",
    "  there is an elevator, and parking. Never ask the customer for the weight.",
  ].join("\n");
}
