import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  i18n: {
    locales: ["fi", "en"],
    defaultLocale: "fi",
    localeDetection: false,
  },
};

export default nextConfig;
