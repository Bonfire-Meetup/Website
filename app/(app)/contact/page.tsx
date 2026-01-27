import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ContactForm } from "@/components/forms/ContactForm";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { WEBSITE_URLS } from "@/lib/config/constants";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations({ locale, namespace: "meta" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };

  return {
    description: t("contactDescription", commonValues),
    openGraph: {
      description: t("contactDescription", commonValues),
      title: t("contactTitle", commonValues),
      type: "website",
    },
    title: t("contactTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("contactDescription", commonValues),
      title: t("contactTitle", commonValues),
    },
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contactPage");

  return (
    <>
      <ScrollToTop />
      <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-4 pt-32 pb-14 sm:min-h-[65vh] sm:pb-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-1),transparent_60%)]" />
            <div className="absolute top-1/3 left-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-2),transparent_60%)]" />
            <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,var(--color-rose-glow),transparent_60%)]" />
          </div>

          <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap select-none">
            <span className="text-outline block text-[15vw] leading-none font-black opacity-[0.03] sm:text-[12vw] dark:opacity-[0.02]">
              CONTACT
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
              <span className="text-gradient-static block">{t("titleHighlight")}</span>
            </h1>

            <p className="mx-auto max-w-xl text-neutral-600 dark:text-neutral-400">
              {t("subtitle")}
            </p>
          </div>
        </section>

        <div className="relative mx-auto max-w-4xl px-4 pb-24">
          <ContactForm />

          <div className="mt-16 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("alternativeContact")}{" "}
              <a
                href={`mailto:${WEBSITE_URLS.CONTACT_EMAIL}`}
                className="text-brand-600 decoration-brand-600/30 hover:text-brand-700 hover:decoration-brand-600 dark:text-brand-400 dark:decoration-brand-400/30 dark:hover:text-brand-300 font-medium underline underline-offset-2 transition-colors"
              >
                {WEBSITE_URLS.CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
