"use client";

import { useTranslations } from "next-intl";

import { GuideCtaSection } from "@/components/how-to/GuideCtaSection";
import { GuideSection } from "@/components/how-to/GuideSection";
import { GuideSectionCard } from "@/components/how-to/GuideSectionCard";
import { GuideStepList } from "@/components/how-to/GuideStepList";
import { HowToPageShell } from "@/components/how-to/HowToPageShell";
import { MicIcon, UsersIcon } from "@/components/shared/Icons";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export function SpeakingContent() {
  const t = useTranslations("speakingHowTo");
  const tHowToPage = useTranslations("howToPage");

  return (
    <HowToPageShell
      allGuidesHref={PAGE_ROUTES.GUIDES}
      allGuidesLabel={tHowToPage("browseAllGuides")}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      heroLead={t("heroLead")}
      heroSublead={t("heroSublead")}
      heroWord="SPEAK"
      subtitle={t("subtitle")}
      contentClassName="max-w-4xl"
    >
      <GuideSectionCard>
        <GuideSection title={t("sections.start.title")} icon={MicIcon}>
          <GuideStepList
            items={[
              t("sections.start.items.one"),
              t("sections.start.items.two"),
              t("sections.start.items.three"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.quality.title")}>
          <GuideStepList
            items={[
              t("sections.quality.items.one"),
              t("sections.quality.items.two"),
              t("sections.quality.items.three"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.review.title")} icon={UsersIcon}>
          <GuideStepList
            items={[
              t("sections.review.items.one"),
              t("sections.review.items.two"),
              t("sections.review.items.three"),
            ]}
          />
        </GuideSection>
      </GuideSectionCard>

      <GuideCtaSection
        title={t("notes.title")}
        description={t("notes.description")}
        primary={{ href: PAGE_ROUTES.SPEAK, label: t("cta.speak") }}
        secondary={{ href: PAGE_ROUTES.CONTACT_WITH_TYPE("crew"), label: t("cta.contact") }}
      />
    </HowToPageShell>
  );
}
