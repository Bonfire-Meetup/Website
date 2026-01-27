import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getRequestLocale } from "@/lib/i18n/request-locale";

import { CodeOfConductSection } from "./components/CodeOfConductSection";
import { PrivacyPolicySection } from "./components/PrivacyPolicySection";
import { TableOfContents } from "./components/TableOfContents";
import { TermsOfServiceSection } from "./components/TermsOfServiceSection";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations({ locale, namespace: "legal" });

  return {
    description: t("subtitle"),
    title: t("title"),
  };
}

export default async function LegalPage() {
  const t = await getTranslations("legal");
  const tPrivacy = await getTranslations("legal.privacy");
  const tTerms = await getTranslations("legal.terms");
  const tToc = await getTranslations("legal.toc");
  const locale = await getRequestLocale();

  const currentDate = new Date().toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="gradient-bg min-h-screen px-4 pt-32 pb-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
            {t("title")}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">{t("subtitle")}</p>
        </div>

        <div className="glass-card no-hover-pop space-y-12 p-8 sm:p-12">
          <TableOfContents tToc={tToc} />
          <CodeOfConductSection t={t} tToc={tToc} />
          <PrivacyPolicySection tPrivacy={tPrivacy} currentDate={currentDate} />
          <TermsOfServiceSection tTerms={tTerms} currentDate={currentDate} />
        </div>
      </div>
    </main>
  );
}
