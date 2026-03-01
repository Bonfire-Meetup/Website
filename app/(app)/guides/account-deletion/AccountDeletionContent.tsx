"use client";

import { useTranslations } from "next-intl";

import { GuideCtaSection } from "@/components/how-to/GuideCtaSection";
import { GuideSection } from "@/components/how-to/GuideSection";
import { GuideSectionCard } from "@/components/how-to/GuideSectionCard";
import { GuideStepList } from "@/components/how-to/GuideStepList";
import { HowToPageShell } from "@/components/how-to/HowToPageShell";
import { MailIcon, TrashIcon } from "@/components/shared/Icons";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export function AccountDeletionContent() {
  const t = useTranslations("accountDeletionHowTo");
  const tHowToPage = useTranslations("howToPage");

  return (
    <HowToPageShell
      allGuidesHref={PAGE_ROUTES.GUIDES}
      allGuidesLabel={tHowToPage("browseAllGuides")}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      heroLead={t("heroLead")}
      heroSublead={t("heroSublead")}
      heroWord="DELETE"
      subtitle={t("subtitle")}
      contentClassName="max-w-4xl"
    >
      <GuideSectionCard>
        <GuideSection title={t("sections.flow.title")} icon={TrashIcon}>
          <GuideStepList
            items={[
              t("sections.flow.items.one"),
              t("sections.flow.items.two"),
              t("sections.flow.items.three"),
              t("sections.flow.items.four"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.code.title")} icon={MailIcon}>
          <GuideStepList
            items={[
              t("sections.code.items.one"),
              t("sections.code.items.two"),
              t("sections.code.items.three"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.warning.title")}>
          <GuideStepList
            variant="rose-dot"
            items={[
              t("sections.warning.items.one"),
              t("sections.warning.items.two"),
              t("sections.warning.items.three"),
            ]}
          />
        </GuideSection>
      </GuideSectionCard>

      <GuideCtaSection
        variant="rose"
        primary={{ href: PAGE_ROUTES.ME, label: t("cta.account") }}
        secondary={{ href: PAGE_ROUTES.LOGIN, label: t("cta.login") }}
      />
    </HowToPageShell>
  );
}
