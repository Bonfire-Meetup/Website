"use client";

import { useTranslations } from "next-intl";

const GIANTS = [
  { key: "cloud", provider: "Vercel", url: "https://vercel.com" },
  { key: "database", provider: "Neon Serverless", url: "https://neon.tech" },
  {
    key: "storage",
    provider: "Cloudflare R2",
    url: "https://www.cloudflare.com/products/r2/",
  },
  { key: "emails", provider: "Resend", url: "https://resend.com" },
  { key: "bugReporting", provider: "Rollbar", url: "https://rollbar.com" },
  {
    key: "botProtection",
    provider: "Cloudflare Turnstile",
    url: "https://www.cloudflare.com/products/turnstile/",
  },
  { key: "vcs", provider: "GitHub", url: "https://github.com" },
  {
    key: "cicdRunners",
    provider: "Blacksmith",
    url: "https://www.blacksmith.sh",
  },
] as const;

export function ShouldersOfGiants() {
  const t = useTranslations("attributions.giants");

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/90 via-white/70 to-white/85 p-6 shadow-xl backdrop-blur-xl sm:p-8 md:p-10 dark:border-white/10 dark:from-neutral-900/95 dark:via-neutral-900/90 dark:to-neutral-900/95"
      aria-labelledby="giants-heading"
    >
      <div className="from-brand-500/5 to-accent-rose/5 dark:from-brand-400/10 dark:to-accent-rose/10 absolute inset-0 rounded-3xl bg-gradient-to-br via-transparent" />
      <div className="bg-brand-500/10 dark:bg-brand-400/15 absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl" />
      <div className="bg-accent-rose/10 dark:bg-accent-rose/15 absolute -bottom-16 -left-16 h-40 w-40 rounded-full blur-3xl" />

      <div className="relative text-center">
        <h2
          id="giants-heading"
          className="text-gradient mx-auto mb-2 block w-fit text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
        >
          {t("headline")}
        </h2>
        <p className="mb-8 text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
          {t("subline")}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GIANTS.map((item) => (
            <a
              key={item.key}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group hover:border-brand-300 hover:shadow-brand-500/10 dark:hover:border-brand-500/40 dark:hover:shadow-brand-500/10 flex flex-col gap-0.5 rounded-2xl border border-neutral-200/80 bg-white/60 p-4 transition-all duration-300 hover:bg-white/90 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <span className="text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                {t(item.key)}
              </span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {item.provider}
                {"suffixKey" in item && (
                  <span className="font-normal text-neutral-600 dark:text-neutral-300">
                    {" "}
                    {t(item.suffixKey)}
                  </span>
                )}
              </span>
            </a>
          ))}
        </div>
        <p className="mt-8 text-sm text-neutral-500 italic dark:text-neutral-400">
          {t("thankYou")}
        </p>
      </div>
    </section>
  );
}
