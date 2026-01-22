import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { TalkProposalForm } from "../components/forms/TalkProposalForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
  const commonValues = {
    brandName: tCommon("brandName"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
    country: tCommon("country"),
  };
  return {
    title: t("talkProposalTitle", commonValues),
    description: t("talkProposalDescription", commonValues),
    openGraph: {
      title: t("talkProposalTitle", commonValues),
      description: t("talkProposalDescription", commonValues),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("talkProposalTitle", commonValues),
      description: t("talkProposalDescription", commonValues),
    },
  };
}

export default async function TalkProposalPage() {
  const t = await getTranslations("talkProposalPage");
  const tCommon = await getTranslations("common");

  const formTranslations = {
    form: {
      title: t("form.title"),
      subtitle: t("form.subtitle"),
      speakerName: t("form.speakerName"),
      speakerNamePlaceholder: t("form.speakerNamePlaceholder"),
      email: t("form.email"),
      emailPlaceholder: t("form.emailPlaceholder"),
      talkTitle: t("form.talkTitle"),
      talkTitlePlaceholder: t("form.talkTitlePlaceholder"),
      abstract: t("form.abstract"),
      abstractPlaceholder: t("form.abstractPlaceholder"),
      abstractHint: t("form.abstractHint"),
      duration: t("form.duration"),
      durationPlaceholder: t("form.durationPlaceholder"),
      duration15: t("form.duration15"),
      duration30: t("form.duration30"),
      duration45: t("form.duration45"),
      preferredLocation: t("form.preferredLocation"),
      locationEither: t("form.locationEither", {
        prague: tCommon("prague"),
        zlin: tCommon("zlin"),
      }),
      locationPrague: tCommon("prague"),
      locationZlin: tCommon("zlin"),
      experience: t("form.experience"),
      experiencePlaceholder: t("form.experiencePlaceholder"),
      experienceHint: t("form.experienceHint"),
      submit: t("form.submit"),
      submitting: t("form.submitting"),
      successTitle: t("form.successTitle"),
      successMessage: t("form.successMessage"),
      submitAnother: t("form.submitAnother"),
      errors: {
        nameRequired: t("form.errors.nameRequired"),
        emailInvalid: t("form.errors.emailInvalid"),
        titleRequired: t("form.errors.titleRequired"),
        abstractRequired: t("form.errors.abstractRequired"),
        durationRequired: t("form.errors.durationRequired"),
        rateLimited: t("form.errors.rateLimited"),
        captchaFailed: t("form.errors.captchaFailed"),
        botBlocked: t("form.errors.botBlocked"),
        csrfInvalid: t("form.errors.csrfInvalid"),
        generic: t("form.errors.generic"),
      },
    },
  };

  return (
    <>
      <Header />
      <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-4 pb-8 pt-28 sm:min-h-[50vh] sm:pb-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15),transparent_60%)]" />
            <div className="absolute left-0 top-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.1),transparent_60%)]" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1),transparent_60%)]" />
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap">
            <span className="text-outline block text-[12vw] font-black leading-none opacity-[0.03] sm:text-[10vw] dark:opacity-[0.02]">
              SPEAK
            </span>
          </div>

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <p className="mb-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.4em] text-brand-600 sm:gap-3 sm:text-sm sm:tracking-[0.5em] dark:text-brand-300">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-brand-400 sm:w-12" />
              {t("eyebrow")}
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-brand-400 sm:w-12" />
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
          <TalkProposalForm t={formTranslations} />

          <section className="mx-auto mt-16 max-w-2xl">
            <div className="rounded-2xl border border-brand-500/10 bg-gradient-to-br from-brand-500/5 via-transparent to-rose-500/5 p-6 sm:p-8">
              <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                {t("whatWeLookFor.title")}
              </h3>
              <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {t("whatWeLookFor.item1")}
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {t("whatWeLookFor.item2")}
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {t("whatWeLookFor.item3")}
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {t("whatWeLookFor.item4")}
                </li>
              </ul>
            </div>
          </section>

          <div className="mt-12 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("questions")}{" "}
              <a
                href="mailto:hello+proposal@bnf.events"
                className="font-medium text-brand-600 underline decoration-brand-600/30 underline-offset-2 transition-colors hover:text-brand-700 hover:decoration-brand-600 dark:text-brand-400 dark:decoration-brand-400/30 dark:hover:text-brand-300"
              >
                hello+proposal@bnf.events
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
