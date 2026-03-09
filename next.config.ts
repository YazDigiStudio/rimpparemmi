import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Serve /admin/index.html before i18n routing intercepts it
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/admin", destination: "/admin/index.html" },
        { source: "/admin/", destination: "/admin/index.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  i18n: {
    locales: ["fi", "en"],
    defaultLocale: "fi",
    localeDetection: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/rimpparemmi-b3154.firebasestorage.app/**",
      },
    ],
  },
};

export default nextConfig;
