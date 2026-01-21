import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  reactCompiler: true,
  poweredByHeader: false,
  allowedDevOrigins: ["localhost", "elixeum.local"],
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    minimumCacheTTL: 2592000,
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-img.bnf.events",
        pathname: "/**",
      },
    ],
  },
} satisfies NextConfig;

export default withNextIntl(nextConfig);
