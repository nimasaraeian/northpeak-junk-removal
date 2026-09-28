import { GoogleAnalytics } from "@next/third-parties/google";
import { ContactClickTracker } from "@/components/analytics/ContactClickTracker";
import { AssistantMount } from "@/components/assistant/AssistantMount";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessSchema, organizationSchema } from "@/lib/schema";

/**
 * The public site's wrapper, in two pieces.
 *
 * This used to live in the root layout, which meant it also rendered on
 * `/admin`. It moved down here so the admin panel can be a sibling of the
 * marketing site rather than a page inside it. Nothing about what a public
 * page renders changed; only where the wrapper is declared.
 *
 * Neither piece reads request-scoped data, so `/blog/[slug]` and friends stay
 * statically prerendered.
 */

// Unset in local development and on preview deploys, which keeps those visits
// out of the property instead of polluting production reports.
const gaId = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Header, footer and the site-wide business schema — the visible shell.
 *
 * Split out from `SiteFrame` for `not-found.tsx`, which sits at the app root
 * so it can catch any unmatched URL. Next serializes that boundary into the
 * payload of every route under the root layout, `/admin` included; keeping
 * analytics out of it means the GA4 measurement ID never appears in an admin
 * response at all, rather than appearing and merely not firing.
 *
 * The cost is that a 404 on an unmatched URL is not counted in GA4. Pages
 * that exist still are.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={localBusinessSchema()} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

/** The shell plus everything that reports on it. Used by the `(site)` group. */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteChrome>{children}</SiteChrome>
      <AssistantMount />
      <ContactClickTracker />
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </>
  );
}
