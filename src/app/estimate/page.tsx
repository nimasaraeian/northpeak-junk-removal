import { PageHeader } from "@/components/content/PageHeader";
import { EstimateWizard } from "@/components/estimate/EstimateWizard";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { getService } from "@/content/services";
import { resolveLoadTier } from "@/lib/load-estimator";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Get a Junk Removal Estimate",
  description:
    "Request a junk removal estimate in North Vancouver and Greater Vancouver. Confirm your postal code, choose a service, and tell us about the space.",
  path: "/estimate",
});

export default async function EstimatePage({
  searchParams,
}: PageProps<"/estimate">) {
  const query = await searchParams;
  const service = typeof query.service === "string" ? getService(query.service) : undefined;
  const postal = typeof query.postal === "string" ? query.postal : "";
  const loadTier = resolveLoadTier(
    typeof query.load === "string" ? query.load : null,
    typeof query.volume === "string" ? query.volume : null,
  );

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Estimate", path: "/estimate" },
        ])}
      />
      <PageHeader
        eyebrow="Load Bay Studio"
        title="Tell us about your project"
        description="Confirm the scale that feels right, add photos, and we'll follow up with a clear estimate range."
      />
      <section className="py-8 sm:py-16 md:py-20">
        <Container width="wide" className="px-4 sm:px-8">
          <EstimateWizard
            initialPostalCode={postal}
            initialService={service?.slug ?? ""}
            initialLoadTier={loadTier}
          />
        </Container>
      </section>
    </>
  );
}
