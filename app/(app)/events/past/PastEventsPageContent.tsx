"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { EventsPageHero } from "@/components/events/EventsPageHero";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/shared/Icons";
import { getPastEvents, isTbaDate } from "@/data/events-calendar";
import { Link } from "@/i18n/navigation";
import { parseEventTitle } from "@/lib/events/presentation";
import { getEventLocationTheme } from "@/lib/events/theme";
import { PAGE_ROUTES } from "@/lib/routes/pages";

interface CalendarGroupItem {
  key: string;
  label: string;
  events: ReturnType<typeof getPastEvents>;
}

export function PastEventsPageContent() {
  const t = useTranslations("sections.events");
  const locale = useLocale();
  const pastEvents = getPastEvents(new Date());
  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
    [locale],
  );
  const weekdayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        timeZone: "UTC",
      }),
    [locale],
  );
  const monthShortFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
    [locale],
  );
  const groups = useMemo(() => {
    const mapped = new Map<string, CalendarGroupItem>();

    for (const event of pastEvents) {
      if (isTbaDate(event.date)) {
        const tbaGroup = mapped.get("tba");
        if (tbaGroup) {
          tbaGroup.events.push(event);
        } else {
          mapped.set("tba", { key: "tba", label: "TBA", events: [event] });
        }
      } else {
        const date = new Date(`${event.date}T00:00:00.000Z`);
        if (!Number.isNaN(date.getTime())) {
          const key = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}`;
          const label = monthFormatter.format(date);
          const group = mapped.get(key);
          if (group) {
            group.events.push(event);
          } else {
            mapped.set(key, { key, label, events: [event] });
          }
        }
      }
    }

    return Array.from(mapped.values());
  }, [monthFormatter, pastEvents]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <EventsPageHero
        eyebrow={t("pastSectionEyebrow")}
        subtitle={t("pastPageSubtitle")}
        title={
          <h1 className="mb-5 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
            <span className="text-gradient-static block">{t("pastPageTitle")}</span>
          </h1>
        }
      />

      <section className="relative mx-auto max-w-7xl px-4 pb-24">
        {groups.length > 0 ? (
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.key} className="grid gap-4 lg:grid-cols-[190px_1fr] lg:gap-6">
                <div className="self-start rounded-3xl border border-neutral-200/80 bg-white/70 p-4 backdrop-blur-sm lg:sticky lg:top-24 dark:border-white/10 dark:bg-white/5">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-neutral-500 uppercase dark:text-neutral-400">
                    {t("pastSectionEyebrow")}
                  </p>
                  <h2 className="mt-1 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                    {group.label}
                  </h2>
                  <p className="mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {group.events.length}{" "}
                    {group.events.length === 1
                      ? t("pastMonthEventSingle")
                      : t("pastMonthEventPlural")}
                  </p>
                </div>

                <div className="space-y-3.5">
                  {group.events.map((event) => {
                    const theme = getEventLocationTheme(event.location);
                    const parsedTitle = parseEventTitle(event.title);
                    const shouldSplitTitle =
                      parsedTitle !== null && parsedTitle.prefix.startsWith("Bonfire@");
                    const eventDate = !isTbaDate(event.date)
                      ? new Date(`${event.date}T00:00:00.000Z`)
                      : null;
                    const isValidDate = eventDate && !Number.isNaN(eventDate.getTime());
                    const dayNumber = isValidDate ? eventDate.getUTCDate().toString() : "TBA";
                    const weekday = isValidDate ? weekdayFormatter.format(eventDate) : "";
                    return (
                      <article
                        key={event.id}
                        className="group relative grid gap-4 overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/75 p-4 transition-colors hover:bg-white sm:grid-cols-[88px_1fr] sm:p-5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                      >
                        <div
                          className={`pointer-events-none absolute inset-y-0 left-0 w-1 opacity-65 ${theme.rail}`}
                        />

                        <div className="relative flex items-center sm:items-start">
                          <div className="relative flex w-full flex-row items-center gap-2.5 rounded-2xl border border-neutral-200/80 bg-white/55 px-3 py-2 text-center backdrop-blur-sm sm:w-auto sm:flex-col sm:items-center sm:gap-0.5 sm:px-2.5 sm:py-3 dark:border-white/10 dark:bg-white/5">
                            <span
                              className="pointer-events-none absolute inset-x-2 top-0 h-px rounded-full opacity-50"
                              style={{ backgroundColor: theme.color }}
                            />
                            <span className="text-xs font-semibold tracking-[0.14em] text-neutral-500 uppercase sm:tracking-[0.1em] dark:text-neutral-400">
                              {weekday || event.date}
                            </span>
                            <span className="text-2xl leading-none font-black text-neutral-900 dark:text-white">
                              {dayNumber}
                            </span>
                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              {isValidDate ? monthShortFormatter.format(eventDate) : ""}
                            </span>
                          </div>
                        </div>

                        <div className="min-w-0">
                          {shouldSplitTitle && parsedTitle ? (
                            <h3>
                              <span className="block text-[11px] font-bold tracking-[0.16em] text-neutral-400 uppercase dark:text-neutral-500">
                                {parsedTitle.prefix}
                              </span>
                              <span className="text-gradient-static mt-0.5 block text-xl font-black tracking-tight sm:text-[1.35rem]">
                                {parsedTitle.subtitle}
                              </span>
                            </h3>
                          ) : (
                            <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                              {event.title}
                            </h3>
                          )}

                          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            <span className="inline-flex items-center gap-1.5 align-middle">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: theme.color }}
                              />
                              <span>{event.location}</span>
                              <span className="text-neutral-400 dark:text-neutral-500">·</span>
                              <span>{event.venue}</span>
                            </span>
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                            {event.description}
                          </p>

                          <div className="mt-4">
                            <Link
                              href={PAGE_ROUTES.EVENT(event.id)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-700 transition-all group-hover:translate-x-0.5 hover:border-neutral-400 hover:text-neutral-900 dark:border-white/15 dark:bg-white/10 dark:text-neutral-200 dark:hover:border-white/25 dark:hover:text-white"
                            >
                              {t("pastPageViewDetails")}
                              <ArrowRightIcon className={`h-4 w-4 ${theme.iconTint}`} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-300/80 bg-white/70 p-10 text-center text-neutral-600 dark:border-white/15 dark:bg-white/5 dark:text-neutral-300">
            {t("pastPageEmpty")}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href={PAGE_ROUTES.EVENT_UPCOMING}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300/90 bg-white/70 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-white hover:text-neutral-900 dark:border-white/15 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            {t("backToUpcoming")}
          </Link>
        </div>
      </section>
    </main>
  );
}
