import { SettingsForm } from "@/components/admin/SettingsForm";
import { BillingSettingsForm } from "@/components/admin/BillingSettingsForm";
import { DbSetupCard } from "@/components/admin/DbSetupCard";
import { bedCapacityCuFt } from "@/content/vehicle";
import { loadCatalog, loadPricingSettings } from "@/lib/admin/data";
import { loadBillingSettings } from "@/lib/admin/billing-data";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const t = await getT();
  const [settings, catalog, billing] = await Promise.all([
    loadPricingSettings(),
    loadCatalog(),
    loadBillingSettings(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <p className="ops-label">{t("Settings")}</p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">{t("Pricing rules")}</h1>
      <p className="mt-1 text-sm text-[var(--ops-muted)]">
        {t("These drive every quote.")} {catalog.length} {t("items in the catalog.")}
      </p>

      <div className="mt-5">
        <SettingsForm settings={settings} measuredTrailerCubicFeet={bedCapacityCuFt} />
      </div>

      <div className="mt-6">
        <BillingSettingsForm settings={billing} />
      </div>

      <div className="mt-6">
        <DbSetupCard />
      </div>
    </div>
  );
}
