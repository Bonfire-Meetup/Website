"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { GuideCtaSection } from "@/components/guides/GuideCtaSection";
import { GuidePageShell } from "@/components/guides/GuidePageShell";
import { GuideSection } from "@/components/guides/GuideSection";
import { GuideSectionCard } from "@/components/guides/GuideSectionCard";
import { GuideStepList } from "@/components/guides/GuideStepList";
import {
  ClockIcon,
  ExternalLinkIcon,
  GuildIcon,
  RefreshIcon,
  ShieldIcon,
  SparklesIcon,
} from "@/components/shared/Icons";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export function GuildSubscriptionContent({
  subscriptionEnabled,
}: {
  subscriptionEnabled: boolean;
}) {
  const t = useTranslations("guildSubscriptionGuide");
  const tGuidesPage = useTranslations("guidesPage");

  const bannerKey = subscriptionEnabled ? "live" : "disabled";

  return (
    <GuidePageShell
      allGuidesHref={PAGE_ROUTES.GUIDES}
      allGuidesLabel={tGuidesPage("browseAllGuides")}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      heroLead={t("heroLead")}
      heroSublead={t("heroSublead")}
      heroWord="GUILD"
      subtitle={t("subtitle")}
      contentClassName="max-w-4xl"
    >
      <Link
        href={PAGE_ROUTES.GUILD}
        className={
          subscriptionEnabled
            ? "group relative mb-8 block overflow-hidden rounded-[1.4rem] border border-emerald-200/70 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.13),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.09),transparent_52%),linear-gradient(150deg,#ffffff,rgba(240,253,244,0.95)_55%,#ffffff)] p-6 shadow-[0_20px_60px_-30px_rgba(16,185,129,0.32)] transition duration-300 hover:border-emerald-300/80 hover:shadow-[0_24px_64px_-28px_rgba(16,185,129,0.42)] sm:p-7 dark:border-emerald-500/20 dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.14),transparent_52%),linear-gradient(150deg,#09090b,#0a120e_55%,#09090b)] dark:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)] dark:hover:border-emerald-400/35"
            : "group relative mb-8 block overflow-hidden rounded-[1.4rem] border border-amber-200/65 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.13),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(251,113,133,0.10),transparent_52%),linear-gradient(150deg,#ffffff,rgba(255,251,235,0.96)_55%,#ffffff)] p-6 shadow-[0_20px_60px_-30px_rgba(245,158,11,0.28)] transition duration-300 hover:border-amber-300/80 hover:shadow-[0_24px_64px_-28px_rgba(245,158,11,0.38)] sm:p-7 dark:border-amber-500/18 dark:bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(251,113,133,0.14),transparent_52%),linear-gradient(150deg,#09090b,#120e00_55%,#09090b)] dark:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)] dark:hover:border-amber-400/32"
        }
      >
        {/* Background glow blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full blur-3xl transition duration-300 group-hover:scale-110">
          <div
            className={
              subscriptionEnabled
                ? "h-full w-full rounded-full bg-emerald-400/20 dark:bg-emerald-300/22"
                : "h-full w-full rounded-full bg-amber-400/22 dark:bg-amber-300/24"
            }
          />
        </div>
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full blur-2xl">
          <div
            className={
              subscriptionEnabled
                ? "bg-brand-400/14 dark:bg-brand-300/18 h-full w-full rounded-full"
                : "h-full w-full rounded-full bg-rose-400/14 dark:bg-rose-300/18"
            }
          />
        </div>
        {/* Top shine line */}
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/70 dark:bg-white/12" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            {/* Pill badge */}
            <span
              className={`mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-bold tracking-[0.14em] uppercase ${
                subscriptionEnabled
                  ? "border-emerald-300/60 bg-emerald-100/70 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-500/12 dark:text-emerald-300"
                  : "border-amber-300/60 bg-amber-100/70 text-amber-700 dark:border-amber-400/25 dark:bg-amber-500/12 dark:text-amber-300"
              }`}
            >
              <span
                className={`block h-1.5 w-1.5 rounded-full ${
                  subscriptionEnabled
                    ? "animate-pulse bg-emerald-500 dark:bg-emerald-400"
                    : "animate-pulse bg-amber-500 dark:bg-amber-400"
                }`}
                aria-hidden
              />
              {t(`statusBanner.${bannerKey}.pill`)}
            </span>

            <p className="text-base font-bold tracking-tight text-neutral-900 sm:text-[17px] dark:text-white">
              {t(`statusBanner.${bannerKey}.heading`)}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 sm:text-[15px] dark:text-neutral-400">
              {t(`statusBanner.${bannerKey}.body`)}
            </p>
          </div>

          {/* Icon blob */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm transition duration-300 motion-safe:group-hover:scale-105 ${
              subscriptionEnabled
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                : "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
            }`}
          >
            {subscriptionEnabled ? (
              <SparklesIcon className="h-5 w-5" aria-hidden />
            ) : (
              <ClockIcon className="h-5 w-5" aria-hidden />
            )}
          </div>
        </div>

        {/* CTA row */}
        <div
          className={`relative mt-4 flex items-center justify-between border-t pt-4 ${
            subscriptionEnabled
              ? "border-emerald-200/50 dark:border-emerald-400/12"
              : "border-amber-200/50 dark:border-amber-400/12"
          }`}
        >
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-semibold transition ${
              subscriptionEnabled
                ? "text-emerald-700 group-hover:text-emerald-800 dark:text-emerald-300 dark:group-hover:text-emerald-200"
                : "text-amber-700 group-hover:text-amber-800 dark:text-amber-300 dark:group-hover:text-amber-200"
            }`}
          >
            {t(`statusBanner.${bannerKey}.cta`)}
            <span
              aria-hidden
              className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
          <GuildIcon
            className={`h-4 w-4 opacity-35 transition duration-300 group-hover:opacity-55 ${
              subscriptionEnabled
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
            aria-hidden
          />
        </div>
      </Link>

      <GuideSectionCard>
        <GuideSection title={t("sections.tiers.title")} icon={GuildIcon}>
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                {t("sections.tiers.scout.title")}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {t("sections.tiers.scout.description")}
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                {t("sections.tiers.explorer.title")}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {t("sections.tiers.explorer.description")}
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                {t("sections.tiers.trailblazer.title")}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {t("sections.tiers.trailblazer.description")}
              </p>
            </div>
          </div>
        </GuideSection>

        <GuideSection title={t("sections.billing.title")} icon={ExternalLinkIcon}>
          <GuideStepList
            items={[
              t("sections.billing.items.one"),
              t("sections.billing.items.two"),
              t("sections.billing.items.three"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.sync.title")} icon={RefreshIcon}>
          <GuideStepList
            items={[
              t("sections.sync.items.one"),
              t("sections.sync.items.two"),
              t("sections.sync.items.three"),
            ]}
            variant="dot"
          />
        </GuideSection>

        <GuideSection title={t("sections.support.title")} icon={ShieldIcon}>
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {t("sections.support.description")}{" "}
            <Link
              href="mailto:hello+support@bnf.events"
              className="font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500 dark:text-white dark:decoration-white/20 dark:hover:decoration-white/40"
            >
              hello+support@bnf.events
            </Link>
            .
          </p>
        </GuideSection>
      </GuideSectionCard>

      <GuideCtaSection
        title={t("cta.title")}
        description={t("cta.description")}
        secondDescription={t("cta.secondDescription")}
        primary={{ href: PAGE_ROUTES.GUILD, label: t("cta.primary") }}
        secondary={{ href: PAGE_ROUTES.ME, label: t("cta.secondary") }}
      />
    </GuidePageShell>
  );
}
