import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
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
