import { QuoteBuilder } from "@/components/admin/QuoteBuilder";
import { requireOperator } from "@/lib/admin/auth";
import { isPhotoAssistAvailable } from "@/lib/admin/config";
import { loadCatalog, loadPricingSettings } from "@/lib/admin/data";
import { listLinkTargets } from "@/lib/admin/crm-data";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "New quote" };
export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function numeric(value: string | undefined): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default async function NewQuotePage({ searchParams }: PageProps<"/admin/quotes/new">) {
  const params = await searchParams;
  const t = await getT();

  const [operator, catalog, settings, linkTargets] = await Promise.all([
    requireOperator(),
    loadCatalog(),
    loadPricingSettings(),
    listLinkTargets(),
  ]);

  // Carried across by "Convert to quote" on a lead, or a client's own button.
  const prefill = {
    name: first(params.name),
    phone: first(params.phone),
    area: first(params.area),
    clientId: numeric(first(params.clientId)),
    leadId: numeric(first(params.leadId)),
  };

  return (
    <>
      <div className="mx-auto mb-4 max-w-7xl">
        <p className="ops-label">{t("New quote")}</p>
        <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">{t("Build an estimate")}</h1>
        {prefill.leadId ? (
          <p className="mt-1 text-sm text-[var(--ops-muted)]">
            {t("Prefilled from lead")} #{prefill.leadId} — {t("saving moves that card to Quoted.")}
          </p>
        ) : null}
      </div>
      <QuoteBuilder
        catalog={catalog}
        settings={settings}
        operator={operator}
        photoAssistAvailable={isPhotoAssistAvailable()}
        linkTargets={linkTargets}
        prefill={prefill}
      />
    </>
  );
}
