import { isTbaDate } from "@/data/events-calendar";
import { LOCATIONS, type LocationValue } from "@/lib/config/constants";
import { getGoogleMapsSearchUrl } from "@/lib/events/links";
import { parseEventTitle } from "@/lib/events/presentation";
import {
  formatSpeakerNameWithCompany,
  formatSpeakerNames,
  primarySpeakerName,
  resolveSpeakerLinks,
  withCompany,
} from "@/lib/events/speakers";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatEventDateUTC } from "@/lib/utils/locale";

import { LocationPill } from "../locations/LocationPill";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  EventbriteIcon,
  ExternalLinkIcon,
  FacebookIcon,
  LumaIcon,
  MapPinIcon,
  MicIcon,
} from "../shared/Icons";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Pill } from "../ui/Pill";

function getLocationTheme(location: LocationValue) {
  const isPrague = location === LOCATIONS.PRAGUE;
  return isPrague
    ? {
        color: "#dc2626",
        orb: "bg-gradient-to-br from-red-400/25 to-rose-500/15",
        rail: "bg-gradient-to-r from-rose-500 via-orange-500 to-red-500",
        iconTint: "text-red-600 dark:text-red-400",
        speakerDot: "bg-red-500 dark:bg-red-400",
        metaIcon: "bg-red-100/80 dark:bg-red-500/10",
        titleGradient:
          "from-rose-600 via-red-500 to-orange-500 dark:from-rose-400 dark:via-red-400 dark:to-orange-400",
      }
    : {
        color: "#2563eb",
        orb: "bg-gradient-to-br from-blue-400/25 to-indigo-500/15",
        rail: "bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600",
        iconTint: "text-blue-600 dark:text-blue-400",
        speakerDot: "bg-blue-500 dark:bg-blue-400",
        metaIcon: "bg-blue-100/80 dark:bg-blue-500/10",
        titleGradient:
          "from-blue-600 via-indigo-500 to-violet-500 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400",
      };
}

interface EventLinks {
  luma?: string;
  facebook?: string;
  eventbrite?: string;
}

type TranslationFn = (key: string, values?: Record<string, string>) => string;

interface EventCardProps {
  id: string;
  isPlaceholder?: boolean;
  title: string;
  episode?: string;
  location: LocationValue;
  date: string;
  time: string;
  venue: string;
  description: string;
  registrationUrl: string;
  speakers: {
    name: string | string[];
    company?: string | string[];
    topic: string;
    startTime?: string;
    profileId?: string | string[];
    url?: string | string[];
  }[];
  links?: EventLinks;
  locale: string;
  t: TranslationFn;
}

