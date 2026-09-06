import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
