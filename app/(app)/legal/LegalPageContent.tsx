"use client";

import { useLocale, useTranslations } from "next-intl";

import { StaticPageHero } from "@/components/layout/StaticPageHero";
import { formatLongDateUTC } from "@/lib/utils/locale";

import { CodeOfConductSection } from "./components/CodeOfConductSection";
import { PrivacyPolicySection } from "./components/PrivacyPolicySection";
import { TableOfContents } from "./components/TableOfContents";
import { TermsOfServiceSection } from "./components/TermsOfServiceSection";

export function LegalPageContent() {
  const t = useTranslations("legal");
  const tPrivacy = useTranslations("legal.privacy");
  const tTerms = useTranslations("legal.terms");
  const tToc = useTranslations("legal.toc");
  const locale = useLocale();

  const lastUpdated = formatLongDateUTC("2025-01-01", locale);

  return (
    <main className="gradient-bg min-h-screen pb-20">
      <StaticPageHero
        backgroundVariant="brand"
        eyebrow={t("eyebrow")}
        heroWord="LEGAL"
        heroWordSize="sm"
        subtitle={t("subtitle")}
        subtitleClassName="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400"
        title={
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
            {t("title")}
          </h1>
        }
      />

      <div className="px-4">
        <div className="mx-auto max-w-3xl">
          <div className="glass-card no-hover-pop space-y-12 p-8 sm:p-12">
            <TableOfContents tToc={tToc} />
            <CodeOfConductSection t={t} tToc={tToc} />
            <PrivacyPolicySection tPrivacy={tPrivacy} currentDate={lastUpdated} />
            <TermsOfServiceSection tTerms={tTerms} currentDate={lastUpdated} />
          </div>
        </div>
      </div>
    </main>
  );
}
