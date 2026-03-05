import type { ReactNode } from "react";

import {
  HERO_SECTION_CLASS,
  HERO_WORD_SIZE_CLASS,
  type HeroSectionPreset,
  type HeroWordSize,
} from "./hero-presets";

interface StaticPageHeroProps {
  backgroundVariant?: "brand" | "events" | "none";
  brandAccentClassName?: string;
  children?: ReactNode;
  containerClassName?: string;
  eyebrow: ReactNode;
  eyebrowClassName?: string;
  eyebrowLineClassName?: string;
  heroWord?: string;
  heroWordClassName?: string;
  heroWordSize?: HeroWordSize;
  sectionClassName?: string;
  sectionPreset?: HeroSectionPreset;
  subtitle?: ReactNode;
  subtitleClassName?: string;
  title: ReactNode;
}

export function StaticPageHero({
  backgroundVariant = "brand",
  brandAccentClassName = "bg-[radial-gradient(circle_at_center,var(--color-rose-glow),transparent_60%)]",
  children,
  containerClassName = "mx-auto max-w-3xl text-center",
  eyebrow,
  eyebrowClassName = "text-brand-600 dark:text-brand-300 mb-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.4em] uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em]",
  eyebrowLineClassName = "to-brand-400",
  heroWord,
  heroWordClassName,
  heroWordSize = "md",
  sectionClassName,
  sectionPreset = "default",
  subtitle,
  subtitleClassName = "mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400",
  title,
}: StaticPageHeroProps) {
  const resolvedHeroWordClassName = heroWordClassName ?? HERO_WORD_SIZE_CLASS[heroWordSize];
  const resolvedSectionClassName = sectionClassName ?? HERO_SECTION_CLASS[sectionPreset];

  return (
    <section className={resolvedSectionClassName}>
      {backgroundVariant === "brand" ? (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-1),transparent_60%)]" />
          <div className="absolute top-1/3 left-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-2),transparent_60%)]" />
          <div
            className={`absolute right-0 bottom-0 h-96 w-96 rounded-full ${brandAccentClassName}`}
          />
        </div>
      ) : null}
      {backgroundVariant === "events" ? (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
          <div className="absolute top-28 right-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,var(--color-orange-glow),transparent_62%)]" />
          <div className="absolute bottom-10 left-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,var(--color-rose-glow),transparent_65%)]" />
        </div>
      ) : null}

      {heroWord ? (
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap select-none">
          <span
            className={`text-outline block leading-none font-black opacity-[0.03] dark:opacity-[0.02] ${resolvedHeroWordClassName}`}
          >
            {heroWord}
          </span>
        </div>
      ) : null}

      <div className={`relative z-10 ${containerClassName}`}>
        <p className={eyebrowClassName}>
          <span
            className={`h-px w-8 bg-gradient-to-r from-transparent sm:w-12 ${eyebrowLineClassName}`}
          />
          {eyebrow}
          <span
            className={`h-px w-8 bg-gradient-to-l from-transparent sm:w-12 ${eyebrowLineClassName}`}
          />
        </p>
        {title}
        {subtitle ? <div className={subtitleClassName}>{subtitle}</div> : null}
      </div>
      {children}
    </section>
  );
}
