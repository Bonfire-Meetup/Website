import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const CDN_HOSTNAME = "cdn-img.bnf.events";

const nextConfig = {
  allowedDevOrigins: ["localhost", "bonfire.dev"],
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  headers: () => [
    {
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://va.vercel-scripts.com https://*.vercel-insights.com https://vitals.vercel-insights.com https://vercel-insights.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https://img.youtube.com https://i.ytimg.com https://cdn-img.bnf.events",
            "font-src 'self' data:",
            "connect-src 'self' https://challenges.cloudflare.com https://*.vercel-insights.com https://vitals.vercel-insights.com https://vercel-insights.com",
            "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
            "upgrade-insecure-requests",
          ].join("; "),
        },
      ],
      source: "/:path*",
    },
  ],
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
