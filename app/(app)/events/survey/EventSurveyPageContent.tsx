"use client";

import { useTranslations } from "next-intl";

import { EventSurveyForm } from "@/components/forms/EventSurveyForm";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { StaticPageHero } from "@/components/layout/StaticPageHero";
import type { SurveyEvent } from "@/lib/events/event-views";

export function EventSurveyPageContent({ events }: { events: SurveyEvent[] }) {
  const t = useTranslations("eventsSurveyPage");

  return (
    <>
      <ScrollToTop />
      <main className="gradient-bg relative min-h-screen overflow-hidden">
        <StaticPageHero
          eyebrow={t("eyebrow")}
          heroWord="SURVEY"
          subtitle={t("subtitle")}
          subtitleClassName="mx-auto max-w-xl text-sm leading-6 text-neutral-600 sm:max-w-2xl sm:text-base dark:text-neutral-400"
          title={
            <h1 className="mb-5 text-3xl font-black tracking-tight text-neutral-900 sm:mb-6 sm:text-5xl lg:text-6xl dark:text-white">
              <span className="block">{t("titlePart1")}</span>
              <span className="text-gradient-static block">{t("titleHighlight")}</span>
            </h1>
          }
        />

        <div className="relative mx-auto max-w-5xl px-4 pb-16 sm:pb-24">
          <EventSurveyForm events={events} />
        </div>
      </main>
    </>
  );
}
