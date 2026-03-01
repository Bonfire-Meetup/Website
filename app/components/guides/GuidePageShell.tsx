import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLeftIcon } from "@/components/shared/Icons";

interface GuidePageShellProps {
  allGuidesHref?: string;
  allGuidesLabel?: string;
  children: ReactNode;
  contentClassName?: string;
  eyebrow: string;
  heading: string;
  heroBadge?: string;
  heroLead?: string;
  heroSublead?: string;
  heroWord: string;
  heroWordClassName?: string;
  heroWrapperClassName?: string;
  subtitle: string;
}

export function GuidePageShell({
  allGuidesHref,
  allGuidesLabel,
  children,
  contentClassName,
  eyebrow,
  heading,
  heroBadge,
  heroLead,
  heroSublead,
  heroWord,
  heroWordClassName,
  heroWrapperClassName,
  subtitle,
}: GuidePageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-1),transparent_60%)]" />
        <div className="absolute top-1/3 left-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-2),transparent_60%)]" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,var(--color-rose-glow),transparent_60%)]" />
      </div>

      <section
        className={`relative flex items-center justify-center overflow-hidden px-4 pt-32 pb-14 sm:pb-16 ${
          heroWrapperClassName ?? "min-h-[58vh] sm:min-h-[62vh]"
        }`}
      >
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap select-none">
          <span
            className={`text-outline block leading-none font-black opacity-[0.03] dark:opacity-[0.02] ${
              heroWordClassName ?? "text-[18vw] sm:text-[14vw]"
            }`}
          >
            {heroWord}
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="text-brand-600 dark:text-brand-300 mb-4 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.4em] uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em]">
            <span className="to-brand-400 h-px w-8 bg-gradient-to-r from-transparent sm:w-12" />
            {eyebrow}
            <span className="to-brand-400 h-px w-8 bg-gradient-to-l from-transparent sm:w-12" />
          </p>
          {heroBadge ? (
            <span className="border-brand-300/60 bg-brand-100/70 text-brand-700 dark:border-brand-300/25 dark:bg-brand-500/10 dark:text-brand-300 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase">
              {heroBadge}
            </span>
          ) : null}
          <h1 className="mt-4 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
            {heading}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
            {subtitle}
          </p>
          {heroLead ? (
            <p className="text-brand-700 dark:text-brand-300 mt-6 text-base font-semibold sm:text-lg">
              {heroLead}
            </p>
          ) : null}
          {heroSublead ? (
            <p className="mt-2 text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
              {heroSublead}
            </p>
          ) : null}
          {allGuidesHref && allGuidesLabel ? (
            <div className="mt-6">
              <Link
                href={allGuidesHref}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300/90 bg-white/70 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-white hover:text-neutral-900 dark:border-white/15 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                {allGuidesLabel}
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className={`relative mx-auto px-4 pb-24 sm:px-6 ${contentClassName ?? "max-w-4xl"}`}>
        {children}
        {allGuidesHref && allGuidesLabel ? (
          <div className="mt-10 flex justify-center">
            <Link
              href={allGuidesHref}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300/90 bg-white/70 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-white hover:text-neutral-900 dark:border-white/15 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              {allGuidesLabel}
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
