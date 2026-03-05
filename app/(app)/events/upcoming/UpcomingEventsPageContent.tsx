"use client";

import { useLocale, useTranslations } from "next-intl";

import { EventsPageHero } from "@/components/events/EventsPageHero";
import { EventsSectionClient } from "@/components/events/EventsSectionClient";
import { getPastEvents, getUpcomingEventsWithFallback, isTbaDate } from "@/data/events-calendar";
import { Link } from "@/i18n/navigation";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatEventDateUTC } from "@/lib/utils/locale";

export function UpcomingEventsPageContent() {
  const t = useTranslations("sections.events");
  const locale = useLocale();
  const now = new Date();
  const upcomingEvents = getUpcomingEventsWithFallback(now);
  const recentPastEvents = getPastEvents(now).slice(0, 4);

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <EventsPageHero
        eyebrow={t("eyebrow", { defaultValue: "Upcoming" })}
        subtitle={t("subtitle")}
        title={
          <h1 className="mb-5 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
            <span className="block">{t("titlePart1", { defaultValue: "Upcoming" })}</span>
            <span className="text-gradient-static block">
              {t("titleHighlight", { defaultValue: "Events" })}
            </span>
          </h1>
        }
      />

      <section className="relative mx-auto max-w-7xl px-4 pb-24">
        <EventsSectionClient
          events={upcomingEvents}
          initialEpisode="all"
          preFilteredEvents={upcomingEvents}
          hideHeader
        />

        {recentPastEvents.length > 0 && (
          <div className="mx-auto mt-14 max-w-4xl rounded-2xl border border-neutral-200/70 bg-white/60 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400">
                  {t("pastSectionEyebrow")}
                </p>
                <h2 className="mt-0.5 text-base font-bold text-neutral-900 dark:text-white">
                  {t("pastSectionTitle")}
                </h2>
              </div>
              <Link
                href={PAGE_ROUTES.EVENT_PAST}
                className="rounded-full border border-neutral-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-white hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {t("pastSectionCta")}
              </Link>
            </div>

            <div className="space-y-2">
              {recentPastEvents.map((event) => (
                <Link
                  key={event.id}
                  href={PAGE_ROUTES.EVENT(event.id)}
                  className="group flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200/70 bg-neutral-100/50 px-3 py-2 text-sm transition-all duration-200 hover:border-neutral-300/80 hover:bg-neutral-100 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
                >
                  <span className="font-medium text-neutral-800 transition-colors group-hover:text-neutral-900 dark:text-neutral-200 dark:group-hover:text-white">
                    {event.title}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {isTbaDate(event.date) ? event.date : formatEventDateUTC(event.date, locale)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
