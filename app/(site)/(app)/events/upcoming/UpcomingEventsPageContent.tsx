"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

import { EventsPageHero } from "@/components/events/EventsPageHero";
import { useRenderNow } from "@/components/events/useRenderNow";
import { ArrowRightIcon, MapPinIcon } from "@/components/shared/Icons";
import { SpeakerPhoto } from "@/components/speakers/SpeakerPhoto";
import { Link } from "@/i18n/navigation";
import { getDaysUntilEventDate, isTbaDate } from "@/lib/events/datetime";
import { pastEventsOf, upcomingEventsWithFallbackOf } from "@/lib/events/event-lists";
import type { EventTiming } from "@/lib/events/event-views";
import { getGoogleMapsSearchUrl } from "@/lib/events/links";
import type { SpeakerMedia } from "@/lib/events/speaker-media";
import {
  hasRenderableSpeakerName,
  isTbaSpeakerName,
  resolveSpeakerLinks,
} from "@/lib/events/speakers";
import { getEventLocationTheme } from "@/lib/events/theme";
import type { EventItem } from "@/lib/events/types";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatEventDateUTC, formatMonthUTC, getUTCDateParts } from "@/lib/utils/locale";

function formatWeekdayUTC(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", weekday: "long" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

function UpcomingEvent({
  event,
  media,
  now,
}: {
  event: EventItem;
  media: SpeakerMedia;
  now: Date | null;
}) {
  const t = useTranslations("events");
  const locale = useLocale();
  const theme = getEventLocationTheme(event.location);
  const isTba = isTbaDate(event.date);
  const talks = event.speakers.filter(
    (speaker) => hasRenderableSpeakerName(speaker.name) && !isTbaSpeakerName(speaker.name),
  );

  const daysUntil = now ? getDaysUntilEventDate(event.date, now) : null;
  let countdown: string | null = null;
  if (daysUntil === 0) {
    countdown = t("countdownToday");
  } else if (daysUntil === 1) {
    countdown = t("countdownTomorrow");
  } else if (daysUntil !== null && daysUntil > 1) {
    countdown = t("countdownDays", { count: daysUntil.toString() });
  }

  const talkRows = talks.map((talk) => {
    const people = resolveSpeakerLinks(talk).map((person) => ({
      ...person,
      photoUrl: person.id ? media.photos[person.id] : undefined,
    }));
    const image = people
      .map((person) => (person.id ? media.talkImages[`${person.id}:${event.id}`] : undefined))
      .find(Boolean);

    return {
      image,
      people,
      talk,
    };
  });
  const visuals = talkRows.filter((row) => row.image || row.people.some((p) => p.photoUrl));

  return (
    <article className="grid gap-x-10 gap-y-8 border-t border-neutral-200 py-14 first:border-t-0 first:pt-0 lg:grid-cols-[9rem_minmax(0,1fr)_20rem] dark:border-white/10">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2 lg:flex-col lg:items-start lg:gap-1">
        {isTba ? (
          <p className="text-5xl leading-none font-black tracking-tight text-neutral-300 dark:text-neutral-700">
            {t("tba")}
          </p>
        ) : (
          <>
            <p className="eyebrow text-sm lg:order-first" style={{ color: theme.color }}>
              {formatMonthUTC(event.date, locale)} {getUTCDateParts(event.date).year}
            </p>
            <p className="order-first text-7xl leading-[0.85] font-black tracking-tighter text-neutral-900 tabular-nums lg:order-none lg:text-8xl dark:text-white">
              {getUTCDateParts(event.date).day}
            </p>
            <p className="text-sm font-medium whitespace-nowrap text-neutral-500 capitalize lg:mt-2 dark:text-neutral-400">
              {formatWeekdayUTC(event.date, locale)} · {event.time}
            </p>
          </>
        )}
        {countdown && (
          <p
            className="ml-auto rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap lg:mt-3 lg:ml-0"
            style={{ background: `${theme.color}1a`, color: theme.color }}
          >
            {countdown}
          </p>
        )}
      </div>

      <div className="order-3 min-w-0 lg:order-none">
        <h2 className="text-3xl font-black tracking-tight text-balance text-neutral-900 sm:text-4xl dark:text-white">
          {event.isPlaceholder ? (
            event.title
          ) : (
            <Link href={PAGE_ROUTES.EVENT(event.id)} className="hover:underline">
              {event.title}
            </Link>
          )}
        </h2>

        {event.isPlaceholder ? (
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">{event.description}</p>
        ) : (
          <a
            href={getGoogleMapsSearchUrl(event.venue)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
          >
            <MapPinIcon className="h-4 w-4 shrink-0" style={{ color: theme.color }} />
            {event.venue.split(",").slice(0, 2).join(",")}
          </a>
        )}

        {talkRows.length === 0 ? (
          <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">{t("speakersTba")}</p>
        ) : (
          <ol className="mt-8 space-y-7">
            {talkRows.map(({ people, talk }) => (
              <li key={talk.topic} className="border-l-2 pl-5" style={{ borderColor: theme.color }}>
                {talk.startTime && (
                  <p className="font-mono text-xs font-bold text-neutral-500 tabular-nums dark:text-neutral-400">
                    {talk.startTime}
                  </p>
                )}
                <p className="mt-1 text-xl font-bold tracking-tight text-balance text-neutral-900 sm:text-2xl dark:text-white">
                  {talk.topic}
                </p>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                  {people.map((person, index) => (
                    <span key={person.name}>
                      {index > 0 && ", "}
                      {person.slug ? (
                        <Link
                          href={PAGE_ROUTES.SPEAKER(person.slug)}
                          className="font-semibold text-neutral-900 hover:underline dark:text-white"
                        >
                          {person.name}
                        </Link>
                      ) : (
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {person.name}
                        </span>
                      )}
                      {person.company && ` · ${person.company}`}
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ol>
        )}

        {!event.isPlaceholder && (
          <Link
            href={PAGE_ROUTES.EVENT(event.id)}
            className={`mt-9 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold ${theme.ctaButton}`}
          >
            {t("viewDetails")}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
      </div>

      {visuals.length > 0 && (
        <div className="relative order-2 space-y-10 pb-4 lg:order-none lg:pt-1 lg:pb-0">
          <div
            className="pointer-events-none absolute -inset-10 rounded-full opacity-20 blur-3xl"
            style={{ background: theme.color }}
          />
          {visuals.map(({ image, people, talk }) => (
            <div key={talk.topic} className="relative">
              {image && (
                <Image
                  src={image.url}
                  alt=""
                  width={image.width}
                  height={image.height}
                  sizes="(max-width: 1024px) 100vw, 320px"
                  className="h-auto w-full rounded-2xl shadow-xl shadow-black/15"
                />
              )}
              <div className={`flex gap-3 ${image ? "-mt-10 pl-4" : ""}`}>
                {people.map((person) => (
                  <SpeakerPhoto
                    key={person.name}
                    name={person.name}
                    photoUrl={person.photoUrl}
                    sizes="112px"
                    className={`shrink-0 drop-shadow-xl ${image ? "w-24" : "w-28"}`}
                    initialsClassName="text-2xl"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export function UpcomingEventsPageContent({
  recentPast,
  speakerMedia,
  upcoming,
}: {
  recentPast: EventTiming[];
  speakerMedia: SpeakerMedia;
  upcoming: EventItem[];
}) {
  const t = useTranslations("sections.events");
  const locale = useLocale();
  const renderNow = useRenderNow();
  const now = new Date();
  const upcomingEvents = upcomingEventsWithFallbackOf(upcoming, now);
  const pastEvents = pastEventsOf<EventTiming>([...recentPast, ...upcoming], now);
  const recentPastEvents = pastEvents.slice(0, 4);

  return (
    <main className="gradient-bg relative min-h-screen overflow-hidden">
      <EventsPageHero
        eyebrow={t("eyebrow", { defaultValue: "Upcoming" })}
        subtitle={t("subtitle")}
        title={
          <h1 className="page-title mb-5">
            <span className="block">{t("titlePart1", { defaultValue: "Upcoming" })}</span>
            <span className="text-gradient-static block">
              {t("titleHighlight", { defaultValue: "Events" })}
            </span>
          </h1>
        }
      />

      <section className="relative mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        {upcomingEvents.length === 0 ? (
          <p className="text-center text-neutral-500 dark:text-neutral-400">{t("noEvents")}</p>
        ) : (
          upcomingEvents.map((event) => (
            <UpcomingEvent key={event.id} event={event} media={speakerMedia} now={renderNow} />
          ))
        )}

        {recentPastEvents.length > 0 && (
          <div className="mt-8 border-t border-neutral-200 pt-12 dark:border-white/10">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow text-2xs text-neutral-500 dark:text-neutral-400">
                  {t("pastSectionEyebrow")}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {t("pastSectionTitle")}
                </h2>
              </div>
              <Link
                href={PAGE_ROUTES.EVENT_PAST}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
              >
                {t("pastSectionCta")}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <ul className="divide-y divide-neutral-200/70 dark:divide-white/10">
              {recentPastEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={PAGE_ROUTES.EVENT(event.id)}
                    className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5"
                  >
                    <span className="font-semibold text-neutral-800 group-hover:underline dark:text-neutral-100">
                      {event.title}
                    </span>
                    <span className="text-sm text-neutral-500 tabular-nums dark:text-neutral-400">
                      {isTbaDate(event.date) ? event.date : formatEventDateUTC(event.date, locale)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
