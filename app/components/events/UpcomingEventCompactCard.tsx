import { Link } from "@/i18n/navigation";
import { LOCATIONS } from "@/lib/config/constants";
import { getDaysUntilEventDate, isTbaDate } from "@/lib/events/datetime";
import { getGoogleMapsSearchUrl } from "@/lib/events/links";
import {
  hasRenderableSpeakerName,
  isTbaSpeakerName,
  resolveSpeakerLinks,
} from "@/lib/events/speakers";
import { getEventLocationTheme } from "@/lib/events/theme";
import { type EventItem } from "@/lib/events/types";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatEventDateUTC, formatMonthUTC, getUTCDateParts } from "@/lib/utils/locale";

import { LocationPill } from "../locations/LocationPill";
import { ArrowRightIcon, ClockIcon, MailIcon, MapPinIcon } from "../shared/Icons";
import { SpeakerPhoto } from "../speakers/SpeakerPhoto";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Pill } from "../ui/Pill";

import { DateTile } from "./DateTile";
import { EventTitleBlock } from "./EventTitleBlock";

type TranslationFn = (key: string, values?: Record<string, string>) => string;

const PHOTO_CLASS = "w-14 shrink-0 drop-shadow-md @md:w-16";

function formatWeekdayUTC(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", weekday: "short" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

interface UpcomingEventCompactCardProps {
  id: EventItem["id"];
  isPlaceholder?: boolean;
  announcementStatus?: EventItem["announcementStatus"];
  title: EventItem["title"];
  location: EventItem["location"];
  date: EventItem["date"];
  time: EventItem["time"];
  venue: EventItem["venue"];
  description: EventItem["description"];
  speakers: EventItem["speakers"];
  speakerPhotos?: Record<string, string>;
  locale: string;
  now: Date | null;
  t: TranslationFn;
}

export function UpcomingEventCompactCard({
  id,
  isPlaceholder = false,
  announcementStatus,
  title,
  location,
  date,
  time,
  venue,
  description,
  speakers,
  speakerPhotos,
  locale,
  now,
  t,
}: UpcomingEventCompactCardProps) {
  const isTba = isTbaDate(date);
  const daysUntil = now ? getDaysUntilEventDate(date, now) : null;
  const countdownLabel =
    daysUntil === null
      ? null
      : daysUntil === 0
        ? t("countdownToday")
        : daysUntil === 1
          ? t("countdownTomorrow")
          : t("countdownDays", { count: daysUntil.toString() });
  const theme = getEventLocationTheme(location);

  const visibleSpeakers = speakers.filter((speaker) => hasRenderableSpeakerName(speaker.name));
  const talks = visibleSpeakers
    .filter((speaker) => !isTbaSpeakerName(speaker.name))
    .map((talk) => ({ people: resolveSpeakerLinks(talk), talk }));
  const hasMoreToAnnounce =
    announcementStatus === "partial" || visibleSpeakers.length > talks.length;
  const lineupNote =
    talks.length === 0 ? t("speakersTba") : hasMoreToAnnounce ? t("moreSpeakersSoon") : null;

  return (
    <Card
      as="article"
      className="fire-glow group @container relative flex flex-col overflow-hidden p-5 lg:p-7"
      data-glow={location === LOCATIONS.ZLIN ? "zlin" : "prague"}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-28 -right-24 h-72 w-72 rounded-full blur-3xl ${theme.orb}`}
      />

      <div className="relative flex items-start gap-4 @md:gap-5">
        {isTba ? (
          <DateTile
            variant="plain"
            location={location}
            day="?"
            className="min-h-21 w-18 shrink-0 justify-center @md:w-20"
          />
        ) : (
          <DateTile
            date={date}
            location={location}
            top={formatMonthUTC(date, locale)}
            day={String(getUTCDateParts(date).day)}
            bottom={formatWeekdayUTC(date, locale)}
            className="w-18 shrink-0 @md:w-20"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <LocationPill
              location={location}
              size="xs"
              ariaLabel={t("locationLabel", { location })}
              icon={<MapPinIcon className="h-3.5 w-3.5" />}
            />
            {countdownLabel && (
              <Pill size="xs" className={`whitespace-nowrap ${theme.pill}`}>
                {countdownLabel}
              </Pill>
            )}
          </div>

          <h3 className="mt-2.5">
            <EventTitleBlock
              title={title}
              titleGradientClassName={theme.titleGradient}
              titleClassName="text-xl leading-tight font-black tracking-tight text-neutral-900 @md:text-2xl dark:text-white"
              subtitleClassName="block bg-gradient-to-r bg-clip-text text-xl leading-tight font-black tracking-tight text-transparent @md:text-2xl"
              prefixClassName="eyebrow mb-1 block text-2xs text-neutral-500 dark:text-neutral-400"
            />
          </h3>

          {isPlaceholder ? (
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {description}
            </p>
          ) : (
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {!isTba && <span className="sr-only">{formatEventDateUTC(date, locale)}</span>}
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <ClockIcon className={`h-4 w-4 shrink-0 ${theme.iconTint}`} />
                {time}
              </span>
              <a
                href={getGoogleMapsSearchUrl(venue)}
                target="_blank"
                rel="noopener noreferrer"
                title={venue}
                className="inline-flex min-w-0 items-center gap-1.5 transition-colors hover:text-neutral-950 dark:hover:text-white"
              >
                <MapPinIcon className={`h-4 w-4 shrink-0 ${theme.iconTint}`} />
                <span className="text-link truncate">{venue.split(",").slice(0, 2).join(",")}</span>
              </a>
            </p>
          )}
        </div>
      </div>

      {!isPlaceholder && (
        <div className="surface-inset relative mt-6 px-4 py-4 @md:px-5">
          <p className="eyebrow text-2xs text-neutral-500 dark:text-neutral-400">{t("speakers")}</p>
          <ul className="mt-3 space-y-4">
            {talks.map(({ people, talk }) => (
              <li key={talk.topic} className="flex items-center gap-4">
                <div className="flex shrink-0 -space-x-5">
                  {people.map((person) => (
                    <SpeakerPhoto
                      key={person.name}
                      name={person.name}
                      photoUrl={person.id ? speakerPhotos?.[person.id] : undefined}
                      sizes="128px"
                      className={PHOTO_CLASS}
                      gradientClassName={theme.tile}
                      initialsClassName="text-lg"
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-4 leading-snug font-bold text-balance text-neutral-900 @md:line-clamp-3 dark:text-white">
                    {talk.topic}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                    {people.map((person, index) => (
                      <span key={person.name}>
                        {index > 0 && ", "}
                        {person.slug ? (
                          <Link
                            href={PAGE_ROUTES.SPEAKER(person.slug)}
                            className="font-semibold text-neutral-800 hover:underline dark:text-neutral-100"
                          >
                            {person.name}
                          </Link>
                        ) : (
                          <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {person.name}
                          </span>
                        )}
                        {person.company && ` · ${person.company}`}
                      </span>
                    ))}
                  </p>
                </div>
                {talk.startTime && (
                  <span className="hidden shrink-0 rounded-lg bg-white px-2 py-1 font-mono text-xs font-bold text-neutral-600 tabular-nums shadow-sm ring-1 ring-black/5 @md:block dark:bg-white/10 dark:text-neutral-300 dark:ring-white/10">
                    {talk.startTime}
                  </span>
                )}
              </li>
            ))}
            {lineupNote && (
              <li
                className={`flex items-center gap-4 ${
                  talks.length > 0
                    ? "border-t border-dashed border-neutral-300 pt-4 dark:border-white/15"
                    : ""
                }`}
              >
                <div className="flex w-14 shrink-0 justify-center @md:w-16">
                  <div className="relative w-11 @md:w-12">
                    <SpeakerPhoto name="" sizes="48px" gradientClassName={theme.orb} />
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 flex items-center justify-center pb-[12%] text-lg font-black ${theme.iconTint}`}
                    >
                      ?
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  {lineupNote}
                </p>
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="relative mt-auto pt-6">
        {isPlaceholder ? (
          <Button
            href="#newsletter"
            external
            variant="hero-secondary"
            size="sm"
            className="w-full gap-2 @md:w-auto"
          >
            <MailIcon className="h-4 w-4" />
            {t("getUpdates")}
          </Button>
        ) : (
          <Button
            href={PAGE_ROUTES.EVENT(id)}
            variant="plain"
            size="md"
            className={`group/cta w-full gap-2 ${theme.ctaButton}`}
          >
            {t("viewDetails")}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
          </Button>
        )}
      </div>
    </Card>
  );
}
