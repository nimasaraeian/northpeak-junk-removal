import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    qualities: [75, 90, 95],
  },
  experimental: {
    serverActions: {
      // The estimate wizard posts every photo in one Server Action request.
      // Photos are compressed in the browser first and capped at 4.5MB total
      // (MAX_TOTAL_UPLOAD_BYTES in src/lib/estimate/photos.ts); the raw body is
      // larger than that, because multipart boundaries, part headers, and the
      // text fields ride along. 6mb leaves headroom without inviting large
      // uploads. The contact form does not rely on this — it posts one photo
      // per request through /api/contact/photos.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
