import { LOCATIONS, type LocationValue } from "../../lib/config/constants";
import { AccentBar } from "../ui/AccentBar";
import { Card } from "../ui/Card";
import {
  CalendarIcon,
  ClockIcon,
  EventbriteIcon,
  FacebookIcon,
  LumaIcon,
  MapPinIcon,
} from "../shared/icons";
import { LocationPill } from "../locations/LocationPill";
import { MetaRow } from "../ui/MetaRow";
import { Pill } from "../ui/Pill";

export interface EventCardLabels {
  locationLabel: string;
  episodeLabel: string;
  tba: string;
  speakers: string;
  register: string;
  platforms: {
    luma: string;
    facebook: string;
    eventbrite: string;
  };
}

type EventLinks = {
  luma?: string;
  facebook?: string;
  eventbrite?: string;
};

type EventCardProps = {
  id: string;
  title: string;
  episode?: string;
  location: LocationValue;
  date: string;
  time: string;
  venue: string;
  description: string;
  registrationUrl: string;
  speakers: Array<{ name: string; topic: string }>;
  links?: EventLinks;
  labels: EventCardLabels;
  locale: string;
};

export function EventCard({
  title,
  episode,
  location,
  date,
  time,
  venue,
  description,
  links,
  registrationUrl,
  speakers,
  labels,
  locale,
}: EventCardProps) {
  const isTba = date.trim().toUpperCase() === "TBA";
  const hasSpeakers = speakers.some((speaker) => speaker.name.trim().length > 0);

  const formattedDate = !isTba
    ? new Date(date).toLocaleDateString(locale, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const platformLinks = [
    {
      key: "luma",
      url: links?.luma || registrationUrl,
      icon: LumaIcon,
      label: labels.platforms.luma,
      colors:
        "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-violet-500/25",
    },
    {
      key: "facebook",
      url: links?.facebook,
      icon: FacebookIcon,
      label: labels.platforms.facebook,
      colors:
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/25",
    },
    {
      key: "eventbrite",
      url: links?.eventbrite,
      icon: EventbriteIcon,
      label: labels.platforms.eventbrite,
      colors:
        "bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 shadow-brand-500/25",
    },
  ].filter((link) => link.url && link.url.length > 0);

  if (isTba) {
    return (
      <Card as="article" className="group relative overflow-hidden p-7 sm:p-9">
        <div className="relative">
          <div className="mb-5 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AccentBar className="mt-1" />
              <div>
                <h3 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                  {title}
                </h3>
                {episode && (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
                    {labels.episodeLabel}: {episode}
                  </p>
                )}
              </div>
            </div>
            <LocationPill
              location={location}
              ariaLabel={labels.locationLabel.replace("{location}", location)}
              icon={<MapPinIcon className="h-4 w-4" />}
              className="text-xs"
            />
          </div>

          <p className="mb-6 leading-relaxed text-neutral-600 dark:text-neutral-300">
            {description}
          </p>

          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <Pill
              size="md"
              className="bg-neutral-900/5 font-semibold uppercase tracking-[0.25em] text-neutral-600 dark:bg-white/10 dark:text-neutral-300"
            >
              {labels.tba}
            </Pill>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
              Details soon
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-3 py-2.5 text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-300">
            <MapPinIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            <span className="font-medium truncate">{venue}</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card as="article" className="fire-glow group relative p-7 sm:p-9">
      <div
        className={`pointer-events-none absolute top-0 right-0 h-48 w-48 translate-x-12 -translate-y-12 rounded-full blur-3xl ${
          location === LOCATIONS.PRAGUE
            ? "bg-gradient-to-br from-red-400/25 to-rose-500/15"
            : "bg-gradient-to-br from-blue-400/25 to-indigo-500/15"
        }`}
      />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between">
          <LocationPill
            location={location}
            ariaLabel={labels.locationLabel.replace("{location}", location)}
            icon={<MapPinIcon className="h-4 w-4" />}
          />
        </div>

        <h3 className="mb-3 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
          {title}
        </h3>
        {episode && (
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
            {labels.episodeLabel}: {episode}
          </p>
        )}

        <p className="mb-7 leading-relaxed text-neutral-600 dark:text-neutral-300">{description}</p>

        <div className="mb-8 space-y-3.5">
          <MetaRow
            icon={<CalendarIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />}
            text={formattedDate}
          />
          <MetaRow
            icon={<ClockIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />}
            text={time}
          />
          <MetaRow
            icon={<MapPinIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />}
            text={venue}
          />
        </div>

        {hasSpeakers && (
          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {labels.speakers}
            </p>
            <div className="space-y-3">
              {speakers.map((speaker) => (
                <div
                  key={`${speaker.name}-${speaker.topic}`}
                  className="flex items-start gap-3 rounded-2xl bg-white/60 p-3 text-sm text-neutral-700 shadow-sm shadow-black/5 dark:bg-white/5 dark:text-neutral-200"
                >
                  <div className="mt-0.5 h-2.5 w-2.5 flex-none rounded-full bg-brand-500/80" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{speaker.name}</p>
                    <p className="text-neutral-500 dark:text-neutral-400">{speaker.topic}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {labels.register}
        </p>

        <div className="flex flex-wrap gap-3">
          {platformLinks.map((platform) => (
            <a
              key={platform.key}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${platform.colors}`}
            >
              <platform.icon className="h-5 w-5" />
              {platform.label}
            </a>
          ))}
        </div>
      </div>
    </Card>
  );
}
