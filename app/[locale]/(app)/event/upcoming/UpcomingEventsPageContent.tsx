"use client";

import { useTranslations } from "next-intl";

import { EventsSectionClient } from "@/components/events/EventsSectionClient";
import { upcomingEvents } from "@/data/upcoming-events";

export function UpcomingEventsPageContent() {
  const t = useTranslations("sections.events");

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-4 pt-32 pb-14 sm:min-h-[65vh] sm:pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
          <div className="absolute top-28 right-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,var(--color-orange-glow),transparent_62%)]" />
          <div className="absolute bottom-10 left-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,var(--color-rose-glow),transparent_65%)]" />
        </div>

        <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap select-none">
          <span className="text-outline block text-[15vw] leading-none font-black opacity-[0.03] sm:text-[11vw] dark:opacity-[0.02]">
            EVENTS
          </span>
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="text-brand-600 dark:text-brand-300 mb-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.4em] uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em]">
            <span className="to-brand-400 h-px w-8 bg-gradient-to-r from-transparent sm:w-12" />
            {t("eyebrow", { defaultValue: "Upcoming" })}
            <span className="to-brand-400 h-px w-8 bg-gradient-to-l from-transparent sm:w-12" />
          </p>

          <h1 className="mb-5 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
            <span className="block">{t("titlePart1", { defaultValue: "Upcoming" })}</span>
            <span className="text-gradient-static block">
              {t("titleHighlight", { defaultValue: "Events" })}
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-24">
        <EventsSectionClient
          events={upcomingEvents}
          initialEpisode="all"
          preFilteredEvents={upcomingEvents}
          hideHeader
        />
      </section>
    </main>
  );
}
