"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

import { RsvpSection } from "@/components/events/RsvpSection";
import { ShareEventButton } from "@/components/events/ShareEventButton";
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
  SparklesIcon,
} from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { isEventPast, isTbaDate, parseEventDateTimeParts } from "@/data/events-calendar";
import { getLocationPartners } from "@/data/location-partners";
import {
  DEFAULT_TIMEZONE,
  LOCATIONS,
  WEBSITE_URLS,
  type LocationValue,
} from "@/lib/config/constants";
import { getDaysUntilEventDate } from "@/lib/events/datetime";
import { getGoogleMapsSearchUrl } from "@/lib/events/links";
import {
  formatSpeakerNameWithCompany,
  formatSpeakerNames,
  primarySpeakerName,
  resolveSpeakerLinks,
} from "@/lib/events/speakers";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatEventDateUTC } from "@/lib/utils/locale";

interface Speaker {
  name: string | string[];
  company?: string | string[];
  topic: string;
  startTime?: string;
  profileId?: string | string[];
  url?: string | string[];
  recordingId?: string;
  recordingHref?: string;
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

const SPEAKER_PALETTES = [
  {
    card: "border-rose-200/70 from-rose-50/90 to-red-50/70 dark:border-rose-500/20 dark:from-rose-500/12 dark:to-red-500/10",
    icon: "from-rose-500 to-red-600 shadow-rose-500/25 dark:shadow-rose-500/20",
    topic: "text-rose-700 dark:text-rose-200",
    rail: "from-rose-500 to-red-500",
    orb: "bg-rose-300/45 dark:bg-rose-400/30",
    glow: "hover:shadow-rose-500/20 dark:hover:shadow-rose-500/15",
    watermark: "text-rose-200/30 dark:text-rose-400/10",
    ring: "ring-rose-500/20 dark:ring-rose-400/15",
  },
  {
    card: "border-orange-200/70 from-orange-50/90 to-rose-50/70 dark:border-orange-500/20 dark:from-orange-500/12 dark:to-rose-500/10",
    icon: "from-orange-500 to-rose-600 shadow-orange-500/25 dark:shadow-orange-500/20",
    topic: "text-orange-700 dark:text-orange-200",
    rail: "from-orange-500 to-rose-500",
    orb: "bg-orange-300/45 dark:bg-orange-400/30",
    glow: "hover:shadow-orange-500/20 dark:hover:shadow-orange-500/15",
    watermark: "text-orange-200/30 dark:text-orange-400/10",
    ring: "ring-orange-500/20 dark:ring-orange-400/15",
  },
  {
    card: "border-amber-200/70 from-amber-50/90 to-orange-50/70 dark:border-amber-500/20 dark:from-amber-500/12 dark:to-orange-500/10",
    icon: "from-amber-500 to-orange-600 shadow-amber-500/25 dark:shadow-amber-500/20",
    topic: "text-amber-700 dark:text-amber-200",
    rail: "from-amber-500 to-orange-500",
    orb: "bg-amber-300/45 dark:bg-amber-400/30",
    glow: "hover:shadow-amber-500/20 dark:hover:shadow-amber-500/15",
    watermark: "text-amber-200/30 dark:text-amber-400/10",
    ring: "ring-amber-500/20 dark:ring-amber-400/15",
  },
  {
    card: "border-red-200/70 from-red-50/90 to-orange-50/70 dark:border-red-500/20 dark:from-red-500/12 dark:to-orange-500/10",
    icon: "from-red-500 to-orange-600 shadow-red-500/25 dark:shadow-red-500/20",
    topic: "text-red-700 dark:text-red-200",
    rail: "from-red-500 to-orange-500",
    orb: "bg-red-300/45 dark:bg-red-400/30",
    glow: "hover:shadow-red-500/20 dark:hover:shadow-red-500/15",
    watermark: "text-red-200/30 dark:text-red-400/10",
    ring: "ring-red-500/20 dark:ring-red-400/15",
  },
  {
    card: "border-rose-200/70 from-rose-50/90 to-amber-50/70 dark:border-rose-500/20 dark:from-rose-500/12 dark:to-amber-500/10",
    icon: "from-rose-500 to-amber-500 shadow-rose-500/25 dark:shadow-rose-500/20",
    topic: "text-rose-700 dark:text-rose-200",
    rail: "from-rose-500 to-amber-500",
    orb: "bg-rose-300/45 dark:bg-rose-400/30",
    glow: "hover:shadow-rose-500/20 dark:hover:shadow-rose-500/15",
    watermark: "text-rose-200/30 dark:text-rose-400/10",
    ring: "ring-rose-500/20 dark:ring-rose-400/15",
  },
] as const;

const SPEAKER_CARD_DIRECTIONS = [
  "bg-gradient-to-br",
  "bg-gradient-to-r",
  "bg-gradient-to-bl",
] as const;
const SPEAKER_ICON_DIRECTIONS = [
  "bg-gradient-to-br",
  "bg-gradient-to-tr",
  "bg-gradient-to-r",
] as const;
const SPEAKER_ICON_SHAPES = ["rounded-xl", "rounded-2xl", "rounded-[14px]"] as const;

function hashSpeakerSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getSpeakerAccent(speaker: Speaker, location: LocationValue) {
  const seed = `${primarySpeakerName(speaker.name).trim().toLowerCase()}|${speaker.topic.trim().toLowerCase()}|${location}`;
  const hash = hashSpeakerSeed(seed);
  const palette = SPEAKER_PALETTES[hash % SPEAKER_PALETTES.length] ?? SPEAKER_PALETTES[0];
  const cardDirection =
    SPEAKER_CARD_DIRECTIONS[(hash >>> 3) % SPEAKER_CARD_DIRECTIONS.length] ??
    SPEAKER_CARD_DIRECTIONS[0];
  const iconDirection =
    SPEAKER_ICON_DIRECTIONS[(hash >>> 6) % SPEAKER_ICON_DIRECTIONS.length] ??
    SPEAKER_ICON_DIRECTIONS[0];
  const iconShape =
    SPEAKER_ICON_SHAPES[(hash >>> 9) % SPEAKER_ICON_SHAPES.length] ?? SPEAKER_ICON_SHAPES[0];

  return {
    cardClassName: `relative overflow-hidden border ${cardDirection} ${palette.card}`,
    iconClassName: `flex h-14 w-14 flex-none items-center justify-center ${iconShape} ${iconDirection} ${palette.icon} text-base font-black text-white shadow-lg`,
    iconLargeClassName: `flex h-20 w-20 flex-none items-center justify-center rounded-2xl ${iconDirection} ${palette.icon} text-2xl font-black text-white shadow-xl ring-4 ${palette.ring}`,
    topicClassName: `text-sm ${palette.topic}`,
    topicHeadingClassName: `text-xl font-extrabold leading-tight sm:text-2xl ${palette.topic}`,
    topicFeaturedClassName: `text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl ${palette.topic}`,
    railClassName: `bg-gradient-to-r ${palette.rail}`,
    orbClassName: palette.orb,
    glowClassName: palette.glow,
    watermarkClassName: palette.watermark,
  };
}

function getSpeakerInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
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
  const isTba = isTbaDate(date);
  const isPastEvent = isEventPast({ date, time }, new Date());
  const formattedDate = !isTba ? formatEventDateUTC(date, locale) : t("tba");
  const daysUntil = getDaysUntilEventDate(date);
  const countdownLabel =
    daysUntil === null
      ? null
      : daysUntil === 0
        ? t("countdownToday")
        : daysUntil === 1
          ? t("countdownTomorrow")
          : t("countdownDays", { count: daysUntil.toString() });

