"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

import { RsvpSection } from "@/components/events/RsvpSection";
import { ShareEventButton } from "@/components/events/ShareEventButton";
import { useRenderNow } from "@/components/events/useRenderNow";
import {
  CommunityQuestionsPanel,
  DEFAULT_PANEL_THEME,
  PANEL_THEMES,
} from "@/components/questions/CommunityQuestionsPanel";
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EventbriteIcon,
  ExternalLinkIcon,
  FacebookIcon,
  LumaIcon,
  MapPinIcon,
  MicIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
  QrCodeIcon,
  SparklesIcon,
} from "@/components/shared/Icons";
import { SpeakerPhoto } from "@/components/speakers/SpeakerPhoto";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { getLocationPartners } from "@/data/location-partners";
import { Link } from "@/i18n/navigation";
import {
  DEFAULT_TIMEZONE,
  LOCATIONS,
  WEBSITE_URLS,
  type LocationValue,
} from "@/lib/config/constants";
import { USER_ROLES } from "@/lib/config/roles";
import {
  getDaysUntilEventDate,
  isEventPast,
  isTbaDate,
  parseEventDateTimeParts,
} from "@/lib/events/datetime";
import { getGoogleMapsSearchUrl } from "@/lib/events/links";
import { parseEventTitle } from "@/lib/events/presentation";
import {
  formatSpeakerNames,
  hasRenderableSpeakerName,
  isTbaSpeakerName,
  primarySpeakerName,
  resolveSpeakerLinks,
  speakerPathSegment,
} from "@/lib/events/speakers";
import { useIsRole } from "@/lib/redux/hooks/useIsRole";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatEventDateUTC } from "@/lib/utils/locale";

interface Speaker {
  speakerIds?: string[];
  photoUrls?: (string | undefined)[];
  name: string | string[];
  company?: string | string[];
  topic: string;
  description?: string;
  startTime?: string;
  profileId?: string | string[];
  url?: string | string[];
  recordingId?: string;
  recordingHref?: string;
  group?: { id: string; name: string; url?: string };
}

interface EventLinks {
  luma?: string;
  facebook?: string;
  eventbrite?: string;
}

interface EventDetailContentProps {
  id: string;
  title: string;
  episode?: string;
  location: LocationValue;
  date: string;
  time: string;
  venue: string;
  description: string;
  speakers: Speaker[];
  links?: EventLinks;
  shortPath?: string;
}

const DEFAULT_EVENT_DURATION_MINUTES = 120;

function getSurveyCtaPresentation(
  color: string,
  mode: "solid" | "soft",
): { className: string; style: CSSProperties } {
  if (mode === "solid") {
    return {
      className:
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4.5 py-2.5 text-sm font-semibold text-white transition-[transform,filter,box-shadow] hover:brightness-105 active:scale-[0.99]",
      style: {
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
        boxShadow: `0 14px 30px -16px ${color}80`,
      },
    };
  }

  return {
    className:
      "inline-flex items-center justify-center gap-2 rounded-2xl border px-4.5 py-2.5 text-sm font-semibold transition-[transform,filter,box-shadow] hover:brightness-105 active:scale-[0.99] dark:text-white",
    style: {
      background: `${color}0d`,
      borderColor: `${color}55`,
      color,
      boxShadow: `0 12px 24px -18px ${color}66`,
    },
  };
}

