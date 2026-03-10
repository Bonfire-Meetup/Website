"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import type { ComponentType } from "react";

import { StaticPageHero } from "@/components/layout/StaticPageHero";
import {
  ArrowRightIcon,
  DocumentTextIcon,
  MailIcon,
  QuestionMarkCircleIcon,
  ShieldIcon,
} from "@/components/shared/Icons";
import { Card } from "@/components/ui/Card";
import { PAGE_ROUTES } from "@/lib/routes/pages";

interface HelpTile {
  description: string;
  href: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: "true" }>;
  key: "contact" | "faq" | "guides" | "legal";
  title: string;
}

const TILE_CHROME: Record<
  HelpTile["key"],
  {
    borderClassName: string;
    eyebrowClassName: string;
    iconClassName: string;
    iconSurfaceClassName: string;
    orbClassName: string;
  }
> = {
  faq: {
    borderClassName: "hover:border-violet-400/45 dark:hover:border-violet-300/25",
    eyebrowClassName: "text-violet-700 dark:text-violet-300",
    iconClassName: "text-violet-700 dark:text-violet-300",
    iconSurfaceClassName: "bg-violet-100 dark:bg-violet-500/12",
    orbClassName: "bg-violet-400/18 dark:bg-violet-400/14",
  },
  guides: {
    borderClassName: "hover:border-rose-400/45 dark:hover:border-rose-300/25",
    eyebrowClassName: "text-rose-700 dark:text-rose-300",
    iconClassName: "text-rose-700 dark:text-rose-300",
    iconSurfaceClassName: "bg-rose-100 dark:bg-rose-500/12",
    orbClassName: "bg-rose-400/18 dark:bg-rose-400/14",
  },
  legal: {
    borderClassName: "hover:border-emerald-400/45 dark:hover:border-emerald-300/25",
    eyebrowClassName: "text-emerald-700 dark:text-emerald-300",
    iconClassName: "text-emerald-700 dark:text-emerald-300",
    iconSurfaceClassName: "bg-emerald-100 dark:bg-emerald-500/12",
    orbClassName: "bg-emerald-400/18 dark:bg-emerald-400/14",
  },
  contact: {
    borderClassName: "hover:border-cyan-400/45 dark:hover:border-cyan-300/25",
    eyebrowClassName: "text-cyan-700 dark:text-cyan-300",
    iconClassName: "text-cyan-700 dark:text-cyan-300",
    iconSurfaceClassName: "bg-cyan-100 dark:bg-cyan-500/12",
    orbClassName: "bg-cyan-400/18 dark:bg-cyan-400/14",
  },
};

export function HelpPageContent() {
  const t = useTranslations("helpPage");

  const tiles: HelpTile[] = [
    {
      key: "faq",
      href: PAGE_ROUTES.FAQ,
      icon: QuestionMarkCircleIcon,
      title: t("tiles.faq.title"),
      description: t("tiles.faq.description"),
    },
    {
      key: "guides",
      href: PAGE_ROUTES.GUIDES,
      icon: DocumentTextIcon,
      title: t("tiles.guides.title"),
      description: t("tiles.guides.description"),
    },
    {
      key: "legal",
      href: PAGE_ROUTES.LEGAL,
      icon: ShieldIcon,
      title: t("tiles.legal.title"),
      description: t("tiles.legal.description"),
    },
    {
      key: "contact",
      href: PAGE_ROUTES.CONTACT_WITH_TYPE("general"),
      icon: MailIcon,
      title: t("tiles.contact.title"),
      description: t("tiles.contact.description"),
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <StaticPageHero
        backgroundVariant="events"
        eyebrow={t("eyebrow")}
        heroWord="SUPPORT"
        heroWordSize="md"
        subtitle={t("subtitle")}
        title={
          <h1 className="mb-5 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
            <span className="block">{t("titlePart1")}</span>
            <span className="text-gradient-static block">{t("titleHighlight")}</span>
          </h1>
        }
      />

      <section className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <div className="mx-auto mb-7 max-w-5xl sm:mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-neutral-300/50 to-transparent dark:via-neutral-600/30" />
        </div>

        <div className="mx-auto grid max-w-5xl gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            const chrome = TILE_CHROME[tile.key];
            return (
              <Card
                as={Link}
                key={tile.key}
                href={tile.href}
                className={`fire-glow group relative h-full overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 sm:p-6 lg:p-8 ${chrome.borderClassName}`}
              >
                <div
                  className={`pointer-events-none absolute top-0 right-0 h-32 w-32 translate-x-9 -translate-y-9 rounded-full blur-3xl sm:h-36 sm:w-36 sm:translate-x-10 sm:-translate-y-10 ${chrome.orbClassName}`}
                />

                <div className="relative flex h-full flex-col">
                  <p
                    className={`mb-3 text-[10px] font-semibold tracking-[0.18em] uppercase sm:mb-4 sm:text-[11px] ${chrome.eyebrowClassName}`}
                  >
                    {t(`tiles.${tile.key}.eyebrow`)}
                  </p>
                  <div className="mb-4 flex items-center gap-3 sm:mb-5 sm:gap-3.5">
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${chrome.iconSurfaceClassName} ${chrome.iconClassName}`}
                    >
                      <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" aria-hidden="true" />
                    </div>
                    <h2 className="text-xl leading-none font-black tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                      {tile.title}
                    </h2>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-neutral-600 md:min-h-24 dark:text-neutral-300">
                    {tile.description}
                  </p>
                  <div className="mt-6 sm:mt-7">
                    <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-neutral-300/80 bg-white/70 px-3.5 py-2 text-xs font-medium text-neutral-700 shadow-sm shadow-black/5 transition-colors group-hover:border-neutral-400 group-hover:bg-white sm:w-fit sm:py-1.5 dark:border-white/15 dark:bg-white/5 dark:text-neutral-300 dark:shadow-none dark:group-hover:border-white/25 dark:group-hover:bg-white/10">
                      <span>{t("open")}</span>
                      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