  const calendarDateTime = !isTba ? parseEventDateTimeParts(date, time) : null;
  const calendarStart = calendarDateTime ? formatCalendarDate(calendarDateTime) : null;
  const calendarEnd = calendarDateTime
    ? formatCalendarDate(addMinutes(calendarDateTime, DEFAULT_EVENT_DURATION_MINUTES))
    : null;
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

  const hasSpeakers = speakers.some(
    (speaker) => primarySpeakerName(speaker.name).trim().length > 0,
  );
  const confirmedSpeakers = speakers.filter((speaker) => {
    const primary = primarySpeakerName(speaker.name).trim();
    return primary.length > 0 && primary !== "TBA";
  });
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
      .replace(/\.\d{3}Z$/, "Z")
      .replace(/[-:]/g, "");
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
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
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
            {episode && (
              <div className="mb-5 flex justify-center">
                <span
                  className={`inline-flex items-center gap-2 rounded-full ${loc.badge} px-4 py-2 text-sm font-bold text-white shadow-lg`}
                >
                  <SparklesIcon className="h-4 w-4" />
                  {t("episodeLabel")} {episode}
                </span>
              </div>
            )}

            {(() => {
              const separatorMatch = title.match(/^(.+?)\s*[-–—:]\s*(.+)$/);
              if (separatorMatch) {
                const [, prefix, subtitle] = separatorMatch;
                return (
                  <h1 className="mb-5">
                    <span className="mb-3 block text-sm font-bold tracking-[0.2em] text-neutral-400 uppercase sm:text-base dark:text-neutral-500">
                      {prefix}
                    </span>
                    <span className="relative inline-block">
                      <span
                        className={`bg-gradient-to-r bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl ${loc.titleGradient}`}
                      >
                        {subtitle}
                      </span>
                      <span
                        className="pointer-events-none absolute inset-0 -z-10 blur-2xl select-none"
                        aria-hidden="true"
                      >
                        <span
                          className={`bg-gradient-to-r bg-clip-text text-4xl font-extrabold tracking-tight text-transparent opacity-30 sm:text-5xl md:text-6xl lg:text-7xl dark:opacity-40 ${loc.titleGradient}`}
                        >
                          {subtitle}
                        </span>
                      </span>
                    </span>
                  </h1>
                );
              }
              return (
                <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
                  {title}
                </h1>
              );
            })()}

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
              {description}
            </p>