export function EventCard({
  id,
  isPlaceholder = false,
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
  locale,
  t,
}: EventCardProps) {
  const isTba = isTbaDate(date);
  const hasSpeakers = speakers.some(
    (speaker) => primarySpeakerName(speaker.name).trim().length > 0,
  );
  const confirmedSpeakers = speakers.filter((speaker) => {
    const primary = primarySpeakerName(speaker.name).trim();
    return primary.length > 0 && primary !== "TBA";
  });

  const formattedDate = !isTba ? formatEventDateUTC(date, locale) : "";
  const theme = getLocationTheme(location);
  const parsed = parseEventTitle(title);

  const platformLinks = [
    {
      icon: LumaIcon,
      key: "luma",
      label: t("platforms.luma"),
      url: links?.luma || registrationUrl,
    },
    {
      icon: FacebookIcon,
      key: "facebook",
      label: t("platforms.facebook"),
      url: links?.facebook,
    },
    {
      icon: EventbriteIcon,
      key: "eventbrite",
      label: t("platforms.eventbrite"),
      url: links?.eventbrite,
    },
  ].filter((link) => link.url && link.url.length > 0);

  const titleBlock = parsed ? (
    <>
      <span className="mb-1 block text-[11px] font-bold tracking-[0.18em] text-neutral-400 uppercase dark:text-neutral-500">
        {parsed.prefix}
      </span>
      <span
        className={`block bg-gradient-to-r bg-clip-text text-xl font-extrabold tracking-tight text-transparent sm:text-2xl ${theme.titleGradient}`}
      >
        {parsed.subtitle}
      </span>
    </>
  ) : (
    <span className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
      {title}
    </span>
  );

  if (isTba) {
    return (
      <Card
        as="article"
        className="fire-glow group relative overflow-hidden p-6 sm:p-7"
        data-glow={location === LOCATIONS.ZLIN ? "zlin" : "prague"}
      >
        <div className={`absolute inset-x-0 top-0 h-1 ${theme.rail}`} />

        <div
          className={`pointer-events-none absolute top-0 right-0 h-48 w-48 translate-x-12 -translate-y-12 rounded-full opacity-50 blur-3xl ${theme.orb}`}
        />

        <div className="relative">
          <div className="mb-4 flex items-start justify-between">
            <LocationPill
              location={location}
              ariaLabel={t("locationLabel", { location })}
              icon={<MapPinIcon className="h-4 w-4" />}
            />
            <Pill
              size="sm"
              className="bg-amber-100 font-semibold tracking-[0.2em] text-amber-700 uppercase dark:bg-amber-500/20 dark:text-amber-300"
            >
              {t("comingSoon")}
            </Pill>
          </div>

          <h3 className="mb-3">{titleBlock}</h3>
          {episode && (
            <p className="mb-2.5 text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">
              {t("episodeLabel")}: {episode}
            </p>
          )}

          <p className="mb-5 leading-relaxed text-neutral-600 dark:text-neutral-300">
            {description}
          </p>

          <div className="mb-6 space-y-2.5">
            <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.metaIcon}`}
              >
                <CalendarIcon className={`h-5 w-5 ${theme.iconTint}`} />
              </div>
              <span>{t("tba")}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.metaIcon}`}
              >
                <ClockIcon className={`h-5 w-5 ${theme.iconTint}`} />
              </div>
              <span>{time}</span>
            </div>
            <a
              href={getGoogleMapsSearchUrl(venue)}
              target="_blank"
              rel="noopener noreferrer"
              className="venue-link"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.metaIcon}`}
              >
                <MapPinIcon className={`h-5 w-5 ${theme.iconTint}`} />
              </div>
              <span className="flex items-center gap-1.5 font-medium underline-offset-2 hover:underline">
                {venue}
                <ExternalLinkIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
              </span>
            </a>
          </div>

          <div className="mb-5">
            <p className="section-label">{t("speakers")}</p>
            {confirmedSpeakers.length > 0 ? (
              <div className="space-y-2">
                {confirmedSpeakers.map((speaker) => (
                  <div
                    key={`${formatSpeakerNames(speaker.name)}-${speaker.topic}`}
                    className="speaker-card"
                  >
                    <div
                      className={`mt-0.5 h-2.5 w-2.5 flex-none rounded-full ${theme.speakerDot}`}
                    />
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {speaker.topic}
                      </p>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                        {formatSpeakerNameWithCompany(speaker.name, speaker.company)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-neutral-200/70 p-3.5 dark:border-neutral-700/50">
                <MicIcon className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
                <p className="text-sm text-neutral-400 dark:text-neutral-500">{t("speakersTba")}</p>
              </div>
            )}
          </div>

          {isPlaceholder ? (
            <Button variant="secondary" size="sm" className="w-full">
              {t("tba")}
            </Button>
          ) : (
            <Button
              href={PAGE_ROUTES.EVENT(id)}
              variant="primary"
              size="sm"
              className="group w-full gap-2"
            >
              {t("viewDetails")}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      as="article"
      className="fire-glow group relative overflow-hidden p-7 sm:p-9"
      data-glow={location === LOCATIONS.ZLIN ? "zlin" : "prague"}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${theme.rail}`} />

      <div
        className={`pointer-events-none absolute top-0 right-0 h-48 w-48 translate-x-12 -translate-y-12 rounded-full blur-3xl ${theme.orb}`}
      />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between">
          <LocationPill
            location={location}
            ariaLabel={t("locationLabel", { location })}
            icon={<MapPinIcon className="h-4 w-4" />}
          />
          {confirmedSpeakers.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/70 bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-neutral-600 dark:border-white/10 dark:bg-white/10 dark:text-neutral-300">
              <MicIcon className="h-3 w-3" style={{ color: theme.color }} />
              {confirmedSpeakers.length} {confirmedSpeakers.length === 1 ? "Talk" : "Talks"}
            </span>
          )}
        </div>

        <h3 className="mb-3">{titleBlock}</h3>
        {episode && (
          <p className="mb-4 text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">
            {t("episodeLabel")}: {episode}
          </p>
        )}

        <p className="mb-7 leading-relaxed text-neutral-600 dark:text-neutral-300">{description}</p>
        <div className="mb-8 space-y-3.5">
          <div className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.metaIcon}`}
            >
              <CalendarIcon className={`h-5 w-5 ${theme.iconTint}`} />
            </div>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.metaIcon}`}
            >
              <ClockIcon className={`h-5 w-5 ${theme.iconTint}`} />
            </div>
            <span className="font-medium">{time}</span>
          </div>
          <a
            href={getGoogleMapsSearchUrl(venue)}
            target="_blank"
            rel="noopener noreferrer"
            className="venue-link"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.metaIcon}`}
            >
              <MapPinIcon className={`h-5 w-5 ${theme.iconTint}`} />
            </div>
            <span className="flex items-center gap-1.5 font-medium underline-offset-2 hover:underline">
              {venue}
              <ExternalLinkIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
            </span>
          </a>
        </div>

        {hasSpeakers && (
          <div className="mb-6">
            <p className="section-label-spaced">{t("speakers")}</p>
            <div className="space-y-2.5">
              {confirmedSpeakers.map((speaker, index) => {
                const resolved = resolveSpeakerLinks(speaker);
                return (
                  <div
                    key={`${formatSpeakerNames(speaker.name)}-${speaker.topic}`}
                    className="flex items-start gap-3 rounded-2xl bg-white/60 p-3.5 shadow-sm shadow-black/5 dark:bg-white/5"
                  >
                    <div
                      className="mt-1 flex h-7 w-7 flex-none items-center justify-center rounded-lg text-[9px] font-black text-white"
                      style={{ background: theme.color }}
                    >
                      {(index + 1).toString().padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">
                        {speaker.topic}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        {resolved.map((r, i) => {
                          const profileHref = r.profileId
                            ? PAGE_ROUTES.USER(r.profileId)
                            : undefined;
                          const linkHref = profileHref || r.url;
                          return (
                            <span
                              key={r.name}
                              className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400"
                            >
                              {i > 0 && (
                                <span className="text-neutral-300 dark:text-neutral-600">&</span>
                              )}
                              {linkHref ? (
                                <a
                                  href={linkHref}
                                  {...(!profileHref && r.url
                                    ? { target: "_blank", rel: "noopener noreferrer" }
                                    : {})}
                                  className="underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-neutral-700 hover:decoration-neutral-500 dark:decoration-neutral-600 dark:hover:text-neutral-200 dark:hover:decoration-neutral-400"
                                >
                                  {withCompany(r.name, r.company)}
                                </a>
                              ) : (
                                <span>{withCompany(r.name, r.company)}</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {isPlaceholder ? (
          <Button variant="secondary" size="sm" className="w-full justify-center">
            {t("tba")}
          </Button>
        ) : (
          <Button
            href={PAGE_ROUTES.EVENT(id)}
            variant="primary"
            size="sm"
            className="group w-full justify-center gap-2"
          >
            {t("viewDetails")}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
        {platformLinks.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
              {t("orRegisterVia")}
            </span>
            {platformLinks.map((platform) => (
              <a
                key={platform.key}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                <platform.icon className="h-3 w-3" />
                {platform.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
