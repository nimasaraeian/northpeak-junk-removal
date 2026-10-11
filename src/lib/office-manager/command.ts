import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { anthropicApiKey, visionModel } from "@/lib/admin/config";
import { listClients, listJobsBetween, listLeads, listUnscheduledJobs } from "@/lib/admin/crm-data";
import {
  createJobAction,
  logActivityAction,
  rescheduleJobAction,
  updateLeadFieldsAction,
  updateLeadStatusAction,
  type ActionResult,
} from "@/lib/admin/crm-actions";
import { zonedInstant } from "@/lib/booking/booking-core";
import { JOB_ASSIGNEES, LEAD_STATUSES } from "@/lib/db/schema";

/**
 * The CRM command console — natural language in any language → a *proposed*
 * CRM change the operator approves before anything runs.
 *
 * Two phases, on purpose, so the owner's rule holds ("no executive action
 * without my approval"):
 *   1. interpretCommand() reads the CRM and asks the model which single
 *      operation the command means, resolved to a specific record. It changes
 *      nothing — it returns a proposal, a clarifying question, or an error.
 *   2. executeOperation() runs ONLY the structured operation the operator
 *      approved, re-validated here and dispatched to the existing CRM actions
 *      (which each write an activity-log row). The model is never in this path.
 */

const TZ = "America/Vancouver";
const DEFAULT_JOB_HOURS = 2;

function vanToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const m: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") m[p.type] = p.value;
  return `${m.year}-${m.month}-${m.day}`;
}

// --- The operations the console can propose ---------------------------------

export const EntityTypeSchema = z.enum(["lead", "client", "job"]);

export const ProposedOperationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("set_lead_status"),
    leadId: z.number().int().positive(),
    leadLabel: z.string(),
    status: z.enum(LEAD_STATUSES),
    lostReason: z.string().optional(),
  }),
  z.object({
    kind: z.literal("set_lead_followup"),
    leadId: z.number().int().positive(),
    leadLabel: z.string(),
    date: z.string().trim().max(10), // YYYY-MM-DD, or "" to clear
  }),
  z.object({
    kind: z.literal("add_note"),
    entityType: EntityTypeSchema,
    entityId: z.number().int().positive(),
    entityLabel: z.string(),
    note: z.string().trim().min(1).max(4000),
  }),
  z.object({
    kind: z.literal("create_job"),
    clientId: z.number().int().positive().nullable(),
    clientLabel: z.string(),
    address: z.string().trim().max(240),
    assignedTo: z.enum(JOB_ASSIGNEES),
    date: z.string().trim().max(10), // "" = unscheduled
    hour: z.number().int().min(0).max(23).nullable(),
    durationHours: z.number().min(1).max(8).default(DEFAULT_JOB_HOURS),
    notes: z.string().trim().max(4000).default(""),
  }),
  z.object({
    kind: z.literal("reschedule_job"),
    jobId: z.number().int().positive(),
    jobLabel: z.string(),
    date: z.string().trim().max(10),
    hour: z.number().int().min(0).max(23),
    durationHours: z.number().min(1).max(8).default(DEFAULT_JOB_HOURS),
  }),
]);

export type ProposedOperation = z.infer<typeof ProposedOperationSchema>;

export type InterpretResult =
  | { status: "proposal"; op: ProposedOperation; summary: string }
  | { status: "clarify"; message: string }
  | { status: "error"; message: string };

// --- Phase 1: interpret (read-only) ----------------------------------------

interface LeadCtx {
  id: number;
  name: string;
  area: string;
  status: string;
  phone: string;
}
interface ClientCtx {
  id: number;
  name: string;
  area: string;
}
interface JobCtx {
  id: number;
  address: string;
  clientId: number | null;
  status: string;
  when: string;
}