            {isPastEvent && (
              <div className="mx-auto mt-8 max-w-3xl">
                <div
                  className="relative overflow-hidden rounded-3xl border bg-white/75 p-6 text-left backdrop-blur-sm sm:p-8 dark:bg-neutral-900/40"
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
                    className="pointer-events-none absolute inset-0 rounded-3xl ring-1"
                    style={{ boxShadow: `inset 0 0 0 1px ${loc.color}25` }}
                  />

                  <div className="relative">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-neutral-700 uppercase ring-1 ring-black/5 dark:bg-black/20 dark:text-neutral-200 dark:ring-white/10">
                      <SparklesIcon className="h-3.5 w-3.5" style={{ color: loc.color }} />
                      {t("wrapUpEyebrow")}
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                      {t("wrapUpTitle")}
                    </h2>
                    <p className="mt-2 max-w-2xl text-neutral-700 dark:text-neutral-200">
                      {t("wrapUpDescription")}
                    </p>
                    <div className="mt-5">
                      <Button href={PAGE_ROUTES.CONTACT} variant="secondary" size="sm">
                        {t("wrapUpCta")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2.5">
              <div className="glass flex items-center gap-2 rounded-2xl px-3.5 py-2">
                <CalendarIcon className="h-[18px] w-[18px]" style={{ color: loc.color }} />
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
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
            <div className="relative">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${loc.sectionIcon}`}
                  >
                    <MicIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
                      {t("eventFlow")}
                    </p>
                    <h2 className="text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                      {t("speakers")}
                    </h2>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full border border-neutral-200/70 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:border-white/10 dark:bg-white/10 dark:text-neutral-200">
                  {t("talkCount", { count: confirmedSpeakers.length })}
                </span>
              </div>

              {confirmedSpeakers.length > 0 && (
                <div
                  className={`grid gap-5 ${confirmedSpeakers.length === 1 ? "mx-auto max-w-xl" : "sm:grid-cols-2"}`}
                >
                  {confirmedSpeakers.map((speaker, index) => {
                    const accent = getSpeakerAccent(speaker, location);
                    const slotTime = speaker.startTime?.trim() ?? "";
                    const displayIndex = index + 1;

                    return (
                      <div
                        key={`${formatSpeakerNames(speaker.name)}-${speaker.topic}`}
                        className={`group rounded-3xl p-5 sm:p-6 ${accent.cardClassName}`}
                      >
                        <div
                          className={`absolute inset-x-0 top-0 h-1 rounded-t-3xl ${accent.railClassName}`}
                        />

                        <div
                          className={`pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl ${accent.orbClassName}`}
                        />

                        <div
                          className={`pointer-events-none absolute -right-2 -bottom-4 text-[120px] leading-none font-black select-none ${accent.watermarkClassName}`}
                        >
                          {displayIndex.toString().padStart(2, "0")}
                        </div>
                        <div className="relative mb-4 flex flex-wrap items-center justify-between gap-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-lg bg-black/5 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-neutral-700 uppercase dark:bg-white/10 dark:text-neutral-200">
                              #{displayIndex.toString().padStart(2, "0")}
                            </span>
                            {slotTime.length > 0 && (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-neutral-700 dark:bg-black/25 dark:text-neutral-200">
                                <ClockIcon className="h-2.5 w-2.5" />
                                {slotTime}
                              </span>
                            )}
                          </div>
                          {isPastEvent && speaker.recordingHref && (
                            <a
                              href={speaker.recordingHref}
                              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300/70 bg-white/70 px-2.5 py-1 text-[10px] font-semibold tracking-[0.06em] text-neutral-700 transition-all hover:border-neutral-400 hover:bg-white hover:text-neutral-900 dark:border-white/15 dark:bg-white/10 dark:text-neutral-200 dark:hover:border-white/25 dark:hover:bg-white/15 dark:hover:text-white"
                              style={{ boxShadow: `0 0 0 1px ${loc.color}22 inset` }}
                            >
                              <PlayIcon className="h-3 w-3" style={{ color: loc.color }} />
                              <span>{t("watchNow")}</span>
                            </a>
                          )}
                        </div>

                        <p className={`relative ${accent.topicHeadingClassName}`}>
                          {speaker.topic}
                        </p>

                        <div className="relative mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-black/5 pt-4 dark:border-white/10">
                          {resolveSpeakerLinks(speaker).map((resolved) => {
                            const profileHref = resolved.profileId
                              ? PAGE_ROUTES.USER(resolved.profileId)
                              : undefined;
                            const domain = resolved.url
                              ? new URL(resolved.url).hostname.replace(/^www\./, "")
                              : undefined;

                            return (
                              <div key={resolved.name} className="flex items-center gap-2.5">
                                {profileHref ? (
                                  <a
                                    href={profileHref}
                                    className="transition-opacity hover:opacity-80"
                                  >
                                    <div className={accent.iconClassName}>
                                      {getSpeakerInitials(resolved.name)}
                                    </div>
                                  </a>
                                ) : (
                                  <div className={accent.iconClassName}>
                                    {getSpeakerInitials(resolved.name)}
                                  </div>
                                )}
                                <div>
                                  {profileHref ? (
                                    <a
                                      href={profileHref}
                                      className="block font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-2 transition-colors hover:decoration-neutral-500 dark:text-white dark:decoration-neutral-600 dark:hover:decoration-neutral-400"
                                    >
                                      {formatSpeakerNameWithCompany(
                                        resolved.name,
                                        resolved.company,
                                      )}
                                    </a>
                                  ) : resolved.url ? (
                                    <a
                                      href={resolved.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-2 transition-colors hover:decoration-neutral-500 dark:text-white dark:decoration-neutral-600 dark:hover:decoration-neutral-400"
                                    >
                                      {formatSpeakerNameWithCompany(
                                        resolved.name,
                                        resolved.company,
                                      )}
                                    </a>
                                  ) : (
                                    <p className="font-semibold text-neutral-900 dark:text-white">
                                      {formatSpeakerNameWithCompany(
                                        resolved.name,
                                        resolved.company,
                                      )}
                                    </p>
                                  )}
                                  {domain && (
                                    <a
                                      href={resolved.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                                    >
                                      <ExternalLinkIcon className="h-2.5 w-2.5" />
                                      {domain}
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {confirmedSpeakers.length === 0 && (
                <div className="glass rounded-3xl border-2 border-dashed border-neutral-200 p-16 text-center dark:border-neutral-700">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-500/15 dark:to-orange-500/10">
                    <MicIcon className="h-8 w-8 text-rose-400 dark:text-rose-300" />
                  </div>
                  <p className="text-xl font-bold text-neutral-500 dark:text-neutral-400">
                    {t("speakersTba")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {!isTba && (
          <div className="mx-auto max-w-5xl px-4 pb-10">
            <CommunityQuestionsPanel
              eventId={id}
              theme={PANEL_THEMES[location] ?? DEFAULT_PANEL_THEME}
              talkOptions={talkOptions}
            />
          </div>
        )}

        <div className="mx-auto max-w-5xl px-4 pb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-neutral-300/50 to-transparent dark:via-neutral-600/30" />
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-24">
          <div className="grid items-start gap-6 lg:grid-cols-5 lg:gap-8">
            <div className="lg:col-span-3">
              <div
                className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
                style={{
                  background: `linear-gradient(135deg, ${loc.color}08 0%, ${loc.color}04 100%)`,
                }}
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 ${loc.rail}`} />

                <div
                  className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl"
                  style={{ background: `${loc.color}12` }}
                />
                <div
                  className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full blur-3xl"
                  style={{ background: `${loc.color}08` }}
                />

                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl ring-1"
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
                    <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
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
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:border-white/10 dark:bg-white/10 dark:text-neutral-200">
                      <ClockIcon className="h-3.5 w-3.5" style={{ color: loc.color }} />
                      <span>{countdownLabel}</span>
                    </div>
                  )}

