"use client";

import { useTranslations } from "next-intl";

import { GuideCtaSection } from "@/components/guides/GuideCtaSection";
import { GuidePageShell } from "@/components/guides/GuidePageShell";
import { GuideSection } from "@/components/guides/GuideSection";
import { GuideSectionCard } from "@/components/guides/GuideSectionCard";
import { GuideStepList } from "@/components/guides/GuideStepList";
import {
  BadgeCheckIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  CloseIcon,
  InfoIcon,
  QrCodeIcon,
  TicketIcon,
} from "@/components/shared/Icons";
import { PAGE_ROUTES } from "@/lib/routes/pages";

const RESULT_STATUSES = [
  {
    key: "valid",
    icon: CheckCircleIcon,
    borderClass: "border-emerald-300/40 dark:border-emerald-300/20",
    bgClass: "bg-emerald-50/70 dark:bg-emerald-500/10",
    iconClass: "text-emerald-600 dark:text-emerald-300",
    labelClass: "text-emerald-700 dark:text-emerald-300",
  },
  {
    key: "alreadyCheckedIn",
    icon: BadgeCheckIcon,
    borderClass: "border-blue-300/40 dark:border-blue-300/20",
    bgClass: "bg-blue-50/70 dark:bg-blue-500/10",
    iconClass: "text-blue-600 dark:text-blue-300",
    labelClass: "text-blue-700 dark:text-blue-300",
  },
  {
    key: "expired",
    icon: ClockIcon,
    borderClass: "border-amber-300/40 dark:border-amber-300/20",
    bgClass: "bg-amber-50/70 dark:bg-amber-500/10",
    iconClass: "text-amber-600 dark:text-amber-300",
    labelClass: "text-amber-700 dark:text-amber-300",
  },
  {
    key: "invalid",
    icon: CloseIcon,
    borderClass: "border-red-300/40 dark:border-red-300/20",
    bgClass: "bg-red-50/70 dark:bg-red-500/10",
    iconClass: "text-red-600 dark:text-red-300",
    labelClass: "text-red-700 dark:text-red-300",
  },
] as const;

export function TicketScanningContent() {
  const t = useTranslations("ticketScanningGuide");
  const tGuidesPage = useTranslations("guidesPage");

  return (
    <GuidePageShell
      allGuidesHref={PAGE_ROUTES.GUIDES}
      allGuidesLabel={tGuidesPage("browseAllGuides")}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      heroLead={t("heroLead")}
      heroSublead={t("heroSublead")}
      heroWord="SCAN"
      subtitle={t("subtitle")}
      contentClassName="max-w-4xl"
    >
      <GuideSectionCard>
        <GuideSection title={t("sections.qrScan.title")} icon={QrCodeIcon}>
          <GuideStepList
            items={[
              t("sections.qrScan.items.one"),
              t("sections.qrScan.items.two"),
              t("sections.qrScan.items.three"),
              t("sections.qrScan.items.four"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.backupId.title")} icon={TicketIcon}>
          <p className="mb-3 text-neutral-700 dark:text-neutral-300">
            {t("sections.backupId.description")}
          </p>
          <GuideStepList
            items={[
              t("sections.backupId.items.one"),
              t("sections.backupId.items.two"),
              t("sections.backupId.items.three"),
              t("sections.backupId.items.four"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.camera.title")} icon={CameraIcon}>
          <GuideStepList
            items={[
              t("sections.camera.items.one"),
              t("sections.camera.items.two"),
              t("sections.camera.items.three"),
            ]}
          />
        </GuideSection>

        <GuideSection title={t("sections.results.title")} icon={InfoIcon}>
          <div className="grid gap-3 sm:grid-cols-2">
            {RESULT_STATUSES.map((status) => {
              const StatusIcon = status.icon;
              return (
                <div
                  key={status.key}
                  className={`rounded-xl border p-3.5 ${status.borderClass} ${status.bgClass}`}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${status.iconClass}`} aria-hidden="true" />
                    <span className={`text-sm font-bold ${status.labelClass}`}>
                      {t(`sections.results.${status.key}.label`)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {t(`sections.results.${status.key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </GuideSection>
      </GuideSectionCard>

      <GuideCtaSection
        title={t("notes.title")}
        description={t("notes.description")}
        primary={{ href: PAGE_ROUTES.EVENT_READER, label: t("cta.reader") }}
        secondary={{ href: PAGE_ROUTES.GUIDES_CHECK_IN, label: t("cta.checkInGuide") }}
      />
    </GuidePageShell>
  );
}
