import Link from "next/link";
import { OpsSidebarNav, OpsTabBar, type OpsNavItem } from "@/components/admin/OpsNav";
import { SetupScreen } from "@/components/admin/SetupScreen";
import {
  CalendarIcon,
  ClientsIcon,
  ConnectionsIcon,
  ControlIcon,
  DashboardIcon,
  LeadsIcon,
  LogoutIcon,
  NewQuoteIcon,
  QuotesIcon,
  SettingsIcon,
} from "@/components/admin/icons";
import { requireOperator } from "@/lib/admin/auth";
import { logoutAction } from "@/lib/admin/actions";
import { isAdminConfigured } from "@/lib/admin/config";

/**
 * The signed-in panel shell.
 *
 * `/admin/login` is a sibling of this group rather than a child, so the login
 * page gets the theme without the sidebar it could not use yet.
 *
 * Mobile is the primary target for the Quotes and New Quote screens — one of
 * the two operators works from a phone beside the truck — so the sidebar
 * collapses to a bottom tab bar and the content column gets bottom padding to
 * clear it.
 */

const NAV: OpsNavItem[] = [
  { href: "/admin", label: "Dashboard", short: "Home", icon: <DashboardIcon /> },
  { href: "/admin/control", label: "Control", short: "Control", icon: <ControlIcon /> },
  { href: "/admin/leads", label: "Leads", short: "Leads", icon: <LeadsIcon /> },
  { href: "/admin/clients", label: "Clients", short: "Clients", icon: <ClientsIcon /> },
  { href: "/admin/calendar", label: "Calendar", short: "Cal", icon: <CalendarIcon /> },
  { href: "/admin/quotes/new", label: "New Quote", short: "New", icon: <NewQuoteIcon /> },
  { href: "/admin/quotes", label: "Quotes", short: "Quotes", icon: <QuotesIcon /> },
  { href: "/admin/connections", label: "Connections", short: "Links", icon: <ConnectionsIcon /> },
  { href: "/admin/settings", label: "Settings", short: "Settings", icon: <SettingsIcon /> },
];

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  // Configuration first: without a database there is nothing to authenticate
  // into, and the setup screen is more use than a login form.
  if (!isAdminConfigured()) {
    return <SetupScreen />;
  }

  const operator = await requireOperator();

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-[var(--ops-navy)] px-3 py-5 lg:flex">
        <Link href="/admin" className="px-2 pb-6">
          <span className="block text-base font-semibold tracking-tight text-white">
            NorthPeak <span className="text-[var(--ops-gold)]">Ops</span>
          </span>
          <span className="mt-0.5 block text-[0.7rem] text-[#8fa0b3]">Internal · v1</span>
        </Link>
        <OpsSidebarNav items={NAV} />
        <p className="mt-auto px-2 text-[0.7rem] leading-5 text-[#6f8296]">
          Internal tool. Customers never see this.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[var(--ops-border)] bg-[var(--ops-surface)]/95 px-4 backdrop-blur sm:px-6">
          <span className="text-sm font-semibold tracking-tight text-[var(--ops-navy)] lg:hidden">
            NorthPeak <span className="text-[var(--ops-gold-ink)]">Ops</span>
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-[var(--ops-muted)]">
              Signed in as <strong className="text-[var(--ops-text)]">{operator}</strong>
            </span>
            <form action={logoutAction}>
              <button type="submit" className="ops-btn" data-variant="ghost">
                <LogoutIcon />
                <span className="sr-only sm:not-sr-only">Log out</span>
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">{children}</main>
      </div>

      <OpsTabBar items={NAV} />
    </div>
  );
}