                  <div className="mt-8">
                    {isPastEvent ? (
                      <div className="rounded-2xl border border-neutral-200/70 bg-neutral-100/70 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {t("rsvpClosedTitle")}
                        </p>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                          {t("rsvpClosedDescription")}
                        </p>
                      </div>
                    ) : (
                      <RsvpSection eventId={id} />
                    )}
                  </div>

                  {platformLinks.length > 0 && (
                    <div className="mt-6 border-t border-neutral-200/40 pt-5 dark:border-white/10">
                      <p className="mb-2.5 text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase dark:text-neutral-400">
                        {t("orRegisterVia")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {platformLinks.map((platform) => (
                          <a
                            key={platform.key}
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 rounded-lg border border-neutral-200/70 bg-white/60 px-3 py-1.5 text-[11px] font-medium text-neutral-600 transition-colors hover:bg-white hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-neutral-200"
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
                      <p className="mb-2.5 text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase dark:text-neutral-400">
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
                  shortPath={shortPath}
                />
              </div>
            </div>

            <div className="lg:sticky lg:top-24 lg:col-span-2">
              <div className="glass self-start rounded-3xl p-5 sm:p-6">
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

                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-neutral-200/50 pt-5 dark:border-neutral-700/50">
                  <div className="rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5" style={{ color: loc.color }} />
                      <span className="text-[9px] font-bold tracking-[0.14em] text-neutral-500 uppercase dark:text-neutral-400">
                        {t("dateLabel")}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {formattedDate}
                    </p>
                  </div>
                  <div className="rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <ClockIcon className="h-3.5 w-3.5" style={{ color: loc.color }} />
                      <span className="text-[9px] font-bold tracking-[0.14em] text-neutral-500 uppercase dark:text-neutral-400">
                        {t("timeLabel")}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{time}</p>
                  </div>
                </div>

                {confirmedSpeakers.length > 0 && (
                  <div className="mt-2 rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MicIcon className="h-3.5 w-3.5" style={{ color: loc.color }} />
                        <span className="text-[9px] font-bold tracking-[0.14em] text-neutral-500 uppercase dark:text-neutral-400">
                          {t("speakers")}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {t("talkCount", { count: confirmedSpeakers.length })}
                      </span>
                    </div>
                  </div>
                )}

                {episode && (
                  <div className="mt-2 rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold tracking-[0.14em] text-neutral-500 uppercase dark:text-neutral-400">
                        {t("episodeLabel")}
                      </span>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {episode}
                      </span>
                    </div>
                  </div>
                )}

                <div
                  className="mt-5 overflow-hidden rounded-xl border p-4"
                  style={{
                    borderColor: `${loc.color}40`,
                    background: `linear-gradient(135deg, ${loc.color}10 0%, ${loc.color}06 100%)`,
                  }}
                >
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
                  const partners = getLocationPartners(location);
                  if (partners.length === 0) {
                    return null;
                  }
                  return (
                    <div className="mt-5 border-t border-neutral-200/50 pt-5 dark:border-neutral-700/50">
                      <p className="mb-2.5 text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
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
