import type { Metadata, Viewport } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { GlobalPlayerProvider } from "./components/shared/GlobalPlayerProvider";
import { MotionManager } from "./components/theme/MotionManager";
import { STORAGE_KEYS } from "./lib/storage/keys";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
  const commonValues = {
    brandName: tCommon("brandName"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
    country: tCommon("country"),
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
    title: t("siteTitle", commonValues),
    description: t("siteDescription", commonValues),
    keywords: processedKeywords,
    authors: [{ name: t("author", commonValues) }],
    openGraph: {
      title: t("siteTitle", commonValues),
      description: t("siteDescription", commonValues),
      type: "website",
      siteName: t("siteName", commonValues),
    },
    twitter: {
      card: "summary_large_image",
      title: t("siteTitle", commonValues),
      description: t("siteDescription", commonValues),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = (await import(`./locales/${locale}.json`)).default;

  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      data-scroll-behavior="smooth"
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
      <body className="min-h-screen bg-white text-neutral-900 antialiased transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <MotionManager />
          <ThemeProvider>
            <GlobalPlayerProvider>
              <div className="relative flex min-h-screen flex-col">{children}</div>
            </GlobalPlayerProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
