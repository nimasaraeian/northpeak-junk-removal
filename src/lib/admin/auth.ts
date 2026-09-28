import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminPassword } from "@/lib/admin/config";
import {
  readSessionToken,
  SESSION_COOKIE,
  type Operator,
  type SessionPayload,
} from "@/lib/admin/session";

/**
 * Server-side session reads.
 *
 * `proxy.ts` already turns anonymous `/admin` traffic away, but the proxy
 * docs are explicit that Server Functions must not rely on it — a matcher
 * edit or a moved action can silently drop coverage. Every server action and
 * route handler in the panel calls `requireOperator()` for itself.
 */

export async function currentSession(): Promise<SessionPayload | null> {
  const password = adminPassword();
  if (!password) return null;

  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value, password);
}

/** Redirects to the login page when there is no valid session. */
export async function requireOperator(): Promise<Operator> {
  const session = await currentSession();
  if (!session) redirect("/admin/login");
  return session.name;
}

/** Route-handler variant: returns null instead of redirecting. */
export async function operatorOrNull(): Promise<Operator | null> {
  return (await currentSession())?.name ?? null;
}