function leadLabel(l: LeadCtx): string {
  return `#${l.id} ${l.name || "Unnamed"}${l.area ? ` · ${l.area}` : ""}`;
}
function clientLabel(c: ClientCtx): string {
  return `#${c.id} ${c.name || "Unnamed"}`;
}
function jobLabel(j: JobCtx): string {
  return `#${j.id} ${j.address || "(no address)"}`;
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: "set_lead_status",
    description: "Move a lead to a new pipeline status.",
    input_schema: {
      type: "object",
      properties: {
        leadId: { type: "number", description: "The lead's id from the list." },
        status: { type: "string", enum: [...LEAD_STATUSES] },
        lostReason: { type: "string", description: "Only when status is 'lost'." },
      },
      required: ["leadId", "status"],
    },
  },
  {
    name: "set_lead_followup",
    description: "Set or clear a lead's next follow-up date.",
    input_schema: {
      type: "object",
      properties: {
        leadId: { type: "number" },
        date: { type: "string", description: "YYYY-MM-DD, or empty string to clear." },
      },
      required: ["leadId", "date"],
    },
  },
  {
    name: "add_note",
    description: "Add a timeline note to a lead, client, or job.",
    input_schema: {
      type: "object",
      properties: {
        entityType: { type: "string", enum: ["lead", "client", "job"] },
        entityId: { type: "number" },
        note: { type: "string" },
      },
      required: ["entityType", "entityId", "note"],
    },
  },
  {
    name: "create_job",
    description: "Create a new job, optionally scheduled and linked to a client.",
    input_schema: {
      type: "object",
      properties: {
        clientId: { type: ["number", "null"], description: "Client id, or null." },
        address: { type: "string" },
        assignedTo: { type: "string", enum: [...JOB_ASSIGNEES] },
        date: { type: "string", description: "YYYY-MM-DD, or empty for unscheduled." },
        hour: { type: ["number", "null"], description: "Start hour 0-23 local, or null." },
        durationHours: { type: "number", description: "Default 2." },
        notes: { type: "string" },
      },
      required: ["address", "assignedTo"],
    },
  },
  {
    name: "reschedule_job",
    description: "Change the date/time of an existing job.",
    input_schema: {
      type: "object",
      properties: {
        jobId: { type: "number" },
        date: { type: "string", description: "YYYY-MM-DD." },
        hour: { type: "number", description: "Start hour 0-23 local." },
        durationHours: { type: "number", description: "Default 2." },
      },
      required: ["jobId", "date", "hour"],
    },
  },
  {
    name: "ask_clarification",
    description:
      "Use when the command is ambiguous, the record can't be found, or it asks for something these tools can't do.",
    input_schema: {
      type: "object",
      properties: { question: { type: "string" } },
      required: ["question"],
    },
  },
];

