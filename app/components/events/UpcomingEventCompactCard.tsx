import { isTbaDate } from "@/data/events-calendar";
import { LOCATIONS } from "@/lib/config/constants";
import { getDaysUntilEventDate } from "@/lib/events/datetime";
import { getGoogleMapsSearchUrl } from "@/lib/events/links";
import { getSpeakerNames, hasRenderableSpeakerName, isTbaSpeakerName } from "@/lib/events/speakers";
import { getEventLocationTheme } from "@/lib/events/theme";
import { type EventItem } from "@/lib/events/types";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatEventDateUTC } from "@/lib/utils/locale";

import { LocationPill } from "../locations/LocationPill";
import { ArrowRightIcon, CalendarIcon, ClockIcon, MapPinIcon, MicIcon } from "../shared/Icons";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Pill } from "../ui/Pill";

import { EventMetaRow } from "./EventMetaRow";
import { EventTitleBlock } from "./EventTitleBlock";

type TranslationFn = (key: string, values?: Record<string, string>) => string;

interface UpcomingEventCompactCardProps {
  id: EventItem["id"];
  isPlaceholder?: boolean;
  title: EventItem["title"];
  episode?: EventItem["episode"];
  location: EventItem["location"];
  date: EventItem["date"];
  time: EventItem["time"];
  venue: EventItem["venue"];
  description: EventItem["description"];
  speakers: EventItem["speakers"];
  locale: string;
  now: Date | null;
  t: TranslationFn;
}

export function UpcomingEventCompactCard({
  id,
  isPlaceholder = false,
  title,
  episode,
  location,
  date,
  time,
  venue,
  description,
  speakers,
  locale,
  now,
  t,
}: UpcomingEventCompactCardProps) {
  const isTba = isTbaDate(date);
  const formattedDate = !isTba ? formatEventDateUTC(date, locale) : t("tba");
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
  const announcedSpeakerNames = visibleSpeakers
    .filter((speaker) => !isTbaSpeakerName(speaker.name))
    .flatMap((speaker) => getSpeakerNames(speaker.name))
    .map((speakerName) => speakerName.trim())
    .filter((speakerName) => speakerName.length > 0);
  const hiddenSpeakerCount = visibleSpeakers.filter((speaker) =>
    isTbaSpeakerName(speaker.name),
  ).length;
  const speakerSummary = announcedSpeakerNames.join(", ");
  const mapUrl = getGoogleMapsSearchUrl(venue);

  return (
    <Card
      as="article"
      className="fire-glow group relative overflow-hidden p-5 sm:p-6"
      data-glow={location === LOCATIONS.ZLIN ? "zlin" : "prague"}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${theme.rail}`} />

      <div className="relative flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <LocationPill
            location={location}
            ariaLabel={t("locationLabel", { location })}
            icon={<MapPinIcon className="h-4 w-4" />}
          />
          <div className="flex flex-col items-end gap-1.5">
            {countdownLabel && (
              <Pill
                size="sm"
                className="inline-flex items-center gap-1 bg-neutral-100/90 font-semibold tracking-[0.14em] text-neutral-600 uppercase dark:bg-white/10 dark:text-neutral-200"
              >
                <CalendarIcon className="h-3 w-3" />
                {countdownLabel}
              </Pill>
            )}
            {episode && (
              <Pill
                size="sm"
                className="bg-neutral-100 font-semibold tracking-[0.2em] text-neutral-600 uppercase dark:bg-white/10 dark:text-neutral-300"
              >
                {episode}
              </Pill>
            )}
          </div>
        </div>

        <h3 className="mb-3">
          <EventTitleBlock
            title={title}
            titleGradientClassName={theme.titleGradient}
            titleClassName="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl dark:text-white"
            subtitleClassName="block bg-gradient-to-r bg-clip-text text-lg font-extrabold tracking-tight text-transparent sm:text-xl"
            prefixClassName="mb-1 block text-[11px] font-bold tracking-[0.18em] text-neutral-400 uppercase dark:text-neutral-500"
          />
        </h3>

        <p className="mb-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {description}
        </p>

        <div className="mb-5 space-y-2.5">
          <EventMetaRow
            icon={<CalendarIcon className={`h-4 w-4 ${theme.iconTint}`} />}
            className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300"
            iconContainerClassName={`flex h-8 w-8 items-center justify-center rounded-lg ${theme.metaIcon}`}
            textClassName="font-medium"
          >
            {formattedDate}
          </EventMetaRow>
          <EventMetaRow
            icon={<ClockIcon className={`h-4 w-4 ${theme.iconTint}`} />}
            className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300"
            iconContainerClassName={`flex h-8 w-8 items-center justify-center rounded-lg ${theme.metaIcon}`}
            textClassName="font-medium"
          >
            {time}
          </EventMetaRow>
          <EventMetaRow
            icon={<MapPinIcon className={`h-4 w-4 ${theme.iconTint}`} />}
            href={mapUrl}
            className="flex items-center gap-2.5 text-sm text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            iconContainerClassName={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme.metaIcon}`}
            textClassName="font-medium underline decoration-neutral-300 underline-offset-2 dark:decoration-neutral-600"
          >
            {venue}
          </EventMetaRow>
        </div>

        {visibleSpeakers.length > 0 && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-white/60 px-3 py-2 text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-300">
            <MicIcon className={`mt-0.5 h-4 w-4 shrink-0 ${theme.iconTint}`} />
            <span className="leading-relaxed">
              {announcedSpeakerNames.length > 0
                ? hiddenSpeakerCount > 0
                  ? t("speakerPreviewPartial", {
                      count: hiddenSpeakerCount.toString(),
                      names: speakerSummary,
                    })
                  : t("speakerPreview", { names: speakerSummary })
                : t("speakersTba")}
            </span>
          </div>
        )}

        {isPlaceholder ? (
          <div
            className="mt-auto flex w-full items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100/70 px-4 py-2.5 text-sm font-semibold text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300"
            aria-live="polite"
          >
            {t("tba")}
          </div>
        ) : (
          <Button
            href={PAGE_ROUTES.EVENT(id)}
            variant="plain"
            size="sm"
            className={`group mt-auto w-full justify-center gap-2 ${theme.ctaButton}`}
          >
            {t("viewDetails")}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </div>
    </Card>
  );
}
