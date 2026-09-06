import type { MetadataRoute } from "next";
import { blogPosts } from "@/content/blog";
import { locations } from "@/content/locations";
import { services } from "@/content/services";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/services",
    "/locations",
    "/how-it-works",
    "/about",
    "/contact",
    "/estimate",
    "/blog",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  })) satisfies MetadataRoute.Sitemap;

  return [
    ...staticRoutes,
    ...services.map((service) => ({
      url: `${site.url}/services/${service.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...locations.map((location) => ({
      url: `${site.url}/locations/${location.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...blogPosts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
