"use client";

import { useTranslations } from "next-intl";

import { GuideCtaSection } from "@/components/how-to/GuideCtaSection";
import { GuideSection } from "@/components/how-to/GuideSection";
import { GuideSectionCard } from "@/components/how-to/GuideSectionCard";
import { GuideStepList } from "@/components/how-to/GuideStepList";
import { HowToPageShell } from "@/components/how-to/HowToPageShell";
import { CalendarIcon, TicketIcon } from "@/components/shared/Icons";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export function EventRsvpContent() {
  const t = useTranslations("eventRsvpHowTo");
  const tHowToPage = useTranslations("howToPage");

  return (
    <HowToPageShell
      allGuidesHref={PAGE_ROUTES.GUIDES}
      allGuidesLabel={tHowToPage("browseAllGuides")}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      heroLead={t("heroLead")}
      heroSublead={t("heroSublead")}
      heroWord="RSVP"
      heroWordClassName="text-[22vw] sm:text-[15vw]"
      subtitle={t("subtitle")}
      contentClassName="max-w-4xl"
    >
      <GuideSectionCard>
        <GuideSection title={t("sections.howItWorks.title")} icon={TicketIcon}>
          <GuideStepList
            items={[
              t("sections.howItWorks.items.one"),
              t("sections.howItWorks.items.two"),
              t("sections.howItWorks.items.three"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.whereToFind.title")}>
          <GuideStepList
            items={[
              t("sections.whereToFind.items.one"),
              t("sections.whereToFind.items.two"),
              t("sections.whereToFind.items.three"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.waitlist.title")}>
          <GuideStepList
            items={[
              t("sections.waitlist.items.one"),
              t("sections.waitlist.items.two"),
              t("sections.waitlist.items.three"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.calendar.title")} icon={CalendarIcon}>
          <GuideStepList
            items={[
              t("sections.calendar.items.one"),
              t("sections.calendar.items.two"),
              t("sections.calendar.items.three"),
            ]}
          />
        </GuideSection>
      </GuideSectionCard>

      <GuideCtaSection
        primary={{ href: PAGE_ROUTES.EVENT_UPCOMING, label: t("cta.upcoming") }}
        secondary={{ href: PAGE_ROUTES.ANCHOR.EVENTS, label: t("cta.homeEvents") }}
      />
    </HowToPageShell>
  );
}
