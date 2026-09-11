"use client";

import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import {
  cx,
  formatPhoneHref,
  telegramHref,
  whatsAppHref,
} from "@/lib/utils";

type SocialLink = {
  id: string;
  label: string;
  href: string;
  external: boolean;
  tone: string;
  icon: ReactNode;
};

const connectLinks: SocialLink[] = [
  {
    id: "call",
    label: "Call",
    href: formatPhoneHref(site.phone),
    external: false,
    tone: "bg-gold/12 text-gold-deep ring-gold/25 hover:bg-gold/20",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M5.5 4h2.8l1.4 3.5-1.8 1.1a11.5 11.5 0 0 0 5.5 5.5l1.1-1.8 3.5 1.4v2.8c0 .8-.7 1.5-1.5 1.5C10.2 18 6 13.8 6 8.5 6 7.7 6.7 7 7.5 7H5.5Z"
        />
      </svg>
    ),
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: whatsAppHref(site.phone),
    external: true,
    tone: "bg-[#25D366]/12 text-[#1B9E4B] ring-[#25D366]/25 hover:bg-[#25D366]/18",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
  },
  {
    id: "telegram",
    label: "Telegram",
    href: telegramHref(site.phone),
    external: true,
    tone: "bg-[#229ED9]/12 text-[#1A84B8] ring-[#229ED9]/25 hover:bg-[#229ED9]/18",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
];

const socialProfiles = [
  {
    id: "instagram",
    label: "Instagram",
    href: site.social.instagram,
    tone: "bg-[#E4405F]/12 text-[#C13584] ring-[#E4405F]/25 hover:bg-[#E4405F]/18",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    href: site.social.facebook,
    tone: "bg-[#1877F2]/12 text-[#166FE5] ring-[#1877F2]/25 hover:bg-[#1877F2]/18",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: site.social.linkedin,
    tone: "bg-[#0A66C2]/12 text-[#0A66C2] ring-[#0A66C2]/25 hover:bg-[#0A66C2]/18",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.062 2.062 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
].filter((profile) => profile.href.trim().length > 0);

function QuickAccessCard({
  title,
  description,
  icon,
  children,
  href,
  accent = "cream",
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  href?: Route;
  accent?: "cream" | "gold" | "navy";
}) {
  const shell = (
    <article
      className={cx(
        "group flex h-full flex-col rounded-[1.35rem] border p-5 shadow-[var(--shadow-lift)] transition sm:rounded-[1.5rem] sm:p-6",
        accent === "cream" && "border-navy/8 bg-paper hover:border-gold/30",
        accent === "gold" && "border-gold/25 bg-gradient-to-br from-gold/15 via-paper to-paper hover:border-gold/45",
        accent === "navy" && "border-navy/10 bg-navy text-cream hover:border-gold/35",
      )}
    >
      <div
        className={cx(
          "flex h-12 w-12 items-center justify-center rounded-2xl ring-1",
          accent === "navy"
            ? "bg-white/10 text-gold-glow ring-white/15"
            : "bg-navy/5 text-navy ring-navy/8",
        )}
      >
        {icon}
      </div>

      <h3
        className={cx(
          "mt-4 font-serif text-xl leading-snug sm:text-[1.35rem]",
          accent === "navy" ? "text-cream" : "text-navy",
        )}
      >
        {title}
      </h3>

      <p
        className={cx(
          "mt-2 text-sm leading-6",
          accent === "navy" ? "text-cream/78" : "text-stone",
        )}
      >
        {description}
      </p>

      <div className="mt-auto pt-5">{children}</div>
    </article>
  );

  if (!href) return shell;

  return (
    <Link href={href} className="block h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
      {shell}
    </Link>
  );
}

function IconLink({
  link,
}: {
  link: SocialLink | (typeof socialProfiles)[number];
}) {
  const external = "external" in link ? link.external : true;

  return (
    <a
      href={link.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={link.label}
      title={link.label}
      className={cx(
        "flex h-11 w-11 items-center justify-center rounded-full ring-1 transition hover:-translate-y-0.5",
        link.tone,
      )}
    >
      {link.icon}
    </a>
  );
}

function CardCta({
  children,
  variant = "primary",
}: {
  children: ReactNode;
  variant?: "primary" | "light";
}) {
  return (
    <span
      className={cx(
        "inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-semibold transition group-hover:-translate-y-0.5 sm:w-auto",
        variant === "primary" && "bg-gold text-navy-deep group-hover:bg-gold-glow",
        variant === "light" && "bg-white text-navy group-hover:bg-cream",
      )}
    >
      {children}
    </span>
  );
}

export function HeroQuickAccess() {
  const allConnectLinks = [...connectLinks, ...socialProfiles];

  return (
    <div className="grid gap-4 md:grid-cols-3 md:gap-5">
      <QuickAccessCard
        title="Connect with us"
        description="Call, chat, or follow NorthPeak on the channels you already use."
        accent="cream"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7.5 8.5h9M7.5 12h5.5M5 5.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
          </svg>
        }
      >
        <div className="flex flex-wrap gap-2.5">
          {allConnectLinks.map((link) => (
            <IconLink key={link.id} link={link} />
          ))}
        </div>
      </QuickAccessCard>

      <QuickAccessCard
        href="/contact"
        title="Send a message"
        description="Ask a question and attach photos of your space or items — we reply within one business day."
        accent="gold"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v7A2.5 2.5 0 0 1 17.5 17H9l-5 3v-3.5Z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.5 10.5h7M8.5 13h4.5" />
          </svg>
        }
      >
        <CardCta>Message &amp; upload photos →</CardCta>
      </QuickAccessCard>

      <QuickAccessCard
        href="/estimate"
        title="Get your estimate"
        description="Upload photos, confirm your area, and receive a clear price range — fast and no obligation."
        accent="navy"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16h16M6 16V8.5L12 5l6 3.5V16M9.5 16v-4h5v4" />
          </svg>
        }
      >
        <CardCta variant="light">Start my estimate →</CardCta>
      </QuickAccessCard>
    </div>
  );
}
