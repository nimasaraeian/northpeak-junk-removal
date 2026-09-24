import type { Metadata } from "next";
import { site } from "@/content/site";

export type ShareImage = {
  /** Site-relative path; resolved to an absolute URL, which crawlers require. */
  url: string;
  width: number;
  height: number;
  alt: string;
};

/**
 * Every page but the homepage was shipping without an og:image.
 *
 * `opengraph-image.tsx` at the app root is a file convention, and Next only
 * folds it in where a route has not declared `openGraph` itself — which this
 * helper does, on every page that uses it. So the branded card reached the
 * homepage and nothing else, and every service, city and Journal link shared
 * as a bare text stub. Naming it as the default here puts it back; a page with
 * its own art still wins by passing `image`.
 */
const DEFAULT_SHARE_IMAGE: ShareImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "NorthPeak Junk Removal — More Space. A Better Tomorrow.",
};

export function pageMetadata({
  title,
  description,
  path,
  image,
  noindex,
}: {
  title: string;
  description: string;
  path: string;
  image?: ShareImage;
  /**
   * Keep the page out of the index while still letting crawlers follow its
   * links. The canonical stays self-referencing, which is what Google expects
   * on a `noindex` URL.
   */
  noindex?: boolean;
}): Metadata {
  const url = new URL(path, site.url).toString();
  const share = image ?? DEFAULT_SHARE_IMAGE;
  const images = [{ ...share, url: new URL(share.url, site.url).toString() }];

  return {
    title,
    description,
    alternates: { canonical: url },
    // Overwrites the root layout's `robots`, which metadata merging resolves
    // per-field from the deepest segment that defines it.
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: `${title} | ${site.shortName}`,
      description,
      url,
      siteName: site.name,
      locale: site.locale,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.shortName}`,
      description,
      images,
    },
  };
}
