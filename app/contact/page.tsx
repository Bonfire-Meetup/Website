import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/forms/ContactForm";
import { WEBSITE_URLS } from "@/lib/config/constants";

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
    title: t("contactTitle", commonValues),
    description: t("contactDescription", commonValues),
    openGraph: {
      title: t("contactTitle", commonValues),
      description: t("contactDescription", commonValues),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("contactTitle", commonValues),
      description: t("contactDescription", commonValues),
    },
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contactPage");

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
            <span className="text-outline block text-[15vw] font-black leading-none opacity-[0.03] sm:text-[12vw] dark:opacity-[0.02]">
              CONTACT
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
          <ContactForm />

          <div className="mt-16 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("alternativeContact")}{" "}
              <a
                href={`mailto:${WEBSITE_URLS.CONTACT_EMAIL}`}
                className="font-medium text-brand-600 underline decoration-brand-600/30 underline-offset-2 transition-colors hover:text-brand-700 hover:decoration-brand-600 dark:text-brand-400 dark:decoration-brand-400/30 dark:hover:text-brand-300"
              >
                {WEBSITE_URLS.CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
