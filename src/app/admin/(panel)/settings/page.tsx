import { SettingsForm } from "@/components/admin/SettingsForm";
import { bedCapacityCuFt } from "@/content/vehicle";
import { loadCatalog, loadPricingSettings } from "@/lib/admin/data";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, catalog] = await Promise.all([loadPricingSettings(), loadCatalog()]);

  return (
    <div className="mx-auto max-w-5xl">
      <p className="ops-label">Settings</p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">Pricing rules</h1>
      <p className="mt-1 text-sm text-[var(--ops-muted)]">
        These drive every quote. {catalog.length} items in the catalog.
      </p>

      <div className="mt-5">
        <SettingsForm settings={settings} measuredTrailerCubicFeet={bedCapacityCuFt} />
      </div>
    </div>
  );
}
