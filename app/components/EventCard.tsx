import { LOCATIONS, type LocationValue } from "../lib/constants";

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

interface EventLinks {
  luma?: string;
  facebook?: string;
  eventbrite?: string;
}

interface EventCardProps {
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
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}

function LumaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-3.5l6-4.5-6-4.5v9z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function EventbriteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.157 13.463c-.751-.062-1.614-.062-2.477-.062-.863 0-1.726 0-2.477.062-.751.062-1.502.185-2.14.37-.639.185-1.165.432-1.578.741-.413.309-.751.679-1.014 1.11a4.44 4.44 0 00-.526 1.358c-.112.494-.168 1.049-.168 1.666 0 .617.056 1.172.168 1.666.112.494.28.926.526 1.358.263.432.601.802 1.014 1.11.413.309.939.556 1.578.741.639.185 1.39.309 2.14.37.751.062 1.614.062 2.477.062.863 0 1.726 0 2.477-.062.751-.062 1.502-.185 2.14-.37.639-.185 1.165-.432 1.578-.741.413-.309.751-.679 1.014-1.11.246-.432.414-.864.526-1.358.112-.494.168-1.049.168-1.666 0-.617-.056-1.172-.168-1.666a4.44 4.44 0 00-.526-1.358c-.263-.432-.601-.802-1.014-1.11-.413-.309-.939-.556-1.578-.741-.638-.185-1.389-.309-2.14-.37zm-5.346 5.39c-.863 0-1.614-.309-2.252-.926-.639-.617-.958-1.358-.958-2.222 0-.864.319-1.605.958-2.222.638-.617 1.389-.926 2.252-.926.862 0 1.614.309 2.252.926.639.617.958 1.358.958 2.222 0 .864-.319 1.605-.958 2.222-.638.617-1.39.926-2.252.926zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  );
}

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
      <article className="glass-card fire-glow group relative p-7 sm:p-9">
        <div
          className={`pointer-events-none absolute top-0 right-0 h-48 w-48 translate-x-12 -translate-y-12 rounded-full blur-3xl ${
            location === LOCATIONS.PRAGUE
              ? "bg-gradient-to-br from-red-400/25 to-rose-500/15"
              : "bg-gradient-to-br from-blue-400/25 to-indigo-500/15"
          }`}
        />

        <div className="relative">
          <div className="mb-5 flex items-start justify-between">
            <span
              className={`location-badge ${location.toLowerCase()} text-xs`}
              aria-label={labels.locationLabel.replace("{location}", location)}
            >
              <MapPinIcon className="h-4 w-4" />
              {location}
            </span>
          </div>

          <h3 className="mb-3 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
            {title}
          </h3>
          {episode && (
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
              {labels.episodeLabel}: {episode}
            </p>
          )}

          <p className="mb-6 leading-relaxed text-neutral-600 dark:text-neutral-300">
            {description}
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-gradient-to-r from-brand-500/15 via-brand-400/15 to-brand-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-700 ring-1 ring-brand-500/20 dark:from-brand-400/10 dark:via-brand-300/10 dark:to-brand-400/10 dark:text-brand-200 dark:ring-brand-400/20">
              {labels.tba}
            </span>
            <div className="flex items-center gap-2 rounded-full bg-neutral-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
              <MapPinIcon className="h-3 w-3" />
              {venue}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="glass-card fire-glow group relative p-7 sm:p-9">
      <div
        className={`pointer-events-none absolute top-0 right-0 h-48 w-48 translate-x-12 -translate-y-12 rounded-full blur-3xl ${
          location === LOCATIONS.PRAGUE
            ? "bg-gradient-to-br from-red-400/25 to-rose-500/15"
            : "bg-gradient-to-br from-blue-400/25 to-indigo-500/15"
        }`}
      />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between">
          <span
            className={`location-badge ${location.toLowerCase()}`}
            aria-label={labels.locationLabel.replace("{location}", location)}
          >
            <MapPinIcon className="h-4 w-4" />
            {location}
          </span>
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
          <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100/80 dark:bg-brand-500/10">
              <CalendarIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100/80 dark:bg-brand-500/10">
              <ClockIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <span className="font-medium">{time}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100/80 dark:bg-brand-500/10">
              <MapPinIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <span className="font-medium">{venue}</span>
          </div>
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
    </article>
  );
}
