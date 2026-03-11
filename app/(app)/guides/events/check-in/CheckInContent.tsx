"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { GuideCtaSection } from "@/components/guides/GuideCtaSection";
import { GuidePageShell } from "@/components/guides/GuidePageShell";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CheckCircleIcon,
  LogInIcon,
  QrCodeIcon,
  SearchIcon,
} from "@/components/shared/Icons";
import { PAGE_ROUTES } from "@/lib/routes/pages";

const STEP_KEYS = ["one", "two", "three", "four", "five", "six"] as const;

const STEP_ICONS = {
  five: SearchIcon,
  four: QrCodeIcon,
  one: LogInIcon,
  six: CheckCircleIcon,
  three: BadgeCheckIcon,
  two: BadgeCheckIcon,
} as const;

const STEP_ACTIONS: Partial<Record<(typeof STEP_KEYS)[number], string>> = {
  one: PAGE_ROUTES.LOGIN,
  three: PAGE_ROUTES.EVENT_CHECK_IN,
  two: PAGE_ROUTES.ME,
};

export function CheckInContent() {
  const t = useTranslations("checkInGuide");
  const tGuidesPage = useTranslations("guidesPage");

  return (
    <GuidePageShell
      allGuidesHref={PAGE_ROUTES.GUIDES}
      allGuidesLabel={tGuidesPage("browseAllGuides")}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      heroLead={t("heroLead")}
      heroSublead={t("heroSublead")}
      heroWord="CHECK-IN"
      subtitle={t("subtitle")}
      contentClassName="max-w-4xl"
    >
      <ol className="relative space-y-8">
        <div className="from-brand-300/60 via-brand-400/25 dark:from-brand-300/30 dark:via-brand-300/10 absolute top-4 bottom-4 left-[1.35rem] w-px bg-gradient-to-b to-transparent sm:left-[1.45rem]" />
        {STEP_KEYS.map((step, index) => {
          const Icon = STEP_ICONS[step];
          const href = STEP_ACTIONS[step];

          return (
            <li key={step} className="relative pl-14 sm:pl-16">
              <div className="border-brand-300/45 dark:border-brand-300/20 absolute top-0 left-0 flex h-11 w-11 items-center justify-center rounded-2xl border bg-white/85 shadow-sm dark:bg-white/5">
                <Icon className="text-brand-700 dark:text-brand-300 h-5 w-5" aria-hidden="true" />
              </div>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-brand-700 dark:text-brand-300 text-xs font-bold tracking-[0.22em] uppercase">
                  {t("stepLabel", { number: index + 1 })}
                </span>
                <span className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {t(`steps.${step}.title`)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
                {t(`steps.${step}.description`)}
              </p>
              {href ? (
                <div className="mt-3">
                  <Link
                    href={href}
                    className="text-brand-700 hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                  >
                    {t(`steps.${step}.cta`)}
                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <GuideCtaSection
        title={t("rally.title")}
        description={t("rally.description")}
        secondDescription={t("benefits.description")}
        primary={{ href: PAGE_ROUTES.LOGIN, label: t("cta.login") }}
        secondary={{ href: PAGE_ROUTES.EVENT_CHECK_IN, label: t("cta.checkIn") }}
      />
    </GuidePageShell>
  );
}
