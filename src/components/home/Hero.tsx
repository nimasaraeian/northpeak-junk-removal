import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PostalCodeChecker } from "@/components/estimate/PostalCodeChecker";
import { heroValues } from "@/content/site";

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

export function Hero() {
  return (
    <section className="bg-navy-deep">
      <div className="hero-photo relative isolate min-h-[100svh] overflow-hidden text-cream lg:min-h-[90vh]">
        <Image
          src="/brand/hero-desktop.jpg"
          alt="NorthPeak crew loading a cab-over truck against the North Shore mountains"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="hidden object-cover object-[58%_center] lg:block"
        />
        <Image
          src="/brand/hero-mobile.jpg"
          alt=""
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-[center_20%] lg:hidden"
          aria-hidden
        />

        {/* Mobile — sky read for headline, lighter base so crew stays visible */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] lg:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,18,31,0.55) 0%, rgba(8,18,31,0.28) 28%, transparent 48%), linear-gradient(0deg, rgba(8,18,31,0.35) 0%, transparent 32%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
          style={{
            background:
              "linear-gradient(105deg, rgba(8,18,31,0.88) 0%, rgba(8,18,31,0.65) 30%, rgba(8,18,31,0.22) 52%, transparent 72%)",
          }}
        />

        {/* Mobile — headline sits in open sky, above mountains */}
        <div className="absolute inset-x-0 top-[5rem] z-[2] sm:top-[5.5rem] lg:hidden">
          <Container>
            <div className="reveal max-w-[17.5rem] sm:max-w-xs">
              <p className="text-[0.6rem] font-semibold tracking-[0.18em] text-cream/75 uppercase sm:text-[0.68rem]">
                Junk Removal | North Vancouver &amp; Beyond
              </p>
              <h1 className="hero-title display mt-2 text-[2rem] leading-[0.95] sm:mt-2.5 sm:text-[2.35rem]">
                More Space.
                <br />
                A Better Tomorrow.
              </h1>
            </div>
          </Container>
        </div>

        {/* Mobile — CTAs bottom-left, clear of crew */}
        <div className="absolute inset-x-0 bottom-[6.75rem] z-[2] sm:bottom-28 lg:hidden">
          <Container>
            <div className="flex w-[10.75rem] flex-col gap-2 sm:w-[11.5rem]">
              <Button href="/estimate" size="lg" className="w-full px-4 text-sm">
                Get My Estimate →
              </Button>
              <Button
                href="#service-area"
                variant="secondary"
                size="lg"
                className="w-full px-4 text-sm"
              >
                Check Service Area
              </Button>
            </div>
          </Container>
        </div>

        {/* Desktop — single left overlay */}
        <div className="absolute inset-x-0 top-1/2 z-[2] hidden -translate-y-1/2 lg:block">
          <Container>
            <div className="reveal max-w-xl">
              <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-cream/80 uppercase">
                Junk Removal | North Vancouver &amp; Beyond
              </p>

              <h1 className="hero-title display mt-5 text-[4.5rem] leading-[0.96]">
                More Space.
                <br />
                A Better Tomorrow.
              </h1>

              <p className="mt-5 max-w-md text-base leading-8 text-cream/82">
                Professional junk removal for homes and businesses across Greater Vancouver —
                careful crews, clear estimates, and a cleaner space when we leave.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <Button href="/estimate" size="lg">
                  Get My Estimate →
                </Button>
                <Button href="#service-area" variant="secondary" size="lg">
                  Check Service Area
                </Button>
              </div>

              <ul className="mt-9 flex flex-wrap gap-5">
                {heroValues.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-cream/85">
                    <span className="text-gold-glow">
                      <ValueIcon id={item.id} />
                    </span>
                    <span className="text-[0.66rem] font-semibold tracking-[0.12em] uppercase">
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </div>
      </div>

      <div id="service-area" className="relative z-10 -mt-6 px-4 pb-2 sm:-mt-8 sm:px-6 md:px-8 lg:-mt-10">
        <Container>
          <PostalCodeChecker variant="banner" />
        </Container>
      </div>
    </section>
  );
}
