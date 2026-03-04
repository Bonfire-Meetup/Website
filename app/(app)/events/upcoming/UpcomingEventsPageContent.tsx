"use client";

import { useLocale, useTranslations } from "next-intl";

import { EventsSectionClient } from "@/components/events/EventsSectionClient";
import { getPastEvents, getUpcomingEventsWithFallback } from "@/data/events-calendar";
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
                    {event.date.trim().toUpperCase() === "TBA"
                      ? event.date
                      : formatEventDateUTC(event.date, locale)}
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
