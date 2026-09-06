import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { navigation } from "@/content/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-paper/92 backdrop-blur-md">
      <Container className="relative flex min-h-[4.75rem] items-center justify-between gap-3 overflow-visible py-3 sm:min-h-[5.5rem] md:min-h-[6rem]">
        <Logo tone="dark" size="header" tagline />
        <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="Primary">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-navy/70 transition hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <Button href="/estimate">
            Get Estimate →
          </Button>
          <p className="flex max-w-[9.5rem] items-start gap-1.5 text-[0.65rem] leading-4 tracking-wide text-stone uppercase">
            <svg viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" fill="currentColor" aria-hidden>
              <path d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2 4.5 8.5 4.5 8.5s4.5-5.3 4.5-8.5A4.5 4.5 0 0 0 8 1.5Zm0 6.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4Z" />
            </svg>
            North Vancouver &amp; Greater Vancouver
          </p>
        </div>
        <MobileMenu />
      </Container>
    </header>
  );
}
