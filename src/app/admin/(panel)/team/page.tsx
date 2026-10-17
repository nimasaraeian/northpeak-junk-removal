import Link from "next/link";
import { requireOperator } from "@/lib/admin/auth";
import { FirstOwnerForm } from "@/components/admin/team/FirstOwnerForm";
import { countUsers, listUsers } from "@/lib/admin/users-data";
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

const dateFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" });

export default async function TeamPage() {
  await requireOperator();
  const t = await getT();
  const count = await countUsers();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="ops-label">{t("Team")}</p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">
        {t("People & roles")}
      </h1>

      {count === 0 ? (
        <div className="mt-5">
          <p className="mb-4 text-sm text-[var(--ops-muted)]">
            {t(
              "No personal accounts yet. The panel is still entered with the shared password — create the first owner to begin moving to per-person sign-in.",
            )}
          </p>
          <FirstOwnerForm defaultName="Nima" />
        </div>
      ) : (
        <UserList users={await listUsers()} t={t} dateFormat={dateFormat} />
      )}
    </div>
  );
}

function UserList({
  users,
  t,
  dateFormat,
}: {
  users: Awaited<ReturnType<typeof listUsers>>;
  t: (s: string) => string;
  dateFormat: Intl.DateTimeFormat;
}) {
  return (
    <section className="ops-card mt-5 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--ops-border)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Members")}</h2>
        <span className="text-xs text-[var(--ops-faint)]">
          {users.length} {users.length === 1 ? t("person") : t("people")}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="ops-table">
          <thead>
            <tr>
              <th>{t("Name")}</th>
              <th>{t("Email")}</th>
              <th>{t("Role")}</th>
              <th>{t("Status")}</th>
              <th>{t("Added")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <Link
                    href={`/admin/team/${user.id}`}
                    className="font-medium text-[var(--ops-navy)] hover:underline"
                  >
                    {user.name}
                  </Link>
                </td>
                <td className="text-[var(--ops-muted)]">{user.email}</td>
                <td>{t(ROLE_LABELS[user.role] ?? user.role)}</td>
                <td>{t(STATUS_LABELS[user.status] ?? user.status)}</td>
                <td className="ops-num whitespace-nowrap text-[var(--ops-muted)]">
                  {dateFormat.format(user.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-[var(--ops-border)] px-4 py-3 text-xs text-[var(--ops-faint)]">
        {t("Invites and personal sign-in are being rolled out next.")}
      </p>
    </section>
  );
}
