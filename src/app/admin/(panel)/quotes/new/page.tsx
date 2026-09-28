import { QuoteBuilder } from "@/components/admin/QuoteBuilder";
import { requireOperator } from "@/lib/admin/auth";
import { isPhotoAssistAvailable } from "@/lib/admin/config";
import { loadCatalog, loadPricingSettings } from "@/lib/admin/data";

export const metadata = { title: "New quote" };
export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const [operator, catalog, settings] = await Promise.all([
    requireOperator(),
    loadCatalog(),
    loadPricingSettings(),
  ]);

  return (
    <>
      <div className="mx-auto mb-4 max-w-7xl">
        <p className="ops-label">New quote</p>
        <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">Build an estimate</h1>
      </div>
      <QuoteBuilder
        catalog={catalog}
        settings={settings}
        operator={operator}
        photoAssistAvailable={isPhotoAssistAvailable()}
      />
    </>
  );
}
