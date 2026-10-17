import Link from "next/link";
import { requireOperator } from "@/lib/admin/auth";
import { FirstOwnerForm } from "@/components/admin/team/FirstOwnerForm";
import { countUsers, listUsers } from "@/lib/admin/users-data";
import { normalizeProfile } from "@/lib/admin/user-profile";
import type { UserRow } from "@/lib/db/schema";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Team" };
export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  sales: "Sales",
  crew: "Crew",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  invited: "Invited",
  disabled: "Disabled",
};

/** Pill colour reuse: active→won(green), invited→draft, disabled→lost. */
const STATUS_PILL: Record<string, string> = {
  active: "won",
  invited: "draft",
  disabled: "lost",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function MemberCard({ user, t }: { user: UserRow; t: (s: string) => string }) {
  const p = normalizeProfile(user.profile);
  const accent = p.colour || "#16324f";

  return (
    <Link
      href={`/admin/team/${user.id}`}
      className="ops-card flex items-center gap-3 p-4 transition hover:border-[var(--ops-navy-soft)]"
    >
      {p.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.photoUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-full object-cover"
          style={{ boxShadow: `0 0 0 2px ${accent}` }}
        />
      ) : (
        <span
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
          style={{ background: accent }}
        >
          {initials(user.name)}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[var(--ops-navy)]">{user.name}</p>
        <p className="truncate text-xs text-[var(--ops-muted)]">
          {p.jobTitle || t(ROLE_LABELS[user.role] ?? user.role)}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="ops-pill" data-status="sent">
            {t(ROLE_LABELS[user.role] ?? user.role)}
          </span>
          <span className="ops-pill" data-status={STATUS_PILL[user.status] ?? "draft"}>
            {t(STATUS_LABELS[user.status] ?? user.status)}
          </span>
        </div>
        {(p.phone || user.email) && (
          <p className="ops-num mt-1 truncate text-xs text-[var(--ops-faint)]">
            {p.phone || user.email}
          </p>
        )}
      </div>
    </Link>
  );
}

export default async function TeamPage() {
  await requireOperator();
  const t = await getT();
  const count = await countUsers();

  if (count === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="ops-label">{t("Team")}</p>
        <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">{t("People & roles")}</h1>
        <p className="mb-4 mt-4 text-sm text-[var(--ops-muted)]">
          {t(
            "No personal accounts yet. The panel is still entered with the shared password — create the first owner to begin moving to per-person sign-in.",
          )}
        </p>
        <FirstOwnerForm defaultName="Nima" />
      </div>
    );
  }

  const users = await listUsers();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ops-label">{t("Team")}</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">{t("People & roles")}</h1>
        </div>
        <span className="text-sm text-[var(--ops-muted)]">
          {users.length} {users.length === 1 ? t("person") : t("people")}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <MemberCard key={user.id} user={user} t={t} />
        ))}
      </div>

      <p className="mt-4 text-xs text-[var(--ops-faint)]">
        {t("Tap a card to open the full profile. Invites and personal sign-in are coming next.")}
      </p>
    </div>
  );
}
