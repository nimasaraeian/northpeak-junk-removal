"use server";

import { requireOperator } from "@/lib/admin/auth";
import { executeOperation, interpretCommand, type InterpretResult } from "@/lib/office-manager/command";
import type { ActionResult } from "@/lib/admin/crm-actions";

/**
 * The operator-gated boundary for the CRM command console.
 *
 * `interpret` reads and proposes (no side effects). `execute` runs only the
 * structured operation the operator approved — it never calls the model, so
 * what runs is exactly what was shown and approved.
 */

export async function interpretCommandAction(command: string): Promise<InterpretResult> {
  await requireOperator();
  if (typeof command !== "string") return { status: "error", message: "Invalid command." };
  return interpretCommand(command);
}

export async function executeOperationAction(op: unknown): Promise<ActionResult> {
  await requireOperator();
  return executeOperation(op);
}
