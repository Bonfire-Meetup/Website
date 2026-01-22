import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { TalkProposalForm } from "@/components/forms/TalkProposalForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WEBSITE_URLS } from "@/lib/config/constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };

  return {
    description: t("talkProposalDescription", commonValues),
    openGraph: {
      description: t("talkProposalDescription", commonValues),
      title: t("talkProposalTitle", commonValues),
      type: "website",
    },
    title: t("talkProposalTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("talkProposalDescription", commonValues),
      title: t("talkProposalTitle", commonValues),
    },
  };
}

export default async function TalkProposalPage() {
  const t = await getTranslations("talkProposalPage");

  return (
    <>
      <Header />
      <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-4 pt-28 pb-8 sm:min-h-[50vh] sm:pb-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15),transparent_60%)]" />
            <div className="absolute top-1/3 left-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.1),transparent_60%)]" />
            <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1),transparent_60%)]" />
          </div>

          <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap select-none">
            <span className="text-outline block text-[12vw] leading-none font-black opacity-[0.03] sm:text-[10vw] dark:opacity-[0.02]">
              SPEAK
            </span>
          </div>

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <p className="text-brand-600 dark:text-brand-300 mb-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.4em] uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em]">
              <span className="to-brand-400 h-px w-8 bg-gradient-to-r from-transparent sm:w-12" />
              {t("eyebrow")}
              <span className="to-brand-400 h-px w-8 bg-gradient-to-l from-transparent sm:w-12" />
            </p>

            <h1 className="mb-6 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
              <span className="block">{t("titlePart1")}</span>
              <span className="text-gradient block">{t("titleHighlight")}</span>
            </h1>

            <p className="mx-auto max-w-xl text-neutral-600 dark:text-neutral-400">
              {t("subtitle")}
            </p>
          </div>
        </section>

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
      <Footer />
    </>
  );
}
