"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { RsvpSection } from "@/components/events/RsvpSection";
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
  CheckIcon,
  LinkIcon,
} from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { LOCATIONS, type LocationValue } from "@/lib/config/constants";
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

interface EventDetailClientProps {
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

export function EventDetailClient({
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
}: EventDetailClientProps) {
  const t = useTranslations("events");
  const _tCommon = useTranslations("common");
  const locale = useLocale();
  const isTba = date.trim().toUpperCase() === "TBA";
  const [copied, setCopied] = useState(false);

  const formattedDate = !isTba ? formatEventDateUTC(date, locale) : t("tba");

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

  const getMapUrl = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  const hasSpeakers = speakers.some((speaker) => speaker.name.trim().length > 0);
  const confirmedSpeakers = speakers.filter(
    (speaker) => speaker.name.trim().length > 0 && speaker.name !== "TBA",
  );

  return (
    <div className="relative flex-1">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className={`absolute -top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br ${locationGlow} opacity-60 blur-[100px]`}
        />
        <div
          className={`absolute -bottom-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr ${locationGlow} opacity-40 blur-[100px]`}
        />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
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

        {/* Main Content */}
        <div className="mx-auto max-w-5xl px-4 pb-24">
          {/* Mobile: single column with order. Desktop: two columns */}
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
            {/* LEFT COLUMN - Desktop only */}
            <div className="hidden space-y-6 lg:block">
              {/* Speakers - Desktop */}
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

              {/* Venue - Desktop */}
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

            {/* RIGHT COLUMN - Desktop */}
            <div className="hidden space-y-6 lg:block">
              {/* Registration - Desktop */}
              <div className="glass sticky top-24 overflow-hidden rounded-3xl p-6 sm:p-8">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-500 via-orange-500 to-red-500" />

                <h3 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">
                  {isTba ? t("saveTheDate") : t("registerNow")}
                </h3>

                <p className="mb-6 text-neutral-600 dark:text-neutral-300">
                  {isTba ? t("tbaDescription") : t("registerDescription", { location })}
                </p>

                {/* Bonfire RSVP - Primary */}
                <RsvpSection eventId={id} />

                {/* External Links - Secondary */}
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

              {/* Share - Desktop */}
              <div className="glass rounded-3xl p-6">
                <p className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">
                  {t("shareEvent")}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={copied ? "primary" : "secondary"}
                    size="sm"
                    className="flex-1 gap-2 transition-all duration-300"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        {t("copied")}
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4" />
                        {t("copyLink")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* MOBILE ONLY - Single column with order */}
            <div className="flex flex-col gap-6 lg:hidden">
              {/* Speakers - Mobile (Order 1) */}
              {hasSpeakers && (
                <div className="glass order-1 rounded-3xl p-6">
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

              {/* Venue - Mobile (Order 2) */}
              <div className="glass relative order-2 overflow-hidden rounded-3xl p-6">
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

              {/* Registration - Mobile (Order 3) */}
              <div className="glass order-3 overflow-hidden rounded-3xl p-6">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-500 via-orange-500 to-red-500" />

                <h3 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">
                  {isTba ? t("saveTheDate") : t("registerNow")}
                </h3>

                <p className="mb-6 text-neutral-600 dark:text-neutral-300">
                  {isTba ? t("tbaDescription") : t("registerDescription", { location })}
                </p>

                {/* Bonfire RSVP - Primary */}
                <RsvpSection eventId={id} />

                {/* External Links - Secondary */}
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

                <div className="mt-6 space-y-3 border-t border-neutral-200/50 pt-6 dark:border-neutral-700/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {t("locationSimple")}
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">{t("timeLabel")}</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{time}</span>
                  </div>
                  {episode && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {t("episodeLabel")}
                      </span>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {episode}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Share - Mobile (Order 4) */}
              <div className="glass order-4 rounded-3xl p-6">
                <p className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">
                  {t("shareEvent")}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={copied ? "primary" : "secondary"}
                    size="sm"
                    className="flex-1 gap-2 transition-all duration-300"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        {t("copied")}
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4" />
                        {t("copyLink")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
