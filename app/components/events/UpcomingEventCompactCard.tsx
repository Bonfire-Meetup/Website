import { LOCATIONS, WEBSITE_URLS, type LocationValue } from "@/lib/config/constants";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatEventDateUTC } from "@/lib/utils/locale";

import { LocationPill } from "../locations/LocationPill";
import { ArrowRightIcon, CalendarIcon, ClockIcon, MapPinIcon, MicIcon } from "../shared/Icons";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Pill } from "../ui/Pill";

function parseTitle(title: string) {
  const match = title.match(/^(.+?)\s*[-–—:]\s*(.+)$/);
  if (match) {
    return { prefix: match[1], subtitle: match[2] };
  }
  return null;
}

function getLocationTheme(location: LocationValue) {
  const isPrague = location === LOCATIONS.PRAGUE;
  return isPrague
    ? {
        rail: "bg-gradient-to-r from-rose-500 via-orange-500 to-red-500",
        iconTint: "text-red-600 dark:text-red-400",
        metaIcon: "bg-red-100/80 dark:bg-red-500/10",
        titleGradient:
          "from-rose-600 via-red-500 to-orange-500 dark:from-rose-400 dark:via-red-400 dark:to-orange-400",
      }
    : {
        rail: "bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600",
        iconTint: "text-blue-600 dark:text-blue-400",
        metaIcon: "bg-blue-100/80 dark:bg-blue-500/10",
        titleGradient:
          "from-blue-600 via-indigo-500 to-violet-500 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400",
      };
}

type TranslationFn = (key: string, values?: Record<string, string>) => string;

interface UpcomingEventCompactCardProps {
  id: string;
  title: string;
  episode?: string;
  location: LocationValue;
  date: string;
  time: string;
  venue: string;
  description: string;
  speakers: {
    name: string | string[];
    company?: string | string[];
    topic: string;
    startTime?: string;
    profileId?: string | string[];
    url?: string | string[];
  }[];
  locale: string;
  t: TranslationFn;
}

export function UpcomingEventCompactCard({
  id,
  title,
  episode,
  location,
  date,
  time,
  venue,
  description,
  speakers,
  locale,
  t,
}: UpcomingEventCompactCardProps) {
  const isTba = date.trim().toUpperCase() === "TBA";
  const formattedDate = !isTba ? formatEventDateUTC(date, locale) : t("tba");
  const theme = getLocationTheme(location);
  const parsedTitle = parseTitle(title);
  const confirmedSpeakerNames = speakers
    .flatMap((speaker) => (Array.isArray(speaker.name) ? speaker.name : [speaker.name]))
    .map((speakerName) => speakerName.trim())
    .filter((speakerName) => speakerName.length > 0 && speakerName !== "TBA");
  const speakerSummary = confirmedSpeakerNames.join(", ");
  const mapUrl = `${WEBSITE_URLS.GOOGLE.MAPS_SEARCH}?api=1&query=${encodeURIComponent(venue)}`;

  return (
    <Card
      as="article"
      className="fire-glow group relative overflow-hidden p-5 sm:p-6"
      data-glow={location === LOCATIONS.ZLIN ? "zlin" : "prague"}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${theme.rail}`} />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-3">
          <LocationPill
            location={location}
            ariaLabel={t("locationLabel", { location })}
            icon={<MapPinIcon className="h-4 w-4" />}
          />
          {episode && (
            <Pill
              size="sm"
              className="bg-neutral-100 font-semibold tracking-[0.2em] text-neutral-600 uppercase dark:bg-white/10 dark:text-neutral-300"
            >
              {episode}
            </Pill>
          )}
        </div>

        <h3 className="mb-3">
          {parsedTitle ? (
            <>
              <span className="mb-1 block text-[11px] font-bold tracking-[0.18em] text-neutral-400 uppercase dark:text-neutral-500">
                {parsedTitle.prefix}
              </span>
              <span
                className={`block bg-gradient-to-r bg-clip-text text-lg font-extrabold tracking-tight text-transparent sm:text-xl ${theme.titleGradient}`}
              >
                {parsedTitle.subtitle}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl dark:text-white">
              {title}
            </span>
          )}
        </h3>

        <p className="mb-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {description}
        </p>

        <div className="mb-5 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${theme.metaIcon}`}
            >
              <CalendarIcon className={`h-4 w-4 ${theme.iconTint}`} />
            </div>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${theme.metaIcon}`}
            >
              <ClockIcon className={`h-4 w-4 ${theme.iconTint}`} />
            </div>
            <span className="font-medium">{time}</span>
          </div>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-sm text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme.metaIcon}`}
            >
              <MapPinIcon className={`h-4 w-4 ${theme.iconTint}`} />
            </div>
            <span className="font-medium underline decoration-neutral-300 underline-offset-2 dark:decoration-neutral-600">
              {venue}
            </span>
          </a>
        </div>

        {confirmedSpeakerNames.length > 0 && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-white/60 px-3 py-2 text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-300">
            <MicIcon className={`mt-0.5 h-4 w-4 shrink-0 ${theme.iconTint}`} />
            <span className="leading-relaxed">
              {t("speakerPreview", { names: speakerSummary })}
            </span>
          </div>
        )}

        <Button
          href={PAGE_ROUTES.EVENT(id)}
          variant="primary"
          size="sm"
          className="group w-full justify-center gap-2"
        >
          {t("viewDetails")}
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
}
