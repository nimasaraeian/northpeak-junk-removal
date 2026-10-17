import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOperator } from "@/lib/admin/auth";
import { MemberEditor } from "@/components/admin/team/MemberEditor";
import { getUserById } from "@/lib/admin/users-data";
import { normalizeProfile } from "@/lib/admin/user-profile";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Team member" };
export const dynamic = "force-dynamic";

export default async function MemberPage({ params }: PageProps<"/admin/team/[id]">) {
  await requireOperator();
  const { id } = await params;
  const user = await getUserById(Number(id));
  if (!user) notFound();

  const t = await getT();
  const profile = normalizeProfile(user.profile);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/team"
        className="text-sm font-medium text-[var(--ops-gold-ink)] hover:underline"
      >
        ← {t("All team")}
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-[var(--ops-navy)]">
        {user.name}
      </h1>
      <p className="mt-0.5 text-sm text-[var(--ops-muted)]">
        {profile.jobTitle || t("No job title set")}
      </p>

      <div className="mt-5">
        <MemberEditor
          userId={user.id}
          email={user.email}
          account={{ name: user.name, role: user.role, status: user.status }}
          profile={profile}
        />
      </div>
    </div>
  );
}
