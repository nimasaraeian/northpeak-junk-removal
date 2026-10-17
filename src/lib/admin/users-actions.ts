"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOperator } from "@/lib/admin/auth";
import { getMigratedDb } from "@/lib/db/migrations";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/admin/password";
import { countUsers } from "@/lib/admin/users-data";

/**
 * User & role mutations (Phase 2). Every action re-checks the operator session
 * first, matching the other admin action modules and the security test.
 *
 * Step 1 ships only the first-owner bootstrap. While no users exist the panel
 * is still entered with ADMIN_PASSWORD, so this runs under that legacy session;
 * once the first owner exists, real user login (Step 2) takes over.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const DB_UNREACHABLE = "The database is not reachable.";

const firstOwnerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8, "Use at least 8 characters.").max(200),
});

export async function createFirstOwnerAction(raw: unknown): Promise<ActionResult> {
  await requireOperator();

  const db = await getMigratedDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  // The first-owner flow is only available while there are no users at all —
  // after that, people are added through invites, never this form.
  const existing = await countUsers();
  if (existing > 0) {
    return { ok: false, error: "An owner already exists. Add more people with invites." };
  }

  const parsed = firstOwnerSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Those details did not validate." };
  }

  await db.insert(users).values({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    role: "owner",
    passwordHash: hashPassword(parsed.data.password),
    status: "active",
  });

  revalidatePath("/admin/team");
  revalidatePath("/admin");
  return { ok: true };
}
