import type { Metadata } from "next";
import { Inter, Vazirmatn } from "next/font/google";
import "./admin.css";
import { getLang } from "@/lib/i18n/server";
import { dir } from "@/lib/i18n/dict";
import { LangProvider } from "@/lib/i18n/provider";

/**
 * NorthPeak Ops — the internal panel.
 *
 * This sits outside the `(site)` route group, so nothing from the marketing
 * site reaches it: no header, no footer, no assistant, and no GA4. That is
 * the whole reason the group exists.
 *
 * `noindex` is declared three times over on purpose — here in metadata, as an
 * `X-Robots-Tag` response header from `proxy.ts`, and as a `Disallow` in
 * robots.txt. Only the header binds a crawler that ignores the others.
 */
const inter = Inter({
  variable: "--font-ops",
  subsets: ["latin"],
  display: "swap",
});

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "NorthPeak Ops", template: "%s · NorthPeak Ops" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  const lang = await getLang();
  return (
    <div
      className={`np-ops ${inter.variable} ${vazir.variable} min-h-screen`}
      dir={dir(lang)}
      lang={lang}
    >
      <LangProvider lang={lang}>{children}</LangProvider>
    </div>
  );
}
