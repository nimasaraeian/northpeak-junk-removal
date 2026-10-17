"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { requireOperator } from "@/lib/admin/auth";
import { getMigratedDb } from "@/lib/db/migrations";
import { USER_ROLES, USER_STATUSES, users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/admin/password";
import { countUsers, getUserByEmail } from "@/lib/admin/users-data";

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

// --- Add a member ----------------------------------------------------------

export interface SaveUserResult extends ActionResult {
  id?: number;
}

const addMemberSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  role: z.enum(USER_ROLES),
});

/**
 * Create a new team member record. No password is set — personal sign-in
 * arrives with invites in a later step, and everyone still logs in with
 * ADMIN_PASSWORD until then, so adding a member locks nobody out.
 */
export async function addMemberAction(raw: unknown): Promise<SaveUserResult> {
  await requireOperator();

  const parsed = addMemberSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Those details did not validate." };
  }

  const db = await getMigratedDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  const existing = await getUserByEmail(parsed.data.email);
  if (existing) return { ok: false, error: "That email is already on the team." };

  try {
    const [inserted] = await db
      .insert(users)
      .values({
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.role,
        status: "active",
      })
      .returning({ id: users.id });

    revalidatePath("/admin/team");
    return { ok: true, id: inserted?.id };
  } catch {
    return { ok: false, error: "Could not add that member — the email may already exist." };
  }
}

// --- Personnel profile + account edits ------------------------------------

const documentSchema = z.object({
  label: z.string().trim().max(120).default(""),
  url: z.string().trim().max(500).default(""),
});

const profileSchema = z.object({
  legalName: z.string().trim().max(160).default(""),
  preferredName: z.string().trim().max(120).default(""),
  /* Holds either a hosted URL or a small downscaled data: URL (the direct
     upload path), so the cap is generous enough for a ~300 KB avatar. */
  photoUrl: z.string().trim().max(500000).default(""),
  phone: z.string().trim().max(60).default(""),
  homeAddress: z.string().trim().max(300).default(""),
  dateOfBirth: z.string().trim().max(32).default(""),
  emergencyName: z.string().trim().max(160).default(""),
  emergencyRelationship: z.string().trim().max(80).default(""),
  emergencyPhone: z.string().trim().max(60).default(""),
  jobTitle: z.string().trim().max(120).default(""),
  employmentType: z.enum(["", "employee", "contractor"]).default(""),
  employmentStatus: z.enum(["", "active", "on_leave", "terminated"]).default(""),
  hireDate: z.string().trim().max(32).default(""),
  endDate: z.string().trim().max(32).default(""),
  payType: z.enum(["", "hourly", "salary"]).default(""),
  hourlyRate: z.coerce.number().min(0).max(100000).default(0),
  commissionPct: z.coerce.number().min(0).max(100).default(0),
  salesTarget: z.coerce.number().min(0).max(100_000_000).default(0),
  sin: z.string().trim().max(20).default(""),
  wcbNumber: z.string().trim().max(60).default(""),
  driversLicence: z.string().trim().max(60).default(""),
  driversLicenceClass: z.string().trim().max(20).default(""),
  driversLicenceExpiry: z.string().trim().max(32).default(""),
  workEligibility: z.string().trim().max(200).default(""),
  colour: z.string().trim().max(20).default(""),
  notes: z.string().trim().max(4000).default(""),
  documents: z.array(documentSchema).max(30).default([]),
});

export async function updateUserProfileAction(
  userId: number,
  raw: unknown,
): Promise<ActionResult> {
  await requireOperator();
  if (!Number.isInteger(userId)) return { ok: false, error: "Unknown user." };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That profile did not validate." };
  }

  const db = await getMigratedDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  await db.update(users).set({ profile: parsed.data }).where(eq(users.id, userId));

  revalidatePath(`/admin/team/${userId}`);
  revalidatePath("/admin/team");
  return { ok: true };
}

const accountSchema = z.object({
  name: z.string().trim().min(1).max(80),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES),
});

export async function updateUserAction(userId: number, raw: unknown): Promise<ActionResult> {
  await requireOperator();
  if (!Number.isInteger(userId)) return { ok: false, error: "Unknown user." };

  const parsed = accountSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Those changes did not validate." };
  }

  const db = await getMigratedDb();
  if (!db) return { ok: false, error: DB_UNREACHABLE };

  // Never let the last active owner lose owner/active — that would leave the
  // panel with no one who can manage the team.
  if (parsed.data.role !== "owner" || parsed.data.status !== "active") {
    const [current] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (current?.role === "owner" && current.status === "active") {
      const [others] = await db
        .select({ c: sql<number>`count(*)`.mapWith(Number) })
        .from(users)
        .where(and(eq(users.role, "owner"), eq(users.status, "active"), ne(users.id, userId)));
      if ((others?.c ?? 0) === 0) {
        return { ok: false, error: "This is the only active owner — keep at least one." };
      }
    }
  }

  await db
    .update(users)
    .set({ name: parsed.data.name, role: parsed.data.role, status: parsed.data.status })
    .where(eq(users.id, userId));

  revalidatePath(`/admin/team/${userId}`);
  revalidatePath("/admin/team");
  return { ok: true };
}
