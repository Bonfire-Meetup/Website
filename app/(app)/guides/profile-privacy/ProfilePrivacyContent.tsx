"use client";

import { useTranslations } from "next-intl";

import { GuideCtaSection } from "@/components/guides/GuideCtaSection";
import { GuidePageShell } from "@/components/guides/GuidePageShell";
import { GuideSection } from "@/components/guides/GuideSection";
import { GuideSectionCard } from "@/components/guides/GuideSectionCard";
import { GuideStepList } from "@/components/guides/GuideStepList";
import { ShieldIcon, UserIcon } from "@/components/shared/Icons";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export function ProfilePrivacyContent() {
  const t = useTranslations("profilePrivacyGuide");
  const tGuidesPage = useTranslations("guidesPage");

  return (
    <GuidePageShell
      allGuidesHref={PAGE_ROUTES.GUIDES}
      allGuidesLabel={tGuidesPage("browseAllGuides")}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      heroLead={t("heroLead")}
      heroSublead={t("heroSublead")}
      heroWord="PRIVACY"
      heroWordClassName="text-[16vw] sm:text-[12vw]"
      subtitle={t("subtitle")}
      contentClassName="max-w-4xl"
    >
      <GuideSectionCard>
        <GuideSection title={t("sections.visibility.title")} icon={UserIcon}>
          <GuideStepList
            items={[
              t("sections.visibility.items.one"),
              t("sections.visibility.items.two"),
              t("sections.visibility.items.three"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.checkins.title")}>
          <GuideStepList
            items={[
              t("sections.checkins.items.one"),
              t("sections.checkins.items.two"),
              t("sections.checkins.items.three"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.controls.title")} icon={ShieldIcon}>
          <GuideStepList
            items={[
              t("sections.controls.items.one"),
              t("sections.controls.items.two"),
              t("sections.controls.items.three"),
            ]}
          />
        </GuideSection>
      </GuideSectionCard>

      <GuideCtaSection
        title={t("notes.title")}
        description={t("notes.description")}
        primary={{ href: PAGE_ROUTES.ME, label: t("cta.account") }}
        secondary={{ href: PAGE_ROUTES.GUIDES_CHECK_IN, label: t("cta.checkInGuide") }}
      />
    </GuidePageShell>
  );
}
