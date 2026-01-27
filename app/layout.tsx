import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { AppProviders } from "./AppProviders";
import { DEFAULT_LOCALE } from "./lib/i18n/locales";
import { STORAGE_KEYS } from "./lib/storage/keys";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: DEFAULT_LOCALE, namespace: "meta" });
  const tCommon = await getTranslations({ locale: DEFAULT_LOCALE, namespace: "common" });
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };
  const keywords = t.raw("keywords") as string[];
  const processedKeywords = keywords.map((k) =>
    k === "{prague}"
      ? commonValues.prague
      : k === "{zlin}"
        ? commonValues.zlin
        : k === "{country}"
          ? commonValues.country
          : k,
  );

  return {
    authors: [{ name: t("author", commonValues) }],
    description: t("siteDescription", commonValues),
    keywords: processedKeywords,
    openGraph: {
      description: t("siteDescription", commonValues),
      siteName: t("siteName", commonValues),
      title: t("siteTitle", commonValues),
      type: "website",
    },
    robots: {
      follow: true,
      index: true,
    },
    title: t("siteTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("siteDescription", commonValues),
      title: t("siteTitle", commonValues),
    },
  };
}

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: [
    { color: "#fafafa", media: "(prefers-color-scheme: light)" },
    { color: "#0a0a0a", media: "(prefers-color-scheme: dark)" },
  ],
  width: "device-width",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      className={`${GeistSans.variable} ${GeistMono.variable} smooth-scroll`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem("${STORAGE_KEYS.THEME}");
                  var resolved = theme;
                  if (!theme || theme === "system") {
                    resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                  }
                  document.documentElement.classList.add(resolved);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <Suspense fallback={null}>
          <AppProviders>{children}</AppProviders>
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
