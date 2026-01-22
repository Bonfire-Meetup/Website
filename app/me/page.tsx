import { getTranslations, getLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MeClient } from "./MeClient";

export default async function MePage() {
  const t = await getTranslations("account");
  const locale = await getLocale();

  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen pt-32 pb-20 px-4">
        <div className="mx-auto max-w-6xl">
          <MeClient
            labels={{
              title: t("title"),
              subtitle: t("subtitle"),
              signOut: t("signOut"),
              loading: t("loading"),
              error: t("error"),
              email: t("email"),
              userId: t("userId"),
              created: t("created"),
              lastLogin: t("lastLogin"),
              empty: t("empty"),
              guildKicker: t("guild.kicker"),
              guildTitle: t("guild.title"),
              guildBody: t("guild.body"),
              guildSoon: t("guild.soon"),
              guildPerks: t.raw("guild.perks") as string[],
              preferencesTitle: t("preferences.title"),
              activityTitle: t("activity.title"),
              boostedTitle: t("boosted.title"),
              boostedEmpty: t("boosted.empty"),
              boostedError: t("boosted.error"),
              boostedRemove: t("boosted.remove"),
              communityEmailsTitle: t("communityEmails.title"),
              communityEmailsBody: t("communityEmails.body"),
              communityEmailsEnabled: t("communityEmails.enabled"),
              communityEmailsDisabled: t("communityEmails.disabled"),
              deleteTitle: t("delete.title"),
              deleteBody: t("delete.body"),
              deleteCodeLabel: t("delete.codeLabel"),
              deleteSendCode: t("delete.sendCode"),
              deleteSendingCode: t("delete.sendingCode"),
              deleteConfirm: t("delete.confirm"),
              deleteConfirming: t("delete.confirming"),
              deleteCancel: t("delete.cancel"),
              deleteStatus: t("delete.status"),
              deleteError: t("delete.error"),
              deleteInvalid: t("delete.invalid"),
              deleteExpired: t("delete.expired"),
              deleteTooManyAttempts: t("delete.tooManyAttempts"),
              deleteStepIntent: t("delete.steps.intent"),
              deleteStepSend: t("delete.steps.send"),
              deleteStepVerify: t("delete.steps.verify"),
              deleteIntentLabel: t("delete.intentLabel"),
              deleteIntentRequired: t("delete.intentRequired"),
              deleteProceed: t("delete.proceed"),
              deleteSendIntro: t("delete.sendIntro"),
              deleteCompleted: t("delete.completed"),
              dangerZone: t("delete.dangerZone"),
              attemptsTitle: t("attempts.title"),
              attemptsEmpty: t("attempts.empty"),
              attemptsError: t("attempts.error"),
              attemptsOutcomes: {
                success: t("attempts.outcomes.success"),
                expired: t("attempts.outcomes.expired"),
                max_attempts: t("attempts.outcomes.maxAttempts"),
                mismatch: t("attempts.outcomes.invalidCode"),
                missing: t("attempts.outcomes.invalidCode"),
                used: t("attempts.outcomes.invalidCode"),
                rate_limited: t("attempts.outcomes.rateLimited"),
                user_failed: t("attempts.outcomes.error"),
              },
              supportTitle: t("support.title"),
              supportFeatureRequest: t("support.featureRequest"),
              supportTechnicalIssue: t("support.technicalIssue"),
              copySuccess: t("copySuccess"),
              copyError: t("copyError"),
              copyIdLabel: t("copyIdLabel"),
              locale,
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
