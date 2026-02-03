"use client";

import { useLocale, useTranslations } from "next-intl";

import { RsvpSection } from "@/components/events/RsvpSection";
import { ShareEventButton } from "@/components/events/ShareEventButton";
import {
  CalendarIcon,
  ClockIcon,
  EventbriteIcon,
  FacebookIcon,
  LumaIcon,
  MapPinIcon,
  MicIcon,
  SparklesIcon,
  ExternalLinkIcon,
} from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { DEFAULT_TIMEZONE, LOCATIONS, type LocationValue } from "@/lib/config/constants";
import { formatEventDateUTC } from "@/lib/utils/locale";

interface Speaker {
  name: string;
  topic: string;
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
}

const DEFAULT_EVENT_DURATION_MINUTES = 120;

function getMapUrl(address: string) {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

function parseEventDateTime(date: string, time: string) {
  const [year, month, day] = date.split("-").map((part) => Number(part));
  if (!year || !month || !day) {
    return null;
  }
  const [hour, minute] = time.split(":").map((part) => Number(part));
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return { year, month, day, hour, minute };
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

  return `https://www.google.com/calendar/render?${params.toString()}`;
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
}: EventDetailContentProps) {
  const t = useTranslations("events");
  const locale = useLocale();
  const isTba = date.trim().toUpperCase() === "TBA";
  const formattedDate = !isTba ? formatEventDateUTC(date, locale) : t("tba");

  const calendarDateTime = !isTba ? parseEventDateTime(date, time) : null;
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
  const locationColor = isPrague ? "#dc2626" : "#2563eb";
  const locationGlow = isPrague
    ? "from-red-400/20 to-rose-500/10"
    : "from-blue-400/20 to-indigo-500/10";

  const platformLinks = [
    {
      key: "luma",
      label: t("platforms.luma"),
      url: links?.luma,
      icon: LumaIcon,
      gradient: "from-violet-500 via-purple-600 to-fuchsia-600",
      shadow: "shadow-violet-500/30",
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

  const hasSpeakers = speakers.some((speaker) => speaker.name.trim().length > 0);
  const confirmedSpeakers = speakers.filter(
    (speaker) => speaker.name.trim().length > 0 && speaker.name !== "TBA",
  );

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
          className={`absolute -top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br ${locationGlow} opacity-60 blur-[100px]`}
        />
        <div
          className={`absolute -bottom-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr ${locationGlow} opacity-40 blur-[100px]`}
        />
      </div>

      <div className="relative z-10">
        <div className="relative overflow-hidden px-4 pt-32 pb-12 sm:pt-32 sm:pb-16">
          <div className="mx-auto max-w-5xl">
            {episode && (
              <div className="mb-6 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-orange-500 to-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-500/30">
                  <SparklesIcon className="h-4 w-4" />
                  {t("episodeLabel")} {episode}
                </span>
              </div>
            )}

            <h1 className="mb-6 text-center text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl dark:text-white">
              {title}
            </h1>

            <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
              {description}
            </p>

            <div className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-4">
              <div className="glass flex items-center gap-3 rounded-2xl px-5 py-3">
                <CalendarIcon className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {formattedDate}
                </span>
              </div>

              <div className="glass flex items-center gap-3 rounded-2xl px-5 py-3">
                <ClockIcon className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-neutral-900 dark:text-white">{time}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-24">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
            <div className="space-y-6">
              {hasSpeakers && (
                <div className="glass rounded-3xl p-6 sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600">
                      <MicIcon className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {t("speakers")}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {confirmedSpeakers.map((speaker, index) => (
                      <div
                        key={`${speaker.name}-${index}`}
                        className="flex items-start gap-4 rounded-2xl bg-white/50 p-4 dark:bg-white/5"
                      >
                        <div
                          className="flex h-12 w-12 flex-none items-center justify-center rounded-xl text-lg font-bold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${locationColor}dd, ${locationColor}99)`,
                          }}
                        >
                          {speaker.name.charAt(0)}
                        </div>

                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">
                            {speaker.name}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {speaker.topic}
                          </p>
                        </div>
                      </div>
                    ))}

                    {confirmedSpeakers.length === 0 && (
                      <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-8 text-center dark:border-neutral-700">
                        <p className="text-neutral-500 dark:text-neutral-400">{t("speakersTba")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
                <div
                  className={`pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${locationGlow} blur-3xl`}
                />

                <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
                  {t("venueTitle")}
                </h2>

                <a
                  href={getMapUrl(venue)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4"
                >
                  <div
                    className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl"
                    style={{ background: `${locationColor}15` }}
                  >
                    <MapPinIcon className="h-7 w-7" style={{ color: locationColor }} />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900 transition-colors group-hover:text-orange-500 dark:text-white">
                      {venue}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {t("openInMaps")}
                    </p>
                  </div>

                  <ExternalLinkIcon className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-neutral-600 dark:text-neutral-500" />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass overflow-hidden rounded-3xl p-6 sm:p-8 lg:sticky lg:top-24">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-500 via-orange-500 to-red-500" />

                <h3 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">
                  {isTba ? t("saveTheDate") : t("registerNow")}
                </h3>

                <p className="mb-6 text-neutral-600 dark:text-neutral-300">
                  {isTba ? t("tbaDescription") : t("registerDescription", { location })}
                </p>

                <RsvpSection eventId={id} />

                {googleCalendarUrl && calendarStart && calendarEnd && (
                  <div className="mt-6 space-y-2 border-t border-neutral-200/50 pt-6 dark:border-neutral-700/50">
                    <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                      {t("addToCalendar")}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        href={googleCalendarUrl}
                        external
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="secondary"
                        size="sm"
                        className="w-full justify-center"
                      >
                        {t("googleCalendar")}
                      </Button>
                      <Button
                        onClick={handleDownloadCalendar}
                        variant="secondary"
                        size="sm"
                        className="w-full justify-center"
                      >
                        {t("downloadIcs")}
                      </Button>
                    </div>
                  </div>
                )}

                {platformLinks.length > 0 && (
                  <div className="mt-6 space-y-2 border-t border-neutral-200/50 pt-6 dark:border-neutral-700/50">
                    <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                      {t("orRegisterVia")}
                    </p>

                    <div className="grid grid-cols-1 gap-2">
                      {platformLinks.map((platform) => (
                        <a
                          key={platform.key}
                          href={platform.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${platform.gradient} px-4 py-2.5 text-xs font-semibold text-white shadow-md ${platform.shadow} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0`}
                        >
                          <platform.icon className="h-4 w-4" />
                          <span>{platform.label}</span>
                          <ExternalLinkIcon className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-1" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {platformLinks.length === 0 && isTba && (
                  <div className="mt-6 rounded-2xl border-2 border-dashed border-orange-300/50 bg-orange-50/50 p-6 text-center dark:border-orange-500/30 dark:bg-orange-500/10">
                    <SparklesIcon className="mx-auto mb-3 h-8 w-8 text-orange-500" />
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      {t("stayTuned")}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {t("registrationOpensSoon")}
                    </p>
                  </div>
                )}

                {episode && (
                  <div className="mt-6 space-y-3 border-t border-neutral-200/50 pt-6 dark:border-neutral-700/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {t("episodeLabel")}
                      </span>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {episode}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <ShareEventButton
                sectionTitle={t("shareEvent")}
                copyLabel={t("copyLink")}
                copiedLabel={t("copied")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
