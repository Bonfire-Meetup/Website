import { ResetCookieBannerButton } from "./ResetCookieBannerButton";
import { RichText } from "./RichText";

interface PrivacyPolicySectionProps {
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
}

export function PrivacyPolicySection({ tPrivacy, currentDate }: PrivacyPolicySectionProps) {
  return (
    <section
      id="privacy-policy"
      className="scroll-mt-24 space-y-6 border-t border-neutral-200 pt-12 dark:border-white/10"
    >
      <div>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">{tPrivacy("title")}</h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
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
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            {tPrivacy("controller.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("dataCollection.title")}
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                {tPrivacy("dataCollection.personal.title")}
              </h4>
              <RichText t={tPrivacy} translationKey="dataCollection.personal.content" />
            </div>
            <div>
              <h4 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                {tPrivacy("dataCollection.technical.title")}
              </h4>
              <RichText t={tPrivacy} translationKey="dataCollection.technical.content" />
            </div>
            <div>
              <h4 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                {tPrivacy("dataCollection.interactions.title")}
              </h4>
              <RichText t={tPrivacy} translationKey="dataCollection.interactions.content" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("howWeUse.title")}
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                {tPrivacy("howWeUse.authentication.title")}
              </h4>
              <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
                {tPrivacy("howWeUse.authentication.content")}
              </p>
            </div>
            <div>
              <h4 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                {tPrivacy("howWeUse.communication.title")}
              </h4>
              <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
                {tPrivacy("howWeUse.communication.content")}
              </p>
            </div>
            <div>
              <h4 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                {tPrivacy("howWeUse.analytics.title")}
              </h4>
              <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
                {tPrivacy("howWeUse.analytics.content")}
              </p>
            </div>
            <div>
              <h4 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                {tPrivacy("howWeUse.security.title")}
              </h4>
              <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
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
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            {tPrivacy("dataStorage.location")}
          </p>
          <div>
            <h4 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
              {tPrivacy("dataStorage.retention.title")}
            </h4>
            <RichText t={tPrivacy} translationKey="dataStorage.retention.content" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("yourRights.title")}
          </h3>
          <RichText t={tPrivacy} translationKey="yourRights.content" />
        </div>

        <div id="cookies" className="scroll-mt-24 space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("cookies.title")}
          </h3>
          <RichText t={tPrivacy} translationKey="cookies.content" />
          <ResetCookieBannerButton />
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
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            {tPrivacy("internationalTransfers.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("children.title")}
          </h3>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            {tPrivacy("children.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("changes.title")}
          </h3>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            {tPrivacy("changes.content")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {tPrivacy("contactPrivacy.title")}
          </h3>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            {tPrivacy("contactPrivacy.content")}
          </p>
        </div>
      </div>
    </section>
  );
}
