import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { HowToPageShell } from "@/components/how-to/HowToPageShell";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CheckCircleIcon,
  LogInIcon,
  QrCodeIcon,
} from "@/components/shared/Icons";
import { buildSimplePageMetadata } from "@/lib/metadata";
import { PAGE_ROUTES } from "@/lib/routes/pages";

const STEP_KEYS = ["one", "two", "three", "four", "five"] as const;

const STEP_ICONS = {
  five: CheckCircleIcon,
  four: QrCodeIcon,
  one: LogInIcon,
  three: BadgeCheckIcon,
  two: BadgeCheckIcon,
} as const;

const STEP_ACTIONS: Partial<Record<(typeof STEP_KEYS)[number], string>> = {
  one: PAGE_ROUTES.LOGIN,
  three: PAGE_ROUTES.EVENT_CHECK_IN,
  two: PAGE_ROUTES.ME,
};

export default async function HowToCheckInPage() {
  const t = await getTranslations("checkInHowTo");
  const tHowToPage = await getTranslations("howToPage");

  return (
    <HowToPageShell
      allGuidesHref={PAGE_ROUTES.GUIDES}
      allGuidesLabel={tHowToPage("browseAllGuides")}
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

      <div className="mt-14 border-t border-neutral-200 pt-8 dark:border-white/10">
        <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
          {t("rally.title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-700 sm:text-base dark:text-neutral-300">
          {t("rally.description")}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
          {t("benefits.description")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={PAGE_ROUTES.LOGIN}
            className="bg-brand-600 hover:bg-brand-500 focus-visible:ring-brand-400 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-neutral-950"
          >
            {t("cta.login")}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={PAGE_ROUTES.EVENT_CHECK_IN}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-neutral-950"
          >
            {t("cta.checkIn")}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </HowToPageShell>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "checkInHowTo" });
}
