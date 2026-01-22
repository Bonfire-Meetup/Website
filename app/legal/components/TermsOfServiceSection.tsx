import { RichText } from "./RichText";

type TermsOfServiceSectionProps = {
  tTerms: {
    (key: string, values?: { date?: string }): string;
    rich: (
      key: string,
      components: {
        bullet?: (chunks: React.ReactNode) => React.ReactNode;
      },
    ) => React.ReactNode;
  };
  currentDate: string;
};

export function TermsOfServiceSection({ tTerms, currentDate }: TermsOfServiceSectionProps) {
  return (
    <section
      id="terms-of-service"
      className="scroll-mt-24 pt-12 border-t border-neutral-200 dark:border-white/10 space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">{tTerms("title")}</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          {tTerms("lastUpdated", { date: currentDate })}
        </p>
      </div>

      <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
        {tTerms("intro")}
      </p>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("acceptance.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tTerms("acceptance.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("service.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tTerms("service.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("accounts.title")}
          </h3>
          <RichText t={tTerms} translationKey="accounts.content" />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("userConduct.title")}
          </h3>
          <RichText t={tTerms} translationKey="userConduct.content" />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("intellectualProperty.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tTerms("intellectualProperty.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("userContent.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tTerms("userContent.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("availability.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tTerms("availability.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("liability.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tTerms("liability.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("indemnification.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tTerms("indemnification.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("termination.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tTerms("termination.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("governingLaw.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tTerms("governingLaw.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("disputes.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tTerms("disputes.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("changes.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tTerms("changes.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tTerms("contactTerms.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tTerms("contactTerms.content")}
          </p>
        </div>
      </div>
    </section>
  );
}
