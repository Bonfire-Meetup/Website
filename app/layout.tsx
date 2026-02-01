import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Viewport } from "next";

import { NavigationProvider } from "./components/shared/NavigationContext";
import { NavigationLoader } from "./components/shared/NavigationLoader";
import { RollbarProvider } from "./components/shared/RollbarProvider";
import { DEFAULT_LOCALE } from "./lib/i18n/locales";

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
            {children}
          </NavigationProvider>
          <Analytics />
          <SpeedInsights />
        </RollbarProvider>
      </body>
    </html>
  );
}
