import { RichText } from "./RichText";

type CodeOfConductSectionProps = {
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
  tToc: {
    (key: string): string;
  };
};

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
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t("scope.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t("community.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
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
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t("photos.content")}
          </p>
        </div>

        <div className="pt-8 border-t border-neutral-200 dark:border-white/10 space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t("contact.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t("contact.content")}
          </p>
          <RichText t={t} translationKey="contact.methods" />
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <a
              href={`mailto:${t("contact.email")}`}
              className="font-medium text-brand-600 hover:underline"
            >
              {t("contact.email")}
            </a>
            <span className="mx-1">{t("contact.orContact")}</span>
            <a href="/contact?type=coc" className="font-medium text-brand-600 hover:underline">
              {t("contact.contactLink")}
            </a>
          </p>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
            {t("contact.closing")}
          </p>
        </div>
      </div>
    </section>
  );
}