export async function interpretCommand(command: string, now = new Date()): Promise<InterpretResult> {
  const trimmed = command.trim();
  if (!trimmed) return { status: "error", message: "Type a command first." };

  const apiKey = anthropicApiKey();
  if (!apiKey) return { status: "error", message: "The assistant isn't configured (no API key)." };

  // Read the CRM for context. Nothing here mutates.
  const horizon = new Date(now.getTime() + 30 * 86400000);
  const [allLeads, allClients, scheduledJobs, unscheduledJobs] = await Promise.all([
    listLeads({}, 500),
    listClients("", 200),
    listJobsBetween(now, horizon),
    listUnscheduledJobs(50),
  ]);

  const leadCtx: LeadCtx[] = allLeads
    .filter((l) => l.status !== "won" && l.status !== "lost")
    .slice(0, 120)
    .map((l) => ({
      id: l.id,
      name: l.name,
      area: l.area ?? "",
      status: l.status,
      phone: l.phone ?? "",
    }));
  const clientCtx: ClientCtx[] = allClients
    .slice(0, 120)
    .map((c) => ({ id: c.id, name: c.name, area: c.area ?? "" }));
  const jobCtx: JobCtx[] = [...scheduledJobs, ...unscheduledJobs].slice(0, 80).map((j) => ({
    id: j.id,
    address: j.address ?? "",
    clientId: j.clientId,
    status: j.status,
    when: j.scheduledStart
      ? new Intl.DateTimeFormat("en-CA", {
          timeZone: TZ,
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date(j.scheduledStart))
      : "unscheduled",
  }));

  const leadById = new Map(leadCtx.map((l) => [l.id, l]));
  const clientById = new Map(clientCtx.map((c) => [c.id, c]));
  const jobById = new Map(jobCtx.map((j) => [j.id, j]));

  const system = `You are the CRM assistant for NorthPeak Junk Removal (North Vancouver, BC). The operator writes a command in any language; you turn it into exactly ONE structured operation by calling a single tool. You never execute anything — a human approves your proposal afterward.

Today (America/Vancouver) is ${vanToday(now)}. Resolve relative dates ("tomorrow", "next Monday") against it and output dates as YYYY-MM-DD.

Rules:
- Resolve the target to a specific record id from the lists below. Match by name/area/address.
- If you cannot find a unique matching record, if the command is ambiguous, or if it asks for something no tool covers (e.g. deleting, sending a message, editing contact info), call ask_clarification with a short question — in the SAME language as the command.
- Base everything only on the lists; never invent an id, a name, or a phone number.
- Lead statuses: ${LEAD_STATUSES.join(", ")}. A won/lost lead can't go back to won/lost.
- Call exactly one tool.

LEADS (open): ${JSON.stringify(leadCtx)}
CLIENTS: ${JSON.stringify(clientCtx)}
JOBS (upcoming + unscheduled): ${JSON.stringify(jobCtx)}`;

  let toolUse: Anthropic.ToolUseBlock | undefined;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: visionModel(),
      max_tokens: 1024,
      tools: TOOLS,
      tool_choice: { type: "any" },
      system,
      messages: [{ role: "user", content: trimmed }],
    });
    toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  } catch {
    return { status: "error", message: "The assistant couldn't be reached. Try again in a moment." };
  }

  if (!toolUse) return { status: "clarify", message: "I couldn't tell what to change. Can you rephrase?" };
  const input = (toolUse.input ?? {}) as Record<string, unknown>;

  if (toolUse.name === "ask_clarification") {
    const q = typeof input.question === "string" ? input.question : "Can you give me more detail?";
    return { status: "clarify", message: q };
  }

  const num = (v: unknown): number | null => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

  if (toolUse.name === "set_lead_status") {
    const leadId = num(input.leadId);
    const lead = leadId !== null ? leadById.get(leadId) : undefined;
    if (!lead) return { status: "clarify", message: "I couldn't match that to an open lead. Which one?" };
    const status = str(input.status);
    if (!(LEAD_STATUSES as readonly string[]).includes(status)) {
      return { status: "clarify", message: "Which status should it move to?" };
    }
    const lostReason = status === "lost" ? str(input.lostReason) || undefined : undefined;
    const label = leadLabel(lead);
    return {
      status: "proposal",
      op: {
        kind: "set_lead_status",
        leadId: lead.id,
        leadLabel: label,
        status: status as (typeof LEAD_STATUSES)[number],
        lostReason,
      },
      summary: `Move lead ${label} from "${lead.status}" to "${status}"${lostReason ? ` (reason: ${lostReason})` : ""}.`,
    };
  }

  if (toolUse.name === "set_lead_followup") {
    const leadId = num(input.leadId);
    const lead = leadId !== null ? leadById.get(leadId) : undefined;
    if (!lead) return { status: "clarify", message: "I couldn't match that to an open lead. Which one?" };
    const date = str(input.date);
    const label = leadLabel(lead);
    return {
      status: "proposal",
      op: { kind: "set_lead_followup", leadId: lead.id, leadLabel: label, date },
      summary: date
        ? `Set the follow-up date for lead ${label} to ${date}.`
        : `Clear the follow-up date for lead ${label}.`,
    };
  }

  if (toolUse.name === "add_note") {
    const entityType = str(input.entityType);
    const entityId = num(input.entityId);
    const note = str(input.note);
    if (!note) return { status: "clarify", message: "What should the note say?" };
    if (!["lead", "client", "job"].includes(entityType) || entityId === null) {
      return { status: "clarify", message: "Which record should I add the note to?" };
    }
    let label = `#${entityId}`;
    if (entityType === "lead" && leadById.has(entityId)) label = leadLabel(leadById.get(entityId)!);
    else if (entityType === "client" && clientById.has(entityId)) label = clientLabel(clientById.get(entityId)!);
    else if (entityType === "job" && jobById.has(entityId)) label = jobLabel(jobById.get(entityId)!);
    else return { status: "clarify", message: "I couldn't find that record. Which one?" };
    return {
      status: "proposal",
      op: { kind: "add_note", entityType: entityType as "lead" | "client" | "job", entityId, entityLabel: label, note },
      summary: `Add a note to ${entityType} ${label}: "${note}".`,
    };
  }

  if (toolUse.name === "create_job") {
    const clientId = num(input.clientId);
    const client = clientId !== null ? clientById.get(clientId) : undefined;
    if (clientId !== null && !client) {
      return { status: "clarify", message: "I couldn't match that client. Which one?" };
    }
    const assignedTo = str(input.assignedTo);
    if (!(JOB_ASSIGNEES as readonly string[]).includes(assignedTo)) {
      return { status: "clarify", message: "Who should the job be assigned to — Nima, Sina, both, or unassigned?" };
    }
    const address = str(input.address) || client?.area || "";
    const date = str(input.date);
    const hour = num(input.hour);
    const durationHours = num(input.durationHours) ?? DEFAULT_JOB_HOURS;
    const label = client ? clientLabel(client) : "no client";
    const when = date && hour !== null ? `${date} at ${hour}:00` : "unscheduled";
    return {
      status: "proposal",
      op: {
        kind: "create_job",
        clientId: client ? client.id : null,
        clientLabel: label,
        address,
        assignedTo: assignedTo as (typeof JOB_ASSIGNEES)[number],
        date,
        hour: date ? hour : null,
        durationHours,
        notes: str(input.notes),
      },
      summary: `Create a job for ${label}${address ? ` at ${address}` : ""}, assigned to ${assignedTo}, ${when}.`,
    };
  }

  if (toolUse.name === "reschedule_job") {
    const jobId = num(input.jobId);
    const job = jobId !== null ? jobById.get(jobId) : undefined;
    if (!job) return { status: "clarify", message: "I couldn't match that to a job. Which one?" };
    const date = str(input.date);
    const hour = num(input.hour);
    if (!date || hour === null) return { status: "clarify", message: "What date and time should it move to?" };
    const durationHours = num(input.durationHours) ?? DEFAULT_JOB_HOURS;
    const label = jobLabel(job);
    return {
      status: "proposal",
      op: { kind: "reschedule_job", jobId: job.id, jobLabel: label, date, hour, durationHours },
      summary: `Reschedule job ${label} to ${date} at ${hour}:00.`,
    };
  }

  return { status: "clarify", message: "I couldn't tell what to change. Can you rephrase?" };
}

