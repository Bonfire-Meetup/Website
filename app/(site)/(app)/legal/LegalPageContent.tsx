"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { StaticPageHero } from "@/components/layout/StaticPageHero";

import { TableOfContents } from "./components/TableOfContents";

interface LegalPageContentProps {
  children: ReactNode;
}

export function LegalPageContent({ children }: LegalPageContentProps) {
  const t = useTranslations("legal");
  const tToc = useTranslations("legal.toc");

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
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
