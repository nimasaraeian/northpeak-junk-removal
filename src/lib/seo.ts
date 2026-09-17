import type { Metadata } from "next";
import { site } from "@/content/site";

export type ShareImage = {
  /** Site-relative path; resolved to an absolute URL, which crawlers require. */
  url: string;
  width: number;
  height: number;
  alt: string;
};

export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: ShareImage;
}): Metadata {
  const url = new URL(path, site.url).toString();
  const images = image
    ? [{ ...image, url: new URL(image.url, site.url).toString() }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${site.shortName}`,
      description,
      url,
      siteName: site.name,
      locale: site.locale,
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.shortName}`,
      description,
      ...(images ? { images } : {}),
    },
  };
}
