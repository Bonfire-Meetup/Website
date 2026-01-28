import { Link } from "@/i18n/navigation";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { RichText } from "./RichText";

interface CodeOfConductSectionProps {
  t: {
    (key: string): string;
    rich: (
      key: string,
      components: {
        bold?: (chunks: React.ReactNode) => React.ReactNode;
        bullet?: (chunks: React.ReactNode) => React.ReactNode;
      },
    ) => React.ReactNode;
  };
  tToc: (key: string) => string;
}

export function CodeOfConductSection({ t, tToc }: CodeOfConductSectionProps) {
  return (
    <section id="code-of-conduct" className="scroll-mt-24 space-y-6">
      <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
        {tToc("codeOfConduct")}
      </h2>

      <div className="space-y-6">
        <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
          {t("intro")}
        </p>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t("scope.title")}
          </h3>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            {t("scope.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t("community.title")}
          </h3>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            {t("community.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t("rules.title")}
          </h3>
          <RichText t={t} translationKey="rules.content" />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t("consequences.title")}
          </h3>
          <RichText t={t} translationKey="consequences.content" />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t("photos.title")}
          </h3>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            {t("photos.content")}
          </p>
        </div>

        <div className="space-y-4 border-t border-neutral-200 pt-8 dark:border-white/10">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t("contact.title")}
          </h3>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            {t("contact.content")}
          </p>
          <RichText t={t} translationKey="contact.methods" />
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            <a
              href={`mailto:${t("contact.email")}`}
              className="text-brand-600 font-medium hover:underline"
            >
              {t("contact.email")}
            </a>
            <span className="mx-1">{t("contact.orContact")}</span>
            <Link
              href={PAGE_ROUTES.CONTACT_WITH_TYPE("coc")}
              className="text-brand-600 font-medium hover:underline"
            >
              {t("contact.contactLink")}
            </Link>
          </p>
          <p className="leading-relaxed text-neutral-600 italic dark:text-neutral-400">
            {t("contact.closing")}
          </p>
        </div>
      </div>
    </section>
  );
}
