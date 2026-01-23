import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { BoltIcon, FireIcon } from "@/components/shared/icons";

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
    description: t("faqDescription", commonValues),
    openGraph: {
      description: t("faqDescription", commonValues),
      title: t("faqTitle", commonValues),
      type: "website",
    },
    title: t("faqTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("faqDescription", commonValues),
      title: t("faqTitle", commonValues),
    },
  };
}

export default async function FaqPage() {
  const t = await getTranslations("faqPage");
  const tRecordings = await getTranslations("recordings");

  return (
    <>
      <Header />
      <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden px-4 pt-32 pb-14 sm:min-h-[66vh] sm:pb-18">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_62%)]" />
            <div className="absolute top-28 right-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.18),transparent_62%)]" />
            <div className="absolute bottom-10 left-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.10),transparent_65%)]" />
          </div>

          <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap select-none">
            <span className="text-outline block text-[15vw] leading-none font-black opacity-[0.03] sm:text-[11vw] dark:opacity-[0.02]">
              FAQ
            </span>
          </div>

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <p className="mb-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.4em] uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em]">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-emerald-400 sm:w-12" />
              {t("eyebrow")}
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-orange-400 sm:w-12" />
            </p>

            <h1 className="mb-5 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
              {t("title")}
            </h1>

            <p className="mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400">
              {t("subtitle")}
            </p>
          </div>
        </section>

        <section className="relative mx-auto max-w-4xl px-4 pb-24">
          <div className="grid gap-6">
            <div className="rounded-3xl border border-neutral-200/70 bg-white/70 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                  {t("sparks.title")}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                  <FireIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {tRecordings("spark")}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {t("sparks.body")}
              </p>
              <div className="mt-4 rounded-2xl border border-neutral-200/60 bg-neutral-50/70 px-4 py-3 text-sm text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                <div className="font-semibold text-neutral-900 dark:text-white">
                  {t("impact.title")}
                </div>
                <div className="mt-1">{t("sparks.impact")}</div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200/70 bg-white/70 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                  {t("boosts.title")}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <BoltIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {tRecordings("boost")}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {t("boosts.body")}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200/60 bg-neutral-50/70 px-4 py-3 text-sm text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    {t("impact.title")}
                  </div>
                  <div className="mt-1">{t("boosts.impact")}</div>
                </div>
                <div className="rounded-2xl border border-neutral-200/60 bg-neutral-50/70 px-4 py-3 text-sm text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    {t("boosts.limitsTitle")}
                  </div>
                  <div className="mt-1">{t("boosts.limits")}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
