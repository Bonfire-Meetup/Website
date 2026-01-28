import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Viewport } from "next";

import { DEFAULT_LOCALE } from "./lib/i18n/locales";
import { STORAGE_KEYS } from "./lib/storage/keys";

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
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
