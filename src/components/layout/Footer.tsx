"use client";

import type { Route } from "next";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { Logo } from "@/components/brand/Logo";
import { ContactChannels } from "@/components/content/ContactChannels";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { locations } from "@/content/locations";
import { featuredServices, services } from "@/content/services";
import { site } from "@/content/site";
import { formatSiteAddress } from "@/lib/maps";
import { formatPhoneHref } from "@/lib/utils";

const footerNav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/estimate", label: "Fill the truck" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Journal" },
] as const;

function FooterLink({
  href,
  children,
}: {
  href: Route;
  children: React.ReactNode;
}) {
  return (
    <TransitionLink
      href={href}
      className="inline-flex text-sm text-cream/72 transition hover:translate-x-0.5 hover:text-gold-glow"
    >
      {children}
    </TransitionLink>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow text-gold-glow">{title}</p>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy-deep text-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 12% 0%, rgb(240 178 90 / 0.14), transparent 55%), radial-gradient(ellipse 60% 45% at 88% 100%, rgb(22 50 79 / 0.55), transparent 50%), linear-gradient(180deg, #0c1b2e 0%, #08121f 58%, #060e18 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
        aria-hidden
      />

      <Container className="relative">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:py-20">
          <div>
            <div className="inline-flex rounded-[1.35rem] bg-paper/96 p-4 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.65)] ring-1 ring-white/12">
              <Logo tone="light" size="footer" />
            </div>
            <p className="mt-7 max-w-md font-serif text-2xl leading-snug text-cream sm:text-[1.75rem]">
              {site.tagline}
            </p>
            <p className="mt-4 max-w-md text-sm leading-7 text-cream/68">
              Premium junk removal and property recovery for the North Shore and
              Greater Vancouver.
            </p>
            <p className="eyebrow mt-6 flex items-center gap-2 text-stone-soft">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-glow" aria-hidden />
              {site.areaServed}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.75)] backdrop-blur-sm sm:p-8">
            <p className="eyebrow text-gold-glow">Get in touch</p>
            <a
              href={formatPhoneHref(site.phone)}
              className="mt-3 block font-serif text-2xl text-cream transition hover:text-gold-glow sm:text-[1.65rem]"
            >
              {site.phone}
            </a>
            <ContactChannels variant="compact" className="mt-5" />
            <div className="mt-6 space-y-2 border-t border-white/10 pt-6 text-sm">
              <a
                href={`mailto:${site.email}`}
                className="block text-cream/75 transition hover:text-gold-glow"
              >
                {site.email}
              </a>
              <p className="leading-6 text-cream/55">{formatSiteAddress()}</p>
              <p className="text-cream/45">{site.hours}</p>
            </div>
            <Button href="/estimate" size="lg" className="mt-7 w-full sm:w-auto">
              Get Estimate →
            </Button>
          </div>
        </div>

        <div className="grid gap-10 border-t border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-3">
          <FooterColumn title="Services">
            {featuredServices.map((service) => (
              <li key={service.slug}>
                <FooterLink href={`/services/${service.slug}` as Route}>
                  {service.shortName}
                </FooterLink>
              </li>
            ))}
            <li>
              <FooterLink href="/services">All services</FooterLink>
            </li>
          </FooterColumn>

          <FooterColumn title="Locations">
            {locations.map((location) => (
              <li key={location.slug}>
                <FooterLink href={`/locations/${location.slug}` as Route}>
                  {location.name}
                </FooterLink>
              </li>
            ))}
            <li>
              <FooterLink href="/locations">Service area</FooterLink>
            </li>
          </FooterColumn>

          <FooterColumn title="Company">
            {footerNav.map((item) => (
              <li key={item.href}>
                <FooterLink href={item.href}>{item.label}</FooterLink>
              </li>
            ))}
          </FooterColumn>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs tracking-wide text-cream/45">
            © 2026 {site.name}
          </p>
          <p className="font-serif text-sm text-cream/78 italic">
            A cleaner Vancouver. A better tomorrow.
          </p>
          <p className="text-xs tracking-wide text-cream/40">
            {services.length} service lines · North Vancouver, BC
          </p>
        </div>
      </Container>
    </footer>
  );
}
