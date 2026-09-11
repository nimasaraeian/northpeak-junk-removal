import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";
import {
  formatSiteAddress,
  googleMapsDirectionsUrl,
  googleMapsEmbedUrl,
  googleMapsPlaceUrl,
} from "@/lib/maps";

export function ContactLocationMap() {
  const embedUrl = googleMapsEmbedUrl();

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-navy/8 bg-navy shadow-[var(--shadow-card)] sm:rounded-[2rem]">
      <div className="flex flex-col gap-5 border-b border-white/10 px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="eyebrow text-gold-glow">Our location</p>
          <h2 className="mt-2 font-serif text-2xl text-cream sm:text-3xl">
            North Vancouver base
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-cream/75">
            {formatSiteAddress()}
          </p>
          <p className="mt-1 text-sm text-stone-soft">{site.areaServed}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Button href={googleMapsDirectionsUrl()} variant="primary" size="md">
            Get directions
          </Button>
          <Button
            href={googleMapsPlaceUrl()}
            variant="secondary"
            size="md"
            className="border-cream/20 text-cream hover:border-cream/40"
          >
            Open in Maps
          </Button>
        </div>
      </div>

      <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
        <iframe
          title={`NorthPeak Junk Removal — ${formatSiteAddress()}`}
          src={embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/45 via-navy/5 to-navy/20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-navy/95 via-navy/55 to-transparent sm:h-24"
          aria-hidden
        />

        <div className="pointer-events-none absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm">
          <div className="rounded-2xl border border-white/15 bg-navy/90 px-4 py-3.5 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.65)] backdrop-blur-md">
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 ring-1 ring-gold/35"
                aria-hidden
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-gold-glow"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-cream">{site.shortName}</p>
                <p className="mt-0.5 text-xs leading-5 text-cream/80">
                  {site.address.streetAddress}
                  <br />
                  {site.address.addressLocality}, {site.address.addressRegion}{" "}
                  {site.address.postalCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
