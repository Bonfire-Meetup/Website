import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const CDN_HOSTNAME = "cdn-img.bnf.events";

const nextConfig = {
  allowedDevOrigins: ["localhost", "elixeum.local"],
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        hostname: "img.youtube.com",
        pathname: "/vi/**",
        protocol: "https",
      },
      {
        hostname: "i.ytimg.com",
        pathname: "/**",
        protocol: "https",
      },
      {
        hostname: CDN_HOSTNAME,
        pathname: "/**",
        protocol: "https",
      },
    ],
  },
  output: "standalone",
  poweredByHeader: false,
  reactCompiler: true,
  reactStrictMode: true,
} satisfies NextConfig;

export default withBotId(withNextIntl(nextConfig));
