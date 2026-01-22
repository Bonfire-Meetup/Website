import { RichText } from "./RichText";

type PrivacyPolicySectionProps = {
  tPrivacy: {
    (key: string, values?: { date?: string }): string;
    rich: (
      key: string,
      components: {
        bold?: (chunks: React.ReactNode) => React.ReactNode;
        bullet?: (chunks: React.ReactNode) => React.ReactNode;
      },
    ) => React.ReactNode;
  };
  currentDate: string;
};

export function PrivacyPolicySection({
  tPrivacy,
  currentDate,
}: PrivacyPolicySectionProps) {
  return (
    <section
      id="privacy-policy"
      className="scroll-mt-24 pt-12 border-t border-neutral-200 dark:border-white/10 space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
          {tPrivacy("title")}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          {tPrivacy("lastUpdated", { date: currentDate })}
        </p>
      </div>

      <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
        {tPrivacy("intro")}
      </p>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("controller.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tPrivacy("controller.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("dataCollection.title")}
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {tPrivacy("dataCollection.personal.title")}
              </h4>
              <RichText
                t={tPrivacy}
                translationKey="dataCollection.personal.content"
              />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {tPrivacy("dataCollection.technical.title")}
              </h4>
              <RichText
                t={tPrivacy}
                translationKey="dataCollection.technical.content"
              />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {tPrivacy("dataCollection.interactions.title")}
              </h4>
              <RichText
                t={tPrivacy}
                translationKey="dataCollection.interactions.content"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("howWeUse.title")}
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {tPrivacy("howWeUse.authentication.title")}
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {tPrivacy("howWeUse.authentication.content")}
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {tPrivacy("howWeUse.communication.title")}
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {tPrivacy("howWeUse.communication.content")}
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {tPrivacy("howWeUse.analytics.title")}
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {tPrivacy("howWeUse.analytics.content")}
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {tPrivacy("howWeUse.security.title")}
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {tPrivacy("howWeUse.security.content")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("legalBasis.title")}
          </h3>
          <RichText t={tPrivacy} translationKey="legalBasis.content" />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("dataSharing.title")}
          </h3>
          <RichText t={tPrivacy} translationKey="dataSharing.content" />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("dataStorage.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tPrivacy("dataStorage.location")}
          </p>
          <div>
            <h4 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              {tPrivacy("dataStorage.retention.title")}
            </h4>
            <RichText
              t={tPrivacy}
              translationKey="dataStorage.retention.content"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("yourRights.title")}
          </h3>
          <RichText t={tPrivacy} translationKey="yourRights.content" />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("cookies.title")}
          </h3>
          <RichText t={tPrivacy} translationKey="cookies.content" />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("security.title")}
          </h3>
          <RichText t={tPrivacy} translationKey="security.content" />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("internationalTransfers.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tPrivacy("internationalTransfers.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("children.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tPrivacy("children.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("changes.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tPrivacy("changes.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("contactPrivacy.title")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tPrivacy("contactPrivacy.content")}
          </p>
        </div>
      </div>
    </section>
  );
}
