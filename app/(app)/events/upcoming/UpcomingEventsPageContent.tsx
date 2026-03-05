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
  const pastEvents = getPastEvents(now);
  const recentPastEvents = pastEvents.slice(0, 4);

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
          <div className="relative mx-auto mt-14 max-w-4xl overflow-hidden rounded-3xl border border-white/45 bg-white/50 p-4 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-5 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-[0_26px_72px_-42px_rgba(0,0,0,0.55)]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-16 right-8 h-36 w-36 rounded-full bg-gradient-to-br from-rose-300/35 to-orange-300/20 blur-2xl dark:from-rose-500/20 dark:to-orange-500/10" />
              <div className="absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-gradient-to-br from-sky-300/30 to-indigo-300/20 blur-2xl dark:from-sky-500/12 dark:to-indigo-500/8" />
            </div>

            <div className="relative mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400">
                  {t("pastSectionEyebrow")}
                </p>
                <h2 className="mt-0.5 text-base font-bold whitespace-nowrap text-neutral-900 dark:text-white">
                  {t("pastSectionTitle")}
                </h2>
              </div>
              <Link
                href={PAGE_ROUTES.EVENT_PAST}
                className="rounded-full border border-neutral-300/75 bg-white/80 px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-neutral-700 transition-all hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:text-neutral-900 dark:border-white/14 dark:bg-neutral-800/70 dark:text-neutral-200 dark:hover:border-white/25 dark:hover:bg-neutral-800/85 dark:hover:text-white"
              >
                {t("pastSectionCta")}
              </Link>
            </div>

            <div className="relative space-y-2.5">
              {recentPastEvents.map((event) => (
                <Link
                  key={event.id}
                  href={PAGE_ROUTES.EVENT(event.id)}
                  className="group flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200/70 bg-white/72 px-3.5 py-2.5 text-sm shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300/80 hover:bg-white dark:border-white/12 dark:bg-neutral-800/65 dark:shadow-none dark:hover:border-white/22 dark:hover:bg-neutral-800/80"
                >
                  <span className="font-medium text-neutral-800 transition-colors group-hover:text-neutral-900 dark:text-neutral-200 dark:group-hover:text-white">
                    {event.title}
                  </span>
                  <span className="rounded-full bg-neutral-900/5 px-2 py-0.5 text-xs text-neutral-500 dark:bg-black/25 dark:text-neutral-400">
                    {isTbaDate(event.date) ? event.date : formatEventDateUTC(event.date, locale)}
                  </span>
                </Link>
              ))}

              {pastEvents.length > recentPastEvents.length && (
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center gap-1.5 pt-1 text-neutral-400 dark:text-neutral-500"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-85" />
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
