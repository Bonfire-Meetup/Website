import { getTranslations } from "next-intl/server";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function LegalPage() {
  const t = await getTranslations("legal");

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
            <section>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                {t("intro")}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {t("scope.title")}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t("scope.content")}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {t("community.title")}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t("community.content")}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {t("rules.title")}
              </h2>
              <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-2">
                {t.rich("rules.content", {
                  bold: (chunks) => (
                    <strong className="text-neutral-900 dark:text-white">{chunks}</strong>
                  ),
                  bullet: (chunks) => (
                    <div className="flex gap-2">
                      <span>•</span>
                      <div>{chunks}</div>
                    </div>
                  ),
                })}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {t("consequences.title")}
              </h2>
              <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-2">
                {t.rich("consequences.content", {
                  bullet: (chunks) => (
                    <div className="flex gap-2">
                      <span>•</span>
                      <div>{chunks}</div>
                    </div>
                  ),
                })}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {t("photos.title")}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t("photos.content")}
              </p>
            </section>

            <section className="pt-8 border-t border-neutral-200 dark:border-white/10 space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {t("contact.title")}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t("contact.content")}
              </p>
              <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-2">
                {t.rich("contact.methods", {
                  bullet: (chunks) => (
                    <div className="flex gap-2">
                      <span>•</span>
                      <div>{chunks}</div>
                    </div>
                  ),
                })}
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <a
                  href={`mailto:${t("contact.email")}`}
                  className="font-medium text-brand-600 hover:underline"
                >
                  {t("contact.email")}
                </a>
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                {t("contact.closing")}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
