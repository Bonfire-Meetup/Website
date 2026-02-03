import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";

import { AppProviders } from "./AppProviders";
import { RouteComplete } from "./components/navigation/RouteComplete";
import { NavigationProvider } from "./components/shared/NavigationContext";
import { NavigationLoader } from "./components/shared/NavigationLoader";
import { RollbarProvider } from "./components/shared/RollbarProvider";
import { getInitialMessages } from "./lib/i18n/initial";
import { DEFAULT_LOCALE } from "./lib/i18n/locales";

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: [
    { color: "#fafafa", media: "(prefers-color-scheme: light)" },
    { color: "#0a0a0a", media: "(prefers-color-scheme: dark)" },
  ],
  width: "device-width",
};

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getInitialMessages(DEFAULT_LOCALE);

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
                  var match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
                  if (match && match[1]) {
                    document.documentElement.lang = match[1];
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <RollbarProvider>
          <NavigationProvider>
            <NavigationLoader />
            <AppProviders initialLocale={DEFAULT_LOCALE} initialMessages={messages}>
              <RouteComplete />
              {children}
            </AppProviders>
          </NavigationProvider>
          <Analytics />
          <SpeedInsights />
        </RollbarProvider>
      </body>
    </html>
  );
}
