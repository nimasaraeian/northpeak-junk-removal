import { PageHeader } from "@/components/content/PageHeader";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { getService } from "@/content/services";
import { notFound } from "next/navigation";
import { bookingLevelEstimates } from "@/lib/booking/booking-core";
import { isBookingEnabled } from "@/lib/booking/feature";
import { loadPricingSettings } from "@/lib/admin/data";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Book Junk Removal Online",
  description:
    "Book junk removal in North Vancouver and Greater Vancouver online. Pick a load size, see your estimate range instantly, choose a date and time, and we'll confirm by phone.",
  path: "/book",
});

// Pricing is read from the database, so the estimate must not be cached.
export const dynamic = "force-dynamic";

/** Today's date (YYYY-MM-DD) in the business timezone — the earliest bookable day. */
function todayInVancouver(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map: Record<string, string> = {};
  for (const part of parts) if (part.type !== "literal") map[part.type] = part.value;
  return `${map.year}-${map.month}-${map.day}`;
}

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  // Off by default — the system is built but not live on the site yet.
  if (!isBookingEnabled()) notFound();

  const query = await searchParams;
  const service = typeof query.service === "string" ? getService(query.service) : undefined;

  const settings = await loadPricingSettings();
  const estimates = bookingLevelEstimates(settings);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Book", path: "/book" },
        ])}
      />
      <PageHeader
        eyebrow="Online booking"
        title="Book your removal online"
        description="Pick a load size, see your estimate range, and choose a day. We confirm the time by phone — and the price on site before any work starts."
      />
      <section className="py-8 sm:py-16 md:py-20">
        <Container width="wide" className="px-4 sm:px-8">
          <BookingWizard
            estimates={estimates}
            minDate={todayInVancouver()}
            initialService={service?.slug ?? ""}
          />
        </Container>
      </section>
    </>
  );
}
