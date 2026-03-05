"use client";

import { useTranslations } from "next-intl";

import { TalkProposalForm } from "@/components/forms/TalkProposalForm";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { StaticPageHero } from "@/components/layout/StaticPageHero";
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
          subtitleClassName="mx-auto max-w-xl text-neutral-600 dark:text-neutral-400"
          title={
            <h1 className="mb-6 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
              <span className="block">{t("titlePart1")}</span>
              <span className="text-gradient-static block">{t("titleHighlight")}</span>
            </h1>
          }
        />

        <div className="relative mx-auto max-w-4xl px-4 pb-24">
          <TalkProposalForm />

          <section className="mx-auto mt-16 max-w-2xl">
            <div className="border-brand-500/10 from-brand-500/5 rounded-2xl border bg-gradient-to-br via-transparent to-rose-500/5 p-6 sm:p-8">
              <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                {t("whatWeLookFor.title")}
              </h3>
              <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start gap-3">
                  <span className="bg-brand-500 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                  {t("whatWeLookFor.item1")}
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-brand-500 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                  {t("whatWeLookFor.item2")}
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-brand-500 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                  {t("whatWeLookFor.item3")}
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-brand-500 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                  {t("whatWeLookFor.item4")}
                </li>
              </ul>
            </div>
          </section>

          <div className="mt-12 text-center">
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
