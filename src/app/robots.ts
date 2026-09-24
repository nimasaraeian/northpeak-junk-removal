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
        // Server-rendered form endpoints. Nothing to index, and a crawler
        // walking them burns budget that belongs on the content.
        disallow: ["/api/"],
      },
      ...ANSWER_ENGINE_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/"],
      })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