// --- Phase 2: execute (only the approved operation) ------------------------

export async function executeOperation(raw: unknown): Promise<ActionResult> {
  const parsed = ProposedOperationSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "That operation didn't validate." };
  const op = parsed.data;

  switch (op.kind) {
    case "set_lead_status":
      return updateLeadStatusAction(op.leadId, op.status, op.lostReason);

    case "set_lead_followup":
      return updateLeadFieldsAction(op.leadId, { nextFollowUpAt: op.date });

    case "add_note":
      return logActivityAction(op.entityType, op.entityId, "note", op.note);

    case "create_job": {
      let scheduledStart = "";
      let scheduledEnd = "";
      if (op.date && op.hour !== null) {
        const start = zonedInstant(op.date, op.hour, TZ);
        const end = new Date(start.getTime() + op.durationHours * 3600000);
        scheduledStart = start.toISOString();
        scheduledEnd = end.toISOString();
      }
      return createJobAction({
        clientId: op.clientId,
        quoteId: null,
        address: op.address,
        notes: op.notes,
        assignedTo: op.assignedTo,
        scheduledStart,
        scheduledEnd,
      });
    }

    case "reschedule_job": {
      const start = zonedInstant(op.date, op.hour, TZ);
      const end = new Date(start.getTime() + op.durationHours * 3600000);
      return rescheduleJobAction(op.jobId, start.toISOString(), end.toISOString());
    }

    default:
      return { ok: false, error: "Unknown operation." };
  }
}
