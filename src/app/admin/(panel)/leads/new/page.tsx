import { NewRecordForm } from "@/components/admin/NewRecordForm";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Add lead" };
export const dynamic = "force-dynamic";

export default async function NewLeadPage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-5xl">
      <p className="ops-label">{t("Pipeline")}</p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">{t("Add a lead")}</h1>
      <p className="mt-1 text-sm text-[var(--ops-muted)]">
        {t("For a phone call or a walk-up. Website enquiries arrive on their own.")}
      </p>
      <div className="mt-5">
        <NewRecordForm kind="lead" />
      </div>
    </div>
  );
}
