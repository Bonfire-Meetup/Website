"use client";

import { useTranslations } from "next-intl";

import { ContactForm } from "@/components/forms/ContactForm";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { StaticPageHero } from "@/components/layout/StaticPageHero";
import { WEBSITE_URLS } from "@/lib/config/constants";

export function ContactPageContent() {
  const t = useTranslations("contactPage");

  return (
    <>
      <ScrollToTop />
      <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <StaticPageHero
          eyebrow={t("eyebrow")}
          heroWord="CONTACT"
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
