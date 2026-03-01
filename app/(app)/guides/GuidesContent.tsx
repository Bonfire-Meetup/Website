"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import type { ComponentType } from "react";

import { GuidePageShell } from "@/components/guides/GuidePageShell";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BoltIcon,
  FingerprintIcon,
  MicIcon,
  ShieldIcon,
  TicketIcon,
  TrashIcon,
} from "@/components/shared/Icons";
import { PAGE_ROUTES } from "@/lib/routes/pages";

interface GuideCard {
  href: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: "true" }>;
  title: string;
  description: string;
  danger?: true;
}

interface GuideGroup {
  label: string;
  cards: GuideCard[];
}

export function GuidesContent() {
  const t = useTranslations("guidesPage");

  const groups: GuideGroup[] = [
    {
      label: t("categories.events"),
      cards: [
        {
          href: PAGE_ROUTES.GUIDES_CHECK_IN,
          icon: BadgeCheckIcon,
          title: t("guides.checkIn.title"),
          description: t("guides.checkIn.description"),
        },
        {
          href: PAGE_ROUTES.GUIDES_EVENT_RSVP,
          icon: TicketIcon,
          title: t("guides.eventRsvp.title"),
          description: t("guides.eventRsvp.description"),
        },
      ],
    },
    {
      label: t("categories.account"),
      cards: [
        {
          href: PAGE_ROUTES.GUIDES_REGISTRATION,
          icon: FingerprintIcon,
          title: t("guides.registration.title"),
          description: t("guides.registration.description"),
        },
        {
          href: PAGE_ROUTES.GUIDES_PROFILE_PRIVACY,
          icon: ShieldIcon,
          title: t("guides.profilePrivacy.title"),
          description: t("guides.profilePrivacy.description"),
        },
        {
          href: PAGE_ROUTES.GUIDES_ACCOUNT_DELETION,
          icon: TrashIcon,
          title: t("guides.accountDeletion.title"),
          description: t("guides.accountDeletion.description"),
          danger: true,
        },
      ],
    },
    {
      label: t("categories.community"),
      cards: [
        {
          href: PAGE_ROUTES.GUIDES_SPEAKING,
          icon: MicIcon,
          title: t("guides.speaking.title"),
          description: t("guides.speaking.description"),
        },
        {
          href: PAGE_ROUTES.GUIDES_ENGAGEMENT_SIGNALS,
          icon: BoltIcon,
          title: t("guides.engagementSignals.title"),
          description: t("guides.engagementSignals.description"),
        },
      ],
    },
  ];

  return (
    <GuidePageShell
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      heroWord="GUIDES"
      heroWordClassName="text-[18vw] sm:text-[13vw]"
      heroWrapperClassName="min-h-[56vh] sm:min-h-[60vh]"
      subtitle={t("subtitle")}
      contentClassName="max-w-5xl"
    >
      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.label}>
            <h2 className="mb-4 text-xs font-bold tracking-[0.25em] text-neutral-500 uppercase dark:text-neutral-400">
              {group.label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.cards.map((card) => {
                const Icon = card.icon;

                if (card.danger) {
                  return (
                    <Link
                      key={card.href}
                      href={card.href}
                      className="group col-span-full flex flex-col rounded-2xl border border-rose-300/40 bg-gradient-to-br from-rose-50/50 via-white to-white p-5 transition-all hover:border-rose-400/50 hover:shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:p-6 dark:border-rose-300/20 dark:from-rose-500/8 dark:via-white/5 dark:to-white/5 dark:hover:border-rose-300/30"
                    >
                      <div className="mb-4 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-300/40 bg-rose-500/10 text-rose-700 sm:mb-0 dark:border-rose-300/20 dark:text-rose-300">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="flex-1 sm:min-w-0">
                        <h3 className="mb-1.5 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                          {card.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                          {card.description}
                        </p>
                      </div>
                      <div className="mt-5 flex shrink-0 items-center gap-1.5 text-sm font-semibold text-rose-700 sm:mt-0 dark:text-rose-300">
                        {t("openGuide")}
                        <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="group hover:border-brand-300/40 dark:hover:border-brand-300/20 flex flex-col rounded-2xl border border-neutral-200/80 bg-white/70 p-5 transition-all hover:bg-white hover:shadow-sm sm:p-6 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                  >
                    <div className="border-brand-300/35 bg-brand-500/10 text-brand-700 dark:border-brand-300/20 dark:text-brand-300 mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {card.description}
                    </p>
                    <div className="text-brand-700 dark:text-brand-300 mt-5 flex items-center gap-1.5 text-sm font-semibold">
                      {t("openGuide")}
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </GuidePageShell>
  );
}
