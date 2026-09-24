import { getImageProps } from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroQuickAccess } from "@/components/home/HeroQuickAccess";
import { heroValues } from "@/content/site";

const HERO_HEIGHT = "h-[calc(100svh-5.5rem)] min-h-[28rem] sm:min-h-[32rem] lg:h-[calc(100svh-6rem)] lg:min-h-[36rem]";

function ValueIcon({ id }: { id: string }) {
  const common = "h-5 w-5 stroke-[1.5] sm:h-6 sm:w-6";
  switch (id) {
    case "homes":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common} aria-hidden>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      );
    case "community":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common} aria-hidden>
          <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
          <circle cx="9.5" cy="8" r="3" />
          <path d="M22 19v-1a3.5 3.5 0 0 0-2.8-3.4" />
          <path d="M16.5 5.2a3 3 0 0 1 0 5.6" />
        </svg>
      );
    case "disposal":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common} aria-hidden>
          <path d="M7 7h10l-1 12H8L7 7Z" />
          <path d="M5 7h14" />
          <path d="M10 7V5h4v2" />
          <path d="M10 11v5M14 11v5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common} aria-hidden>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      );
  }
}

function HeroOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-[2] flex items-start pt-6 sm:items-center sm:pt-0">
      <Container>{children}</Container>
    </div>
  );
}

function HeroCopy() {
  return (
    <div className="reveal max-w-[17.5rem] sm:max-w-xs lg:max-w-xl">
      {/* The strongest page on the site had a slogan for an h1 and the service
          and city in a paragraph above it. Folding that line into the heading
          gives the h1 the phrase people search for while leaving the hero
          pixel-identical: the eyebrow keeps its own type, it is simply part of
          the heading now. */}
      <h1 className="mt-0">
        <span className="eyebrow block text-cream/80 sm:text-[0.68rem] lg:text-cream/85">
          Junk Removal in North Vancouver &amp; Beyond
        </span>
        <span className="hero-title mt-2 block text-[2.15rem] sm:mt-2.5 sm:text-[2.45rem] lg:mt-5 lg:text-[4.75rem]">
          <span className="hero-title__line">More Space.</span>
          <span className="hero-title__line">A Better Tomorrow.</span>
        </span>
      </h1>

      <p className="mt-4 hidden max-w-md text-base leading-8 text-cream/82 lg:block lg:mt-5">
        Professional junk removal for homes and businesses across Greater Vancouver —
        careful crews, clear estimates, and a cleaner space when we leave.
      </p>

      <div className="mt-4 flex w-[10.75rem] flex-col gap-2 sm:mt-5 sm:w-[11.5rem] lg:mt-8 lg:w-auto lg:flex-row lg:items-center lg:gap-3">
        <Button href="/estimate" size="lg" className="w-full px-4 text-sm lg:w-auto lg:px-7">
          Get My Free Estimate →
        </Button>
        <Button
          href="#quick-access"
          variant="secondary"
          size="lg"
          className="w-full px-4 text-sm lg:w-auto lg:px-7"
        >
          Contact Us
        </Button>
      </div>

      <ul className="mt-6 hidden flex-wrap gap-x-5 gap-y-3 lg:mt-9 lg:flex">
        {heroValues.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-cream/85">
            <span className="text-gold-glow">
              <ValueIcon id={item.id} />
            </span>
            <span className="eyebrow text-[0.66rem] tracking-[0.14em]">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeroFrame({ children }: { children: ReactNode }) {
  return (
    <div className={`relative w-full overflow-hidden ${HERO_HEIGHT}`}>{children}</div>
  );
}

/**
 * The hero is the LCP element, and it is art-directed: a landscape crop on
 * desktop, a portrait one on mobile.
 *
 * Rendering both as `<Image fill>` and hiding one with CSS meant the browser
 * preloaded both — `hidden` does not reach the preload scanner, and a `fill`
 * image's srcset starts at the smallest deviceSize (640px), so there was no
 * way to shrink the unused one. A `<picture>` with `media` on each `<source>`
 * lets the preload scanner pick exactly one before any CSS is parsed.
 *
 * getImageProps gives the optimizer's srcset for each crop; the `<img>` is
 * positioned the way `fill` positions its own image.
 */
const DESKTOP_SIZES = "100vw";
/**
 * Deliberately under 100vw. The frame is full-bleed, but a phone asking for
 * 100vw at DPR 3 lands on the 1200px candidate (59KB) when the 828px one
 * (33KB) is indistinguishable at this size behind the scrim. 70vw puts a
 * 390px/DPR-3 screen on 828 and a 768px/DPR-2 tablet on 1080.
 */
const MOBILE_SIZES = "70vw";

function HeroPicture() {
  const common = { alt: "", fill: true as const, quality: 70 };

  const { props: desktop } = getImageProps({
    ...common,
    src: "/brand/hero-desktop.jpg",
    sizes: DESKTOP_SIZES,
  });
  const { props: mobile } = getImageProps({
    ...common,
    src: "/brand/hero-mobile.jpg",
    sizes: MOBILE_SIZES,
  });

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktop.srcSet} sizes={DESKTOP_SIZES} />
      <source srcSet={mobile.srcSet} sizes={MOBILE_SIZES} />
      <img
        src={mobile.src}
        alt="NorthPeak junk removal truck and crew in North Vancouver"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[center_72%] lg:object-[72%_86%]"
      />
    </picture>
  );
}

export function Hero() {
  return (
    <section className="bg-navy-deep">
      <div className="hero-photo relative isolate w-full text-cream">
        <HeroFrame>
          <HeroPicture />

          {/* The scrim differs per crop: a left-to-right wash behind the desktop
              copy, a top-down one on mobile. */}
          <div className="pointer-events-none absolute inset-0 z-[1] hidden lg:block" style={{
            background:
              "linear-gradient(105deg, rgba(8,18,31,0.72) 0%, rgba(8,18,31,0.4) 22%, rgba(8,18,31,0.08) 40%, transparent 58%)",
          }} />
          <div className="pointer-events-none absolute inset-0 z-[1] lg:hidden" style={{
            background:
              "linear-gradient(180deg, rgba(8,18,31,0.62) 0%, rgba(8,18,31,0.22) 34%, transparent 58%), linear-gradient(0deg, rgba(8,18,31,0.28) 0%, transparent 36%)",
          }} />

          <HeroOverlay>
            <HeroCopy />
          </HeroOverlay>
        </HeroFrame>
      </div>

      <div id="quick-access" className="relative z-10 bg-navy-deep px-4 pb-8 pt-6 sm:px-6 md:px-8 lg:pb-10 lg:pt-8">
        <Container>
          <HeroQuickAccess />
        </Container>
      </div>
    </section>
  );
}
