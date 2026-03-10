"use client";

import { useTranslations } from "next-intl";

import { TalkProposalForm } from "@/components/forms/TalkProposalForm";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { StaticPageHero } from "@/components/layout/StaticPageHero";
import { SparklesIcon } from "@/components/shared/Icons";
import { WEBSITE_URLS } from "@/lib/config/constants";

export function SpeakPageContent() {
  const t = useTranslations("talkProposalPage");

  return (
    <>
      <ScrollToTop />
      <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <StaticPageHero
          eyebrow={t("eyebrow")}
          heroWord="SPEAK"
          heroWordSize="sm"
          subtitle={t("subtitle")}
          subtitleClassName="mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400"
          title={
            <h1 className="mb-4 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
              <span className="block">{t("titlePart1")}</span>
              <span className="text-gradient-static block">{t("titleHighlight")}</span>
              <span className="mt-2 block text-lg font-semibold tracking-normal text-balance text-neutral-700 sm:text-xl dark:text-neutral-200">
                {t("titlePart2")}
              </span>
            </h1>
          }
        />

        <div className="relative mx-auto max-w-4xl px-4 pb-20 sm:pb-24">
          <TalkProposalForm />

          <section className="mt-8 rounded-3xl border border-orange-200/60 bg-gradient-to-r from-orange-50 via-rose-50 to-white px-5 py-6 shadow-[0_24px_60px_-42px_rgba(249,115,22,0.28)] sm:mt-10 sm:px-6 sm:py-7 dark:border-orange-300/10 dark:from-orange-500/12 dark:via-rose-500/10 dark:to-white/4 dark:shadow-[0_24px_60px_-42px_rgba(0,0,0,0.45)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500 text-white shadow-[0_18px_34px_-20px_rgba(244,63,94,0.35)]">
                <SparklesIcon className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold tracking-[0.3em] text-neutral-500 uppercase dark:text-neutral-400">
                {t("encouragement.eyebrow")}
              </p>
            </div>
            <h3 className="mt-3 max-w-2xl text-xl font-black tracking-tight text-neutral-900 sm:text-[2rem] dark:text-white">
              {t("encouragement.title")}
            </h3>
            <div className="mt-4 max-w-xl space-y-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              <p>{t("encouragement.body1")}</p>
              <p>{t("encouragement.body2")}</p>
            </div>
          </section>

          <div className="mt-12 text-center sm:mt-14">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("questions")}{" "}
              <a
                href={`mailto:${WEBSITE_URLS.CONTACT_EMAIL_PROPOSAL}`}
                className="text-brand-600 decoration-brand-600/30 hover:text-brand-700 hover:decoration-brand-600 dark:text-brand-400 dark:decoration-brand-400/30 dark:hover:text-brand-300 font-medium underline underline-offset-2 transition-colors"
              >
                {WEBSITE_URLS.CONTACT_EMAIL_PROPOSAL}
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
