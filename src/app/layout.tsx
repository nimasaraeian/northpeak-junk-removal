import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { NorthPeakAssistant } from "@/components/assistant/NorthPeakAssistant";
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

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
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
      className={`${plusJakarta.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={localBusinessSchema()} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <NorthPeakAssistant />
      </body>
    </html>
  );
}
