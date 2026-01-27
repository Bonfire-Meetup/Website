import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";

import { AuthInitializer } from "./components/providers/AuthInitializer";
import { ReduxProvider } from "./components/providers/ReduxProvider";
import { GlobalPlayerProvider } from "./components/shared/GlobalPlayerProvider";
import { QueryProvider } from "./components/shared/QueryProvider";
import { LocaleSync } from "./components/theme/LocaleSync";
import { MotionManager } from "./components/theme/MotionManager";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { getRequestLocale } from "./lib/i18n/request-locale";
import { STORAGE_KEYS } from "./lib/storage/keys";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  const messages = (await import(`./locales/${locale}.json`)).default;

  return (
    <html
      lang={locale}
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleSync />
          <ReduxProvider>
            <AuthInitializer />
            <QueryProvider>
              <MotionManager />
              <div className="relative flex min-h-screen flex-col">
                <ThemeProvider>
                  <GlobalPlayerProvider>{children}</GlobalPlayerProvider>
                </ThemeProvider>
              </div>
            </QueryProvider>
          </ReduxProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
