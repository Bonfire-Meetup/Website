import type { ReactNode } from "react";

import {
  HERO_SECTION_CLASS,
  HERO_WORD_SIZE_CLASS,
  type HeroWordSize,
} from "@/components/layout/hero-presets";
import { BackLink } from "@/components/ui/BackLink";
import { Pill } from "@/components/ui/Pill";

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
  heroWordSize?: HeroWordSize;
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
  heroWordSize = "lg",
  heroWrapperClassName,
  subtitle,
}: GuidePageShellProps) {
  const resolvedHeroWordClassName = heroWordClassName ?? HERO_WORD_SIZE_CLASS[heroWordSize];

  return (
    <main className="gradient-bg relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-1),transparent_60%)]" />
        <div className="absolute top-1/3 left-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-2),transparent_60%)]" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,var(--color-rose-glow),transparent_60%)]" />
      </div>

      <section className={`${HERO_SECTION_CLASS.default} ${heroWrapperClassName ?? ""}`}>
        {allGuidesHref && allGuidesLabel ? (
          <div className="absolute top-24 left-1/2 z-20 flex w-full max-w-3xl -translate-x-1/2 px-4 sm:top-28">
            <BackLink href={allGuidesHref}>{allGuidesLabel}</BackLink>
          </div>
        ) : null}
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap select-none">
          <span
            className={`text-outline block leading-none font-black opacity-[0.03] dark:opacity-[0.02] ${resolvedHeroWordClassName}`}
          >
            {heroWord}
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-brand-600 dark:text-brand-300 tracking-label-lg sm:tracking-label-lg mb-4 flex items-center justify-center gap-2 text-xs font-bold uppercase sm:gap-3 sm:text-sm">
              <span className="to-brand-400 h-px w-8 bg-gradient-to-r from-transparent sm:w-12" />
              {eyebrow}
              <span className="to-brand-400 h-px w-8 bg-gradient-to-l from-transparent sm:w-12" />
            </p>
            {heroBadge ? (
              <Pill
                size="xs"
                className="border-brand-300/60 bg-brand-100/70 text-brand-700 dark:border-brand-300/25 dark:bg-brand-500/10 dark:text-brand-300 tracking-label-sm border font-semibold uppercase"
              >
                {heroBadge}
              </Pill>
            ) : null}
            <h1 className="page-title mt-4">{heading}</h1>
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
          </div>
        </div>
      </section>

      <section className={`relative mx-auto px-4 pb-24 sm:px-6 ${contentClassName ?? "max-w-4xl"}`}>
        {children}
      </section>
    </main>
  );
}
