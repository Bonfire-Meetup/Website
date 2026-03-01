import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { HowToPageShell } from "@/components/how-to/HowToPageShell";
import { ArrowRightIcon, BoltIcon, FireIcon } from "@/components/shared/Icons";
import { buildSimplePageMetadata } from "@/lib/metadata";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export default async function EngagementSignalsGuidePage() {
  const t = await getTranslations("engagementSignalsHowTo");
  const tHowToPage = await getTranslations("howToPage");
  const tRecordings = await getTranslations("recordings");

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
              <ol className="space-y-2">
                {(["one", "two", "three"] as const).map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500 dark:bg-rose-300" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {t(`sections.sparks.items.${item}`)}
                    </span>
                  </li>
                ))}
              </ol>
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
              <ol className="space-y-2">
                {(["one", "two", "three"] as const).map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-300" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {t(`sections.boosts.items.${item}`)}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 rounded-2xl border border-emerald-300/45 bg-emerald-100/60 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-500/12 dark:text-emerald-100">
                <div className="font-semibold">{t("sections.boosts.impactTitle")}</div>
                <div className="mt-1">{t("sections.boosts.impactBody")}</div>
              </div>
            </article>
          </section>
        </div>

        <div className="divide-y divide-neutral-200/80 dark:divide-white/10">
          <article className="px-5 py-7 sm:px-7 sm:py-8">
            <h2 className="mb-4 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {t("sections.comparison.title")}
            </h2>
            <ol className="space-y-3">
              {(["one", "two", "three"] as const).map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                  <span className="border-brand-300/40 text-brand-700 dark:border-brand-300/25 dark:text-brand-300 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                    •
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {t(`sections.comparison.items.${item}`)}
                  </span>
                </li>
              ))}
            </ol>
          </article>

          <article className="px-5 py-7 sm:px-7 sm:py-8">
            <h2 className="mb-4 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {t("sections.limits.title")}
            </h2>
            <ol className="space-y-3">
              {(["one", "two", "three"] as const).map((item, index) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                  <span className="border-brand-300/40 text-brand-700 dark:border-brand-300/25 dark:text-brand-300 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {t(`sections.limits.items.${item}`)}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-2xl border border-neutral-200/80 bg-neutral-50/90 px-4 py-3 text-sm text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
              {t("sections.limits.callout")}
            </div>
          </article>

          <article className="px-5 py-7 sm:px-7 sm:py-8">
            <h2 className="mb-4 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {t("sections.visibility.title")}
            </h2>
            <ol className="space-y-3">
              {(["one", "two", "three"] as const).map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                  <span className="bg-brand-500 dark:bg-brand-300 mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {t(`sections.visibility.items.${item}`)}
                  </span>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </div>

      <section className="to-brand-100/30 dark:to-brand-500/10 mt-8 rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-white/85 via-white/65 px-5 py-6 sm:px-7 sm:py-7 dark:border-white/10 dark:from-white/8 dark:via-white/5">
        <div className="mt-1 flex flex-wrap gap-3">
          <Link
            href={PAGE_ROUTES.LIBRARY}
            className="bg-brand-600 hover:bg-brand-500 focus-visible:ring-brand-400 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-neutral-950"
          >
            {t("cta.library")}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={PAGE_ROUTES.ME}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-neutral-950"
          >
            {t("cta.account")}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </HowToPageShell>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "engagementSignalsHowTo" });
}
