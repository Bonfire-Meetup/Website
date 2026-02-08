"use client";

import { useTranslations } from "next-intl";

import { HeartFilledIcon } from "@/components/shared/Icons";

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
      className="relative overflow-hidden rounded-[2rem] border border-neutral-200/80 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.14),transparent_44%),radial-gradient(circle_at_bottom_left,rgba(251,113,133,0.12),transparent_45%),linear-gradient(140deg,#ffffff,rgba(250,250,250,0.98)_52%,#ffffff)] p-5 shadow-[0_32px_90px_-44px_rgba(0,0,0,0.38)] sm:p-8 md:p-10 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.22),transparent_44%),radial-gradient(circle_at_bottom_left,rgba(251,113,133,0.18),transparent_45%),linear-gradient(140deg,#09090b,#111113_55%,#09090b)]"
      aria-labelledby="giants-heading"
    >
      <div className="from-brand-500/8 to-accent-rose/8 dark:from-brand-400/14 dark:to-accent-rose/14 absolute inset-0 rounded-[2rem] bg-gradient-to-br via-transparent" />
      <div className="bg-brand-500/12 dark:bg-brand-400/22 absolute -top-28 -right-28 h-56 w-56 rounded-full blur-3xl" />
      <div className="bg-accent-rose/12 dark:bg-accent-rose/22 absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-white/45 dark:ring-white/8" />

      <div className="relative space-y-7 sm:space-y-8">
        <div className="grid items-end gap-4 sm:gap-6 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.9fr)]">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-300/70 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-neutral-600 uppercase dark:border-white/15 dark:bg-white/8 dark:text-neutral-200">
              <span
                className="bg-brand-500 dark:bg-brand-400 block h-1.5 w-1.5 rounded-full shadow-[0_0_0_3px_rgba(236,72,153,0.18)] dark:shadow-[0_0_0_3px_rgba(244,114,182,0.25)]"
                aria-hidden
              />
              Open source + services
            </span>
            <h2
              id="giants-heading"
              className="text-gradient mb-2 text-2xl font-black tracking-tight sm:text-3xl md:text-[2.2rem]"
            >
              {t("headline")}
            </h2>
            <p className="max-w-2xl text-sm text-neutral-600 sm:text-base dark:text-neutral-300">
              {t("subline")}
            </p>
          </div>

          <div className="group relative isolate overflow-hidden rounded-2xl border border-white/60 bg-white/40 px-4 py-3.5 shadow-[0_22px_48px_-34px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-transform duration-300 motion-safe:hover:-translate-y-0.5 sm:px-5 sm:py-4 dark:border-white/16 dark:bg-white/8">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(255,255,255,0.1)_58%,rgba(255,255,255,0.03))] dark:bg-[linear-gradient(145deg,rgba(255,255,255,0.2),rgba(255,255,255,0.05)_58%,rgba(255,255,255,0.02))]" />
            <div className="bg-brand-400/28 dark:bg-brand-400/30 pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl" />
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/80 dark:bg-white/30" />

            <div className="relative text-center">
              <div className="mb-2.5 inline-flex items-center gap-2">
                <span className="bg-brand-500/14 text-brand-700 dark:bg-brand-300/18 dark:text-brand-100 inline-flex h-7 w-7 items-center justify-center rounded-full text-[13px]">
                  <HeartFilledIcon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase dark:text-neutral-300">
                  With gratitude
                </span>
              </div>
              <p className="mx-auto max-w-[42ch] text-[13px] leading-relaxed font-medium text-neutral-700 sm:text-sm dark:text-neutral-100">
                {t("thankYou")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {GIANTS.map((item) => (
            <a
              key={item.key}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group focus-visible:ring-brand-400/65 focus-visible:ring-offset-background hover:border-brand-300 hover:shadow-brand-500/10 dark:hover:border-brand-500/40 dark:hover:shadow-brand-500/10 flex items-start justify-between gap-3 rounded-2xl border border-neutral-200/80 bg-white/88 p-4 shadow-[0_10px_22px_-18px_rgba(0,0,0,0.5)] transition-all duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none motion-safe:hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/12"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                  {t(item.key)}
                </span>
                <p className="mt-0.5 truncate text-base font-semibold text-neutral-900 dark:text-white">
                  {item.provider}
                </p>
              </div>
              <span className="text-neutral-400 transition-all duration-300 group-hover:text-neutral-600 motion-safe:group-hover:translate-x-0.5 dark:text-neutral-500 dark:group-hover:text-neutral-300">
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
