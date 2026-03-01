"use client";

import { useTranslations } from "next-intl";

import { GuideCtaSection } from "@/components/how-to/GuideCtaSection";
import { GuideSection } from "@/components/how-to/GuideSection";
import { GuideStepList } from "@/components/how-to/GuideStepList";
import { HowToPageShell } from "@/components/how-to/HowToPageShell";
import { BoltIcon, FireIcon } from "@/components/shared/Icons";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export function EngagementSignalsContent() {
  const t = useTranslations("engagementSignalsHowTo");
  const tHowToPage = useTranslations("howToPage");
  const tRecordings = useTranslations("recordings");

  return (
    <HowToPageShell
      allGuidesHref={PAGE_ROUTES.GUIDES}
      allGuidesLabel={tHowToPage("browseAllGuides")}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      heroLead={t("heroLead")}
      heroSublead={t("heroSublead")}
      heroWord="SIGNALS"
      heroWordClassName="text-[17vw] sm:text-[13vw]"
      subtitle={t("subtitle")}
      contentClassName="max-w-4xl"
    >
      {/* Outer card has two distinct regions so GuideSectionCard doesn't fit here */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/75 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="px-5 py-7 sm:px-7 sm:py-8">
          <section className="grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-rose-300/40 bg-gradient-to-br from-rose-50/80 to-white p-5 dark:border-rose-400/20 dark:from-rose-500/10 dark:to-white/5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                  <FireIcon
                    className="h-5 w-5 text-rose-600 dark:text-rose-300"
                    aria-hidden="true"
                  />
                  {t("sections.sparks.title")}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/50 bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/15 dark:text-rose-200">
                  <FireIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {tRecordings("spark")}
                </span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-neutral-700 sm:text-base dark:text-neutral-300">
                {t("sections.sparks.summary")}
              </p>
              <GuideStepList
                variant="rose-dot"
                items={[
                  t("sections.sparks.items.one"),
                  t("sections.sparks.items.two"),
                  t("sections.sparks.items.three"),
                ]}
              />
              <div className="mt-5 rounded-2xl border border-rose-300/45 bg-rose-100/60 px-4 py-3 text-sm text-rose-900 dark:border-rose-400/25 dark:bg-rose-500/12 dark:text-rose-100">
                <div className="font-semibold">{t("sections.sparks.impactTitle")}</div>
                <div className="mt-1">{t("sections.sparks.impactBody")}</div>
              </div>
            </article>

            <article className="rounded-2xl border border-emerald-300/40 bg-gradient-to-br from-emerald-50/80 to-white p-5 dark:border-emerald-400/20 dark:from-emerald-500/10 dark:to-white/5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                  <BoltIcon
                    className="h-5 w-5 text-emerald-600 dark:text-emerald-300"
                    aria-hidden="true"
                  />
                  {t("sections.boosts.title")}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/50 bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200">
                  <BoltIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {tRecordings("boost")}
                </span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-neutral-700 sm:text-base dark:text-neutral-300">
                {t("sections.boosts.summary")}
              </p>
              <GuideStepList
                variant="emerald-dot"
                items={[
                  t("sections.boosts.items.one"),
                  t("sections.boosts.items.two"),
                  t("sections.boosts.items.three"),
                ]}
              />
              <div className="mt-5 rounded-2xl border border-emerald-300/45 bg-emerald-100/60 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-500/12 dark:text-emerald-100">
                <div className="font-semibold">{t("sections.boosts.impactTitle")}</div>
                <div className="mt-1">{t("sections.boosts.impactBody")}</div>
              </div>
            </article>
          </section>
        </div>

        <div className="divide-y divide-neutral-200/80 dark:divide-white/10">
          <GuideSection title={t("sections.comparison.title")}>
            <GuideStepList
              variant="bullet"
              items={[
                t("sections.comparison.items.one"),
                t("sections.comparison.items.two"),
                t("sections.comparison.items.three"),
              ]}
            />
          </GuideSection>

          <GuideSection title={t("sections.limits.title")}>
            <GuideStepList
              items={[
                t("sections.limits.items.one"),
                t("sections.limits.items.two"),
                t("sections.limits.items.three"),
              ]}
            />
            <div className="mt-5 rounded-2xl border border-neutral-200/80 bg-neutral-50/90 px-4 py-3 text-sm text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
              {t("sections.limits.callout")}
            </div>
          </GuideSection>

          <GuideSection title={t("sections.visibility.title")}>
            <GuideStepList
              variant="dot"
              items={[
                t("sections.visibility.items.one"),
                t("sections.visibility.items.two"),
                t("sections.visibility.items.three"),
              ]}
            />
          </GuideSection>
        </div>
      </div>

      <GuideCtaSection
        primary={{ href: PAGE_ROUTES.LIBRARY, label: t("cta.library") }}
        secondary={{ href: PAGE_ROUTES.ME, label: t("cta.account") }}
      />
    </HowToPageShell>
  );
}
