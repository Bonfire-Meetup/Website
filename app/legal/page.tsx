import { getTranslations, getLocale } from "next-intl/server";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import type { Metadata } from "next";
import { TableOfContents } from "./components/TableOfContents";
import { CodeOfConductSection } from "./components/CodeOfConductSection";
import { PrivacyPolicySection } from "./components/PrivacyPolicySection";
import { TermsOfServiceSection } from "./components/TermsOfServiceSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function LegalPage() {
  const t = await getTranslations("legal");
  const tPrivacy = await getTranslations("legal.privacy");
  const tTerms = await getTranslations("legal.terms");
  const tToc = await getTranslations("legal.toc");
  const locale = await getLocale();

  const currentDate = new Date().toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen pt-32 pb-20 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl dark:text-white mb-4">
              {t("title")}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">{t("subtitle")}</p>
          </div>

          <div className="glass-card no-hover-pop p-8 sm:p-12 space-y-12">
            <TableOfContents tToc={tToc} />
            <CodeOfConductSection t={t} tToc={tToc} />
            <PrivacyPolicySection tPrivacy={tPrivacy} currentDate={currentDate} />
            <TermsOfServiceSection tTerms={tTerms} currentDate={currentDate} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
