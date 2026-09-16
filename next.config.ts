import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // 3840 is gone: a 100vw hero on a 2x 1920 display was being served at
    // w=3840, which is far past the point where the extra pixels are visible.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560],
    // Quality values the optimizer will honour. 70 is the site default for
    // photography; anything higher was paying bytes for no visible gain.
    qualities: [70, 75],
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
