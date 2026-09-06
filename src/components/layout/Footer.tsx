import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { locations } from "@/content/locations";
import { featuredServices, services } from "@/content/services";
import { site } from "@/content/site";
import { formatPhoneHref } from "@/lib/utils";

const footerNav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/estimate", label: "Fill the truck" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Journal" },
] as const;

export function Footer() {
  return (
    <footer className="bg-black text-cream">
      <Container className="grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <Logo tone="light" size="footer" />
          <p className="mt-4 max-w-xs text-sm leading-7 text-stone-soft">
            Premium junk removal and property recovery for the North Shore and
            Greater Vancouver.
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="eyebrow text-gold-glow">Services</p>
          <ul className="mt-4 space-y-3 text-sm text-cream/80">
            {featuredServices.map((service) => (
              <li key={service.slug}>
                <Link href={`/services/${service.slug}`} className="hover:text-cream">
                  {service.shortName}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/services" className="hover:text-cream">
                All services
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow text-gold-glow">Locations</p>
          <ul className="mt-4 space-y-3 text-sm text-cream/80">
            {locations.map((location) => (
              <li key={location.slug}>
                <Link href={`/locations/${location.slug}`} className="hover:text-cream">
                  {location.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/locations" className="hover:text-cream">
                Service area
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow text-gold-glow">Company</p>
          <ul className="mt-4 space-y-3 text-sm text-cream/80">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-cream">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-2 text-sm text-cream/80">
            <a href={formatPhoneHref(site.phone)} className="block hover:text-cream">
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="block hover:text-cream">
              {site.email}
            </a>
            <p>North Vancouver, BC</p>
          </div>
        </div>
      </Container>
      <div className="border-t border-white/8">
        <Container className="flex flex-col gap-3 py-6 text-xs tracking-wide text-stone-soft uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {site.name}</p>
          <p>A cleaner Vancouver. A better tomorrow.</p>
          <p className="hidden sm:block">{services.length} service lines ready</p>
        </Container>
      </div>
    </footer>
  );
}