function formatCalendarDate({
  year,
  month,
  day,
  hour,
  minute,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}) {
  const pad = (value: number, length = 2) => value.toString().padStart(length, "0");
  return `${pad(year, 4)}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
}

function addMinutes(
  value: { year: number; month: number; day: number; hour: number; minute: number },
  minutes: number,
) {
  const date = new Date(Date.UTC(value.year, value.month - 1, value.day, value.hour, value.minute));
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
}

function escapeIcsValue(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;")
    .replaceAll("\n", "\\n");
}

function buildGoogleCalendarUrl({
  title,
  description,
  venue,
  start,
  end,
}: {
  title: string;
  description: string;
  venue: string;
  start: string;
  end: string;
}) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details: description,
    location: venue,
    ctz: DEFAULT_TIMEZONE,
  });

  return `${WEBSITE_URLS.GOOGLE.CALENDAR_RENDER}?${params.toString()}`;
}

export function EventDetailContent({
  id,
  title,
  episode,
  location,
  date,
  time,
  venue,
  description,
  speakers,
  links,
  shortPath,
}: EventDetailContentProps) {
  const t = useTranslations("events");
  const locale = useLocale();
  const isCrew = useIsRole(USER_ROLES.CREW);
  const [hasMounted, setHasMounted] = useState(false);
  const now = useRenderNow();
  const parsedTitle = parseEventTitle(title);
  const isTba = isTbaDate(date);
  const isPastEvent = now ? isEventPast({ date, time }, now) : false;
  const formattedDate = !isTba ? formatEventDateUTC(date, locale) : t("tba");
  const daysUntil = now ? getDaysUntilEventDate(date, now) : null;
  let countdownLabel: string | null = null;
  if (daysUntil === 0) {
    countdownLabel = t("countdownToday");
  } else if (daysUntil === 1) {
    countdownLabel = t("countdownTomorrow");
  } else if (daysUntil !== null) {
    countdownLabel = t("countdownDays", { count: daysUntil.toString() });
  }

  const calendarDateTime = !isTba ? parseEventDateTimeParts(date, time) : null;
  const calendarStart = calendarDateTime ? formatCalendarDate(calendarDateTime) : null;
  const calendarEnd = calendarDateTime
    ? formatCalendarDate(addMinutes(calendarDateTime, DEFAULT_EVENT_DURATION_MINUTES))
    : null;
  const shareUrl = `${WEBSITE_URLS.BASE}${shortPath ?? PAGE_ROUTES.EVENT(id)}`;
  const crewToolButtonClass =
    "w-full justify-center border-orange-200/70 bg-white/72 text-neutral-700 ring-orange-950/5 hover:bg-white/92 sm:justify-start dark:border-white/10 dark:bg-white/[0.06] dark:text-neutral-200 dark:ring-white/10 dark:hover:bg-white/[0.1]";
  const googleCalendarUrl =
    calendarStart && calendarEnd
      ? buildGoogleCalendarUrl({
          title,
          description,
          venue,
          start: calendarStart,
          end: calendarEnd,
        })
      : null;

  const isPrague = location === LOCATIONS.PRAGUE;
  const loc = isPrague
    ? {
        color: "#dc2626",
        colorLight: "#f87171",
        glow: "from-red-400/20 to-rose-500/10",
        badge: "bg-gradient-to-r from-rose-500 via-orange-500 to-red-500 shadow-rose-500/30",
        sectionIcon: "bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/25",
        rail: "bg-gradient-to-r from-rose-500 via-orange-500 to-red-500",
        divider: "via-rose-400/40 dark:via-rose-500/25",
        titleGradient:
          "from-rose-600 via-red-500 to-orange-500 dark:from-rose-400 dark:via-red-400 dark:to-orange-400",
        titleShadow: "0 0 40px rgba(244, 63, 94, 0.15), 0 0 80px rgba(244, 63, 94, 0.05)" as string,
        titleShadowDark:
          "0 0 40px rgba(244, 63, 94, 0.25), 0 0 80px rgba(244, 63, 94, 0.1)" as string,
      }
    : {
        color: "#2563eb",
        colorLight: "#60a5fa",
        glow: "from-blue-400/20 to-indigo-500/10",
        badge: "bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 shadow-blue-500/30",
        sectionIcon: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25",
        rail: "bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600",
        divider: "via-blue-400/40 dark:via-blue-500/25",
        titleGradient:
          "from-blue-600 via-indigo-500 to-violet-500 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400",
        titleShadow: "0 0 40px rgba(37, 99, 235, 0.15), 0 0 80px rgba(37, 99, 235, 0.05)" as string,
        titleShadowDark:
          "0 0 40px rgba(59, 130, 246, 0.25), 0 0 80px rgba(59, 130, 246, 0.1)" as string,
      };
  const shouldShowEpisodeBadge =
    Boolean(episode) &&
    episode !== title &&
    parsedTitle?.prefix.trim().toLowerCase() !== episode?.trim().toLowerCase();
  const wrapUpSurveyCta = getSurveyCtaPresentation(loc.color, "solid");
  const closedSurveyCta = getSurveyCtaPresentation(loc.color, "soft");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const platformLinks = [
    {
      key: "luma",
      label: t("platforms.luma"),
      url: links?.luma,
      icon: LumaIcon,
      gradient: "from-rose-500 via-red-600 to-rose-600",
      shadow: "shadow-rose-500/30",
    },
    {
      key: "facebook",
      label: t("platforms.facebook"),
      url: links?.facebook,
      icon: FacebookIcon,
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      shadow: "shadow-blue-500/30",
    },
    {
      key: "eventbrite",
      label: t("platforms.eventbrite"),
      url: links?.eventbrite,
      icon: EventbriteIcon,
      gradient: "from-orange-500 via-orange-600 to-red-500",
      shadow: "shadow-orange-500/30",
    },
  ].filter((link) => link.url && link.url.length > 0);

  const visibleSpeakers = speakers.filter((speaker) => hasRenderableSpeakerName(speaker.name));
  const hasSpeakers = visibleSpeakers.length > 0;
  const talkOptions = speakers
    .map((speaker, index) => ({
      key: speaker.recordingId ?? `${primarySpeakerName(speaker.name)}-${index}`,
      topic: speaker.topic.trim(),
    }))
    .filter((item) => item.topic.length > 0);

  const handleDownloadCalendar = () => {
    if (!calendarDateTime || !calendarStart || !calendarEnd) {
      return;
    }

    const dtStamp = new Date()
      .toISOString()
      .replace(/\.\d{3}Z$/u, "Z")
      .replace(/[-:]/gu, "");
    const uid = `${id}@bonfire.events`;
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Bonfire//Events//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;TZID=${DEFAULT_TIMEZONE}:${calendarStart}`,
      `DTEND;TZID=${DEFAULT_TIMEZONE}:${calendarEnd}`,
      `SUMMARY:${escapeIcsValue(title)}`,
      `DESCRIPTION:${escapeIcsValue(description)}`,
      `LOCATION:${escapeIcsValue(venue)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const fileSafeTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, "-")
      .replace(/(?<trim>(?:^-|-$))/gu, "");
    anchor.href = url;
    anchor.download = `${fileSafeTitle || "bonfire-event"}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative flex-1">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className={`absolute -top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br ${loc.glow} opacity-60 blur-[100px]`}
        />
        <div
          className={`absolute -bottom-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr ${loc.glow} opacity-40 blur-[100px]`}
        />
      </div>

      <div className="relative z-10">
        <div className="relative overflow-hidden px-4 pt-28 pb-6 sm:pt-32 sm:pb-8">
          <div className="mx-auto max-w-5xl text-center">
            {shouldShowEpisodeBadge && (
              <div className="mb-5 flex justify-center">
                <span
                  className={`inline-flex items-center gap-2 rounded-full ${loc.badge} px-4 py-2 text-sm font-bold text-white shadow-lg`}
                >
                  <SparklesIcon className="h-4 w-4" />
                  {t("episodeLabel")} {episode}
                </span>
              </div>
            )}

            {parsedTitle ? (
              <h1 className="mb-5">
                <span className="eyebrow mb-3 block text-sm text-neutral-400 sm:text-base dark:text-neutral-500">
                  {parsedTitle.prefix}
                </span>
                <span className="relative inline-block">
                  <span
                    className={`bg-gradient-to-r bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl ${loc.titleGradient}`}
                  >
                    {parsedTitle.subtitle}
                  </span>
                  <span
                    className="pointer-events-none absolute inset-0 -z-10 blur-2xl select-none"
                    aria-hidden="true"
                  >
                    <span
                      className={`bg-gradient-to-r bg-clip-text text-4xl font-extrabold tracking-tight text-transparent opacity-30 sm:text-5xl md:text-6xl lg:text-7xl dark:opacity-40 ${loc.titleGradient}`}
                    >
                      {parsedTitle.subtitle}
                    </span>
                  </span>
                </span>
              </h1>
            ) : (
              <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
                {title}
              </h1>
            )}

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
              {description}
            </p>

            {isPastEvent && (
              <div className="mx-auto mt-8 max-w-3xl">
                <div
                  className="surface relative overflow-hidden p-6 text-left sm:p-8"
                  style={{ borderColor: `${loc.color}40` }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 dark:hidden"
                    style={{
                      background: `linear-gradient(135deg, ${loc.color}16 0%, ${loc.color}08 45%, transparent 100%)`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 hidden dark:block"
                    style={{
                      background: `linear-gradient(135deg, ${loc.color}24 0%, ${loc.color}12 45%, rgba(10,10,12,0.55) 100%)`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl"
                    style={{ background: `${loc.color}33` }}
                  />
                  <div
                    className="pointer-events-none absolute -bottom-14 -left-14 h-36 w-36 rounded-full blur-3xl"
                    style={{ background: `${loc.color}20` }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl ring-1"
                    style={{ boxShadow: `inset 0 0 0 1px ${loc.color}25` }}
                  />

                  <div className="relative">
                    <div className="flex flex-col gap-5 sm:gap-6 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                      <div className="min-w-0">
                        <p
                          className="text-2xs tracking-label-sm mb-4 font-semibold uppercase"
                          style={{ color: loc.color }}
                        >
                          {t("wrapUpEyebrow")}
                        </p>

                        <div
                          className="border-l-2 pl-4 sm:pl-5"
                          style={{ borderColor: `${loc.color}55` }}
                        >
                          <h2 className="max-w-2xl text-2xl leading-[1.02] font-black tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                            {t("wrapUpTitle")}
                          </h2>
                          <p className="mt-3 max-w-2xl text-neutral-700 dark:text-neutral-200">
                            {t("wrapUpDescription")}
                          </p>
                        </div>
                      </div>

                      <div className="md:self-end">
                        <Link
                          href={PAGE_ROUTES.EVENT_SURVEY_WITH_EVENT(id)}
                          className={wrapUpSurveyCta.className}
                          style={wrapUpSurveyCta.style}
                        >
                          {t("wrapUpSurveyCta")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2.5">
              <div className="glass flex items-center gap-2 rounded-2xl px-3.5 py-2">
                <CalendarIcon className="h-[18px] w-[18px]" style={{ color: loc.color }} />
                <span
                  suppressHydrationWarning={!hasMounted}
                  className="text-sm font-semibold text-neutral-900 dark:text-white"
                >
                  {formattedDate}
                </span>
              </div>
              <div className="glass flex items-center gap-2 rounded-2xl px-3.5 py-2">
                <ClockIcon className="h-[18px] w-[18px]" style={{ color: loc.color }} />
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {time}
                </span>
              </div>
              <div className="glass flex items-center gap-2 rounded-2xl px-3.5 py-2">
                <CurrencyDollarIcon className="h-[18px] w-[18px]" style={{ color: loc.color }} />
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {t("freeEntryShort")}
                </span>
              </div>
              <a
                href={getGoogleMapsSearchUrl(venue)}
                target="_blank"
                rel="noopener noreferrer"
                className="glass group flex items-center gap-2 rounded-2xl px-3.5 py-2 transition-colors"
              >
                <MapPinIcon className="h-[18px] w-[18px]" style={{ color: loc.color }} />
                <span
                  className={`text-sm font-semibold text-neutral-900 ${isPrague ? "group-hover:text-red-600" : "group-hover:text-blue-600"} dark:text-white`}
                >
                  {venue.split(",")[0]}
                </span>
                <ExternalLinkIcon className="h-3.5 w-3.5 text-neutral-400 transition-colors group-hover:text-neutral-600 dark:text-neutral-500" />
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className={`h-px bg-gradient-to-r from-transparent ${loc.divider} to-transparent`} />
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-16">
          {hasSpeakers && (
            <section aria-labelledby="event-programme-heading">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-2xs text-neutral-500 dark:text-neutral-400">
                    {t("eventFlow")}
                  </p>
                  <h2
                    id="event-programme-heading"
                    className="mt-1 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
                  >
                    {t("speakers")}
                  </h2>
                </div>
                <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                  {t("talkCount", { count: visibleSpeakers.length })}
                </span>
              </div>

              <ol>
                {visibleSpeakers.map((speaker, index) => {
                  const slotTime = speaker.startTime?.trim() ?? "";
                  const isLast = index === visibleSpeakers.length - 1;
                  const people = resolveSpeakerLinks(speaker);

                  return (
                    <li
                      key={`${formatSpeakerNames(speaker.name)}-${speaker.topic}`}
                      className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[4.5rem_1.25rem_minmax(0,1fr)] sm:gap-x-5"
                    >
                      <p className="hidden pt-0.5 text-right font-mono text-lg font-bold text-neutral-900 tabular-nums sm:block dark:text-white">
                        {slotTime}
                      </p>

                      <div className="relative flex justify-center" aria-hidden="true">
                        <span
                          className={`absolute top-3 w-px ${isLast ? "h-12 bg-gradient-to-b from-neutral-300 to-transparent dark:from-white/20" : "bottom-0 bg-neutral-300 dark:bg-white/20"}`}
                        />
                        <span
                          className="relative mt-2 h-3 w-3 rounded-full ring-4 ring-neutral-50 dark:ring-neutral-950"
                          style={{ background: loc.color }}
                        />
                      </div>

                      <div className={isLast ? "pb-2" : "pb-10"}>
                        {slotTime.length > 0 && (
                          <p className="mb-1 font-mono text-sm font-bold text-neutral-500 tabular-nums sm:hidden dark:text-neutral-400">
                            {slotTime}
                          </p>
                        )}
                        <h3 className="text-xl font-bold tracking-tight text-balance text-neutral-900 sm:text-2xl dark:text-white">
                          {speaker.topic}
                        </h3>

                        {speaker.description?.trim() && (
                          <p className="mt-2 max-w-[62ch] text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                            {speaker.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                          {speaker.group && (
                            <Link
                              href={PAGE_ROUTES.SPEAKER(
                                speakerPathSegment(speaker.group.name, speaker.group.id),
                              )}
                              className="text-link text-sm font-bold text-neutral-900 dark:text-white"
                            >
                              {speaker.group.name}
                            </Link>
                          )}
                          {people.map((person, personIndex) => {
                            const speakerHref =
                              person.slug && !isTbaSpeakerName(person.name)
                                ? PAGE_ROUTES.SPEAKER(person.slug)
                                : undefined;
                            const body = (
                              <>
                                <SpeakerPhoto
                                  name={person.name}
                                  photoUrl={speaker.photoUrls?.[personIndex]}
                                  sizes="40px"
                                  className="w-10 shrink-0"
                                  initialsClassName="text-xs"
                                />
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold text-neutral-900 group-hover:underline dark:text-white">
                                    {person.name}
                                  </span>
                                  {person.company && (
                                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                                      {person.company}
                                    </span>
                                  )}
                                </span>
                              </>
                            );

                            return speakerHref ? (
                              <Link
                                key={person.name}
                                href={speakerHref}
                                className="group flex items-center gap-3"
                              >
                                {body}
                              </Link>
                            ) : (
                              <div key={person.name} className="flex items-center gap-3">
                                {body}
                              </div>
                            );
                          })}
                          {isPastEvent && speaker.recordingHref && (
                            <a
                              href={speaker.recordingHref}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-75"
                              style={{ color: loc.color }}
                            >
                              <PlayIcon className="h-4 w-4" />
                              {t("watchNow")}
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </div>

        {!isTba && (
          <div className="mx-auto max-w-5xl px-4 pb-10">
            {isCrew && (
              <div className="shadow-floating dark:shadow-raised mb-4 rounded-2xl border border-orange-200/60 bg-[linear-gradient(180deg,rgba(255,248,242,0.96)_0%,rgba(255,244,236,0.9)_100%)] p-4 sm:p-5 dark:border-orange-300/12 dark:bg-[linear-gradient(180deg,rgba(28,22,18,0.72)_0%,rgba(18,15,13,0.58)_100%)]">
                <p className="text-2xs tracking-label-sm font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                  {t("crewToolsEyebrow")}
                </p>
                <h3 className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {t("crewToolsTitle")}
                </h3>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <Button
                    href={PAGE_ROUTES.EVENT_QUESTIONS(id)}
                    variant="secondary"
                    size="sm"
                    className={crewToolButtonClass}
                  >
                    <QuestionMarkCircleIcon className="h-4 w-4" />
                    {t("openCrewQuestionsFeed")}
                  </Button>
                  <Button
                    href={PAGE_ROUTES.EVENT_READER_WITH_EVENT(id)}
                    variant="secondary"
                    size="sm"
                    className={crewToolButtonClass}
                  >
                    <QrCodeIcon className="h-4 w-4" />
                    {t("openTicketScanner")}
                  </Button>
                </div>
              </div>
            )}
            <CommunityQuestionsPanel
              eventId={id}
              theme={PANEL_THEMES[location] ?? DEFAULT_PANEL_THEME}
              talkOptions={talkOptions}
            />
          </div>
        )}

        <div className="mx-auto max-w-5xl px-4 pb-8">
          <div className="section-divider" />
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-24">
          <div className="grid items-start gap-6 lg:grid-cols-5 lg:gap-8">
            <div className="lg:col-span-3">
              <div
                className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
                style={{
                  background: `linear-gradient(135deg, ${loc.color}08 0%, ${loc.color}04 100%)`,
                }}
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 ${loc.rail}`} />

                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl ring-1"
                  style={{ boxShadow: `inset 0 0 0 1px ${loc.color}18` }}
                />

                <div className="relative">
                  <div className="mb-1 flex items-center gap-2.5">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: `${loc.color}15` }}
                    >
                      <SparklesIcon className="h-5 w-5" style={{ color: loc.color }} />
                    </div>
                    <p className="eyebrow text-2xs text-neutral-500 dark:text-neutral-400">
                      {isTba ? t("saveTheDate") : t("joinUs")}
                    </p>
                  </div>

                  <h3
                    className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${
                      isPrague
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-900 dark:text-white"
                    }`}
                  >
                    {isTba ? t("saveTheDate") : t("registerNow")}
                  </h3>

                  <p className="mt-2 max-w-lg text-neutral-600 dark:text-neutral-300">
                    {isTba ? t("tbaDescription") : t("registerDescription", { location })}
                  </p>

                  {!isTba && !isPastEvent && countdownLabel && (
                    <Pill
                      size="sm"
                      className="mt-4 gap-2 border border-neutral-200/80 bg-white/80 font-semibold text-neutral-700 dark:border-white/10 dark:bg-white/10 dark:text-neutral-200"
                    >
                      <ClockIcon className="h-3.5 w-3.5" style={{ color: loc.color }} />
                      <span>{countdownLabel}</span>
                    </Pill>
                  )}

                  <div className="mt-8">
                    {isPastEvent ? (
                      <div className="border-l-2 pl-4" style={{ borderColor: `${loc.color}55` }}>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {t("rsvpClosedTitle")}
                        </p>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                          {t("rsvpClosedDescription")}
                        </p>
                        <div className="mt-3">
                          <Link
                            href={PAGE_ROUTES.EVENT_SURVEY_WITH_EVENT(id)}
                            className={closedSurveyCta.className}
                            style={closedSurveyCta.style}
                          >
                            <SparklesIcon className="h-4 w-4" />
                            {t("rsvpClosedSurveyCta")}
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <RsvpSection eventId={id} />
                    )}
                  </div>

                  {platformLinks.length > 0 && (
                    <div className="mt-6 border-t border-neutral-200/40 pt-5 dark:border-white/10">
                      <p className="text-2xs tracking-label-sm mb-2.5 font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                        {t("orRegisterVia")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {platformLinks.map((platform) => (
                          <a
                            key={platform.key}
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline group text-2xs gap-1.5 rounded-lg px-3 py-1.5"
                          >
                            <platform.icon className="h-3.5 w-3.5 opacity-70" />
                            <span>{platform.label}</span>
                            <ExternalLinkIcon className="h-2.5 w-2.5 opacity-30 group-hover:opacity-60" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {platformLinks.length === 0 && isTba && (
                    <div
                      className="mt-8 rounded-2xl border-2 border-dashed p-6 text-center"
                      style={{
                        borderColor: `${loc.color}40`,
                        background: `${loc.color}06`,
                      }}
                    >
                      <SparklesIcon className="mx-auto mb-3 h-8 w-8" style={{ color: loc.color }} />
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {t("stayTuned")}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {t("registrationOpensSoon")}
                      </p>
                    </div>
                  )}

                  {googleCalendarUrl && calendarStart && calendarEnd && (
                    <div className="mt-6 border-t border-neutral-200/40 pt-5 dark:border-white/10">
                      <p className="text-2xs tracking-label-sm mb-2.5 font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                        {t("addToCalendar")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          href={googleCalendarUrl}
                          external
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="secondary"
                          size="sm"
                        >
                          {t("googleCalendar")}
                        </Button>
                        <Button onClick={handleDownloadCalendar} variant="secondary" size="sm">
                          {t("downloadIcs")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <ShareEventButton
                  sectionTitle={t("shareEvent")}
                  title={title}
                  copyLabel={t("copyLink")}
                  copiedLabel={t("copied")}
                  shareLabel={t("shareNow")}
                  shareXLabel={t("shareOnX")}
                  shareLinkedInLabel={t("shareOnLinkedIn")}
                  shareMessage={t("shareMessage", { title })}
                  shareUrl={shareUrl}
                />
              </div>
            </div>

            <div className="lg:sticky lg:top-24 lg:col-span-2">
              <div className="self-start lg:pt-2">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {t("venueTitle")}
                  </h3>
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
                    style={{ background: `${loc.color}12` }}
                  >
                    <div className="h-2 w-2 rounded-full" style={{ background: loc.color }} />
                    <span
                      className="text-xs font-bold tracking-wide uppercase"
                      style={{ color: loc.color }}
                    >
                      {location}
                    </span>
                  </div>
                </div>

                <a
                  href={getGoogleMapsSearchUrl(venue)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3"
                >
                  <div
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
                    style={{ background: `${loc.color}12` }}
                  >
                    <MapPinIcon className="h-5 w-5" style={{ color: loc.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold text-neutral-900 transition-colors ${isPrague ? "group-hover:text-red-600" : "group-hover:text-blue-600"} dark:text-white`}
                    >
                      {venue}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {t("openInMaps")}
                    </p>
                  </div>
                </a>

                <dl className="mt-5 divide-y divide-neutral-200/60 border-t border-neutral-200/60 text-sm dark:divide-white/10 dark:border-white/10">
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <CalendarIcon className="h-4 w-4" style={{ color: loc.color }} />
                      {t("dateLabel")}
                    </dt>
                    <dd className="text-right font-semibold text-neutral-900 dark:text-white">
                      {formattedDate}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <ClockIcon className="h-4 w-4" style={{ color: loc.color }} />
                      {t("timeLabel")}
                    </dt>
                    <dd className="font-semibold text-neutral-900 dark:text-white">{time}</dd>
                  </div>
                  {visibleSpeakers.length > 0 && (
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                        <MicIcon className="h-4 w-4" style={{ color: loc.color }} />
                        {t("speakers")}
                      </dt>
                      <dd className="font-semibold text-neutral-900 dark:text-white">
                        {t("talkCount", { count: visibleSpeakers.length })}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="border-t border-neutral-200/60 pt-5 dark:border-white/10">
                  <p className="mb-3 text-sm font-bold tracking-wide" style={{ color: loc.color }}>
                    {t("goodToKnow")}
                  </p>
                  <ul className="space-y-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                    <li className="flex gap-2.5">
                      <span
                        className="mt-1.5 h-2 w-2 flex-none rounded-full"
                        style={{ background: loc.color }}
                      />
                      <span>{t("noteFreeEntry")}</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span
                        className="mt-1.5 h-2 w-2 flex-none rounded-full"
                        style={{ background: loc.color }}
                      />
                      <span>{t("noteFlexibleTimeline")}</span>
                    </li>
                  </ul>
                </div>

                {(() => {
                  const partners = getLocationPartners(location, date);
                  if (partners.length === 0) {
                    return null;
                  }
                  return (
                    <div className="mt-5 border-t border-neutral-200/50 pt-5 dark:border-neutral-700/50">
                      <p className="eyebrow text-2xs mb-2.5 text-neutral-500 dark:text-neutral-400">
                        {t("partners")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {partners.map((partner) => (
                          <a
                            key={partner.name}
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center rounded-lg bg-neutral-900/85 px-2.5 py-1.5 ring-1 ring-black/20 transition-opacity hover:opacity-80 dark:bg-white/5 dark:ring-white/10"
                            aria-label={partner.name}
                          >
                            <Image
                              src={partner.logo}
                              alt={partner.name}
                              width={100}
                              height={32}
                              className={`h-4 w-auto object-contain opacity-90 ${partner.logoClassName ?? ""}`}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
