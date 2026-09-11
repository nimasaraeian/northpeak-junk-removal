import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { NorthPeakAssistant } from "@/components/assistant/NorthPeakAssistant";
import {
  PageTransitionContent,
  PageTransitionProvider,
} from "@/components/motion/PageTransitionProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { localBusinessSchema, organizationSchema } from "@/lib/schema";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-hero-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Junk Removal North Vancouver | NorthPeak",
    template: "%s | NorthPeak",
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "junk removal North Vancouver",
    "junk removal Vancouver",
    "furniture removal Vancouver",
    "garage cleanout Vancouver",
    "commercial junk removal Vancouver",
  ],
  authors: [{ name: site.name }],
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/brand/favicon-32.png"],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Junk Removal North Vancouver | NorthPeak",
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: site.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Junk Removal North Vancouver | NorthPeak",
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-CA"
      className={`${plusJakarta.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={localBusinessSchema()} />
        <PageTransitionProvider>
          <Header />
          <PageTransitionContent>
            <main className="flex-1">{children}</main>
            <Footer />
          </PageTransitionContent>
          <NorthPeakAssistant />
        </PageTransitionProvider>
      </body>
    </html>
  );
}
