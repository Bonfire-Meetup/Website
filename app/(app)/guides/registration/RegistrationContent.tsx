"use client";

import { useTranslations } from "next-intl";

import { GuideCtaSection } from "@/components/how-to/GuideCtaSection";
import { GuideSection } from "@/components/how-to/GuideSection";
import { GuideSectionCard } from "@/components/how-to/GuideSectionCard";
import { GuideStepList } from "@/components/how-to/GuideStepList";
import { HowToPageShell } from "@/components/how-to/HowToPageShell";
import { FingerprintIcon, MailIcon, ShieldIcon, UserIcon } from "@/components/shared/Icons";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export function RegistrationContent() {
  const t = useTranslations("registrationHowTo");
  const tHowToPage = useTranslations("howToPage");

  return (
    <HowToPageShell
      allGuidesHref={PAGE_ROUTES.GUIDES}
      allGuidesLabel={tHowToPage("browseAllGuides")}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      heroLead={t("heroLead")}
      heroSublead={t("heroSublead")}
      heroWord="SIGN-IN"
      subtitle={t("subtitle")}
      contentClassName="max-w-4xl"
    >
      <GuideSectionCard>
        <GuideSection title={t("sections.emailCode.title")} icon={MailIcon}>
          <GuideStepList
            items={[
              t("sections.emailCode.items.one"),
              t("sections.emailCode.items.two"),
              t("sections.emailCode.items.three"),
              t("sections.emailCode.items.four"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.registration.title")} icon={UserIcon}>
          <GuideStepList
            items={[
              t("sections.registration.items.one"),
              t("sections.registration.items.two"),
              t("sections.registration.items.three"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.passkeys.title")} icon={FingerprintIcon}>
          <GuideStepList
            items={[
              t("sections.passkeys.items.one"),
              t("sections.passkeys.items.two"),
              t("sections.passkeys.items.three"),
            ]}
          />

          <div className="mt-6 rounded-2xl border border-emerald-300/35 bg-emerald-50/70 p-4 dark:border-emerald-300/20 dark:bg-emerald-500/10">
            <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-neutral-900 dark:text-white">
              <ShieldIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              {t("sections.passkeys.safety.title")}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {t("sections.passkeys.safety.description")}
            </p>
            <ul className="mt-3 space-y-2">
              {(["one", "two", "three"] as const).map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-300" />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {t(`sections.passkeys.safety.items.${item}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </GuideSection>
      </GuideSectionCard>

      <GuideCtaSection
        title={t("notes.title")}
        description={t("notes.description")}
        primary={{ href: PAGE_ROUTES.LOGIN, label: t("cta.login") }}
        secondary={{ href: PAGE_ROUTES.ME, label: t("cta.account") }}
      />
    </HowToPageShell>
  );
}
