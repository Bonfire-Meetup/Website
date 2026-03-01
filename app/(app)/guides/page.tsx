import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { HowToPageShell } from "@/components/how-to/HowToPageShell";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BoltIcon,
  FingerprintIcon,
  TicketIcon,
  TrashIcon,
} from "@/components/shared/Icons";
import { buildSimplePageMetadata } from "@/lib/metadata";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export default async function HowToPage() {
  const t = await getTranslations("howToPage");
  const guides = [
    {
      cta: t("guides.checkIn.cta"),
      description: t("guides.checkIn.description"),
      href: PAGE_ROUTES.GUIDES_CHECK_IN,
      icon: BadgeCheckIcon,
      title: t("guides.checkIn.title"),
    },
    {
      cta: t("guides.registration.cta"),
      description: t("guides.registration.description"),
      href: PAGE_ROUTES.GUIDES_REGISTRATION,
      icon: FingerprintIcon,
      title: t("guides.registration.title"),
    },
    {
      cta: t("guides.engagementSignals.cta"),
      description: t("guides.engagementSignals.description"),
      href: PAGE_ROUTES.GUIDES_ENGAGEMENT_SIGNALS,
      icon: BoltIcon,
      title: t("guides.engagementSignals.title"),
    },
    {
      cta: t("guides.eventRsvp.cta"),
      description: t("guides.eventRsvp.description"),
      href: PAGE_ROUTES.GUIDES_EVENT_RSVP,
      icon: TicketIcon,
      title: t("guides.eventRsvp.title"),
    },
    {
      cta: t("guides.accountDeletion.cta"),
      description: t("guides.accountDeletion.description"),
      href: PAGE_ROUTES.GUIDES_ACCOUNT_DELETION,
      icon: TrashIcon,
      title: t("guides.accountDeletion.title"),
    },
  ] as const;

  return (
    <HowToPageShell
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      heroWord="GUIDES"
      heroWordClassName="text-[18vw] sm:text-[13vw]"
      heroWrapperClassName="min-h-[56vh] sm:min-h-[60vh]"
      subtitle={t("subtitle")}
      contentClassName="max-w-5xl"
    >
      <h2 className="mb-6 text-sm font-bold tracking-[0.22em] text-neutral-500 uppercase dark:text-neutral-400">
        {t("availableGuides")}
      </h2>

      <div className="overflow-hidden rounded-3xl border border-neutral-200/70 bg-white/70 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
        <div className="divide-y divide-neutral-200/80 dark:divide-white/10">
          {guides.map((guide) => {
            const Icon = guide.icon;

            return (
              <Link
                key={guide.href}
                href={guide.href}
                className="group block px-5 py-5 transition-colors hover:bg-neutral-50/80 sm:px-6 dark:hover:bg-white/[0.03]"
              >
                <div className="flex items-start gap-4">
                  <div className="border-brand-300/35 bg-brand-500/10 text-brand-700 dark:border-brand-300/20 dark:text-brand-300 mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl dark:text-white">
                        {guide.title}
                      </h3>
                      <span className="text-brand-700 dark:text-brand-300 hidden items-center gap-1.5 text-sm font-semibold sm:inline-flex">
                        {guide.cta}
                        <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
                      {guide.description}
                    </p>
                    <span className="text-brand-700 dark:text-brand-300 mt-3 inline-flex items-center gap-1.5 text-sm font-semibold sm:hidden">
                      {guide.cta}
                      <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </HowToPageShell>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "howToPage" });
}
