"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useT } from "@/lib/i18n/provider";

/**
 * Sidebar on desktop, bottom tab bar on mobile.
 *
 * Active state needs the current path, which is a client-only read — but this
 * component renders inside `/admin`, which is dynamic anyway (it reads the
 * session cookie), so there is no static prerender for the pathname to
 * mismatch against.
 */

export interface OpsNavItem {
  href: Route;
  label: string;
  /** Short form for the bottom tab bar, where width is scarce. */
  short: string;
  icon: React.ReactNode;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OpsSidebarNav({ items }: { items: OpsNavItem[] }) {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <nav className="flex flex-col gap-1" aria-label="NorthPeak Ops">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="ops-nav-item"
          data-active={isActive(pathname, item.href)}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
        >
          <span aria-hidden className="shrink-0">
            {item.icon}
          </span>
          {t(item.label)}
        </Link>
      ))}
    </nav>
  );
}

export function OpsTabBar({ items }: { items: OpsNavItem[] }) {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-[var(--ops-navy)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="NorthPeak Ops"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="ops-tab"
          data-active={isActive(pathname, item.href)}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
        >
          <span aria-hidden>{item.icon}</span>
          {t(item.short)}
        </Link>
      ))}
    </nav>
  );
}
