"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { GuidePageShell } from "@/components/guides/GuidePageShell";
import type { HeroWordSize } from "@/components/layout/hero-presets";
import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/locales";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export interface GuideHero {
  eyebrow: string;
  heading: string;
  heroLead?: string;
  heroSublead?: string;
  subtitle: string;
}

interface GuideShellProps {
  children: ReactNode;
  hero: Record<Locale, GuideHero>;
  heroWord: string;
  heroWordSize?: HeroWordSize;
}

export function GuideShell({ children, hero, heroWord, heroWordSize }: GuideShellProps) {
  const locale = useLocale();
  const t = useTranslations("guidesPage");
  const copy = hero[isValidLocale(locale) ? locale : DEFAULT_LOCALE];

  return (
    <GuidePageShell
      allGuidesHref={PAGE_ROUTES.GUIDES}
      allGuidesLabel={t("browseAllGuides")}
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      heroLead={copy.heroLead}
      heroSublead={copy.heroSublead}
      heroWord={heroWord}
      heroWordSize={heroWordSize}
      subtitle={copy.subtitle}
      contentClassName="max-w-4xl"
    >
      {children}
    </GuidePageShell>
  );
}
