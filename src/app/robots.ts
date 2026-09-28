import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * Answer engines are crawled deliberately, not by accident.
 *
 * A local service business wants to be the source an assistant quotes when
 * someone asks "who does junk removal in North Vancouver" — being cited is
 * the same win as ranking, and it happens on the same content. So the
 * assistant crawlers are named and allowed rather than left to the wildcard,
 * which makes the decision visible instead of implicit.
 *
 * `Google-Extended` and `Applebot-Extended` are grounding controls, not
 * crawlers: blocking them would keep the site out of AI Overviews and Apple's
 * answers while changing nothing about classic search.
 */
const ANSWER_ENGINE_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
];

/**
 * Closed to every crawler, named or wildcard.
 *
 * `/api/` is server-rendered form endpoints: nothing to index, and a crawler
 * walking them burns budget that belongs on the content. `/admin` is
 * NorthPeak Ops, the internal panel — robots.txt only asks politely, so the
 * real guarantees are the `X-Robots-Tag: noindex, nofollow` header every
 * `/admin` response carries from `proxy.ts`, its absence from the sitemap and
 * llms.txt, and the session gate in front of it.
 */
const DISALLOWED_PATHS = ["/api/", "/admin"];

/**
 * Preview deployments answer on a `*.vercel.app` host with the same content as
 * production. Left indexable they compete with the canonical domain for the
 * phrases this site is built to win, so everything but production is closed.
 * `VERCEL_ENV` is "production" only on the production deployment; it is unset
 * locally, where nothing is crawled anyway.
 */
const isProduction =
  process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
      ...ANSWER_ENGINE_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOWED_PATHS,
      })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
