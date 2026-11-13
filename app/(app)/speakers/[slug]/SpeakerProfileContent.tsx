"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import type { ReactNode } from "react";

import { useRenderNow } from "@/components/events/useRenderNow";
import { PROFILE_EYEBROW, PROFILE_SURFACE, PROFILE_TONE } from "@/components/profile/surface";
import {
  BuildingIcon,
  CalendarIcon,
  CameraIcon,
  ClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  MicIcon,
  PlayIcon,
  ShareIcon,
} from "@/components/shared/Icons";
import { SpeakerPhoto } from "@/components/speakers/SpeakerPhoto";
import { AccentBar } from "@/components/ui/AccentBar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Link } from "@/i18n/navigation";
import { LOCATIONS } from "@/lib/config/constants";
import type { SpeakerProfile, SpeakerTalk } from "@/lib/events/speaker-profiles";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatLongDateUTC, formatMonthUTC, getUTCDateParts } from "@/lib/utils/locale";

type TalkWithMedia = SpeakerTalk & {
  photos?: { count: number; coverSrc: string; href: string };
  recording?: { href: string; thumbnail: string };
};

interface SpeakerProfileContentProps {
  communitySlot?: ReactNode;
  profile: SpeakerProfile;
  talks: TalkWithMedia[];
}

function isDatedEvent(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/u.test(date);
}

function isUpcomingDate(date: string, now: Date) {
  return new Date(`${date}T23:59:59Z`).getTime() >= now.getTime();
}

function TalkCard({
  isUpcoming,
  profileCompany,
  speakerSlug,
  talk,
}: {
  isUpcoming: boolean;
  profileCompany?: string;
  speakerSlug: string;
  talk: TalkWithMedia;
}) {
  const t = useTranslations("speakerPage");
  const locale = useLocale();
  const isPrague = talk.location === LOCATIONS.PRAGUE;
  const dated = isDatedEvent(talk.date);
  const hasMedia = Boolean(talk.image ?? talk.recording ?? talk.photos);
  const mediaFrame =
    "group relative block aspect-video w-full overflow-hidden rounded-2xl border border-black/10 bg-neutral-900 shadow-sm dark:border-white/10";
  const mediaCaption =
    "absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-4 pt-10 pb-3 text-xs font-semibold text-white";

  return (
    <article className={`${PROFILE_SURFACE} ${PROFILE_TONE.speaker}`}>
      <div
        className={`h-1 w-full bg-gradient-to-r ${
          isPrague
            ? "from-rose-500 via-orange-500 to-red-500"
            : "from-blue-500 via-indigo-500 to-blue-600"
        }`}
      />
      <div
        className={`grid gap-6 p-6 sm:p-8 lg:gap-8 ${hasMedia ? "lg:grid-cols-[minmax(0,1fr)_300px]" : ""}`}
      >
        <div className="flex min-w-0 gap-5">
          {dated && (
            <time
              dateTime={talk.date}
              className={`hidden h-fit shrink-0 flex-col items-center rounded-2xl px-3.5 py-3 text-white shadow-lg sm:flex ${
                isPrague
                  ? "bg-gradient-to-br from-orange-500 to-rose-600"
                  : "bg-gradient-to-br from-sky-500 to-indigo-600"
              }`}
            >
              <span className="text-[11px] leading-none font-bold tracking-wider uppercase">
                {formatMonthUTC(talk.date, locale)}
              </span>
              <span className="my-1 text-3xl leading-none font-black">
                {getUTCDateParts(talk.date).day}
              </span>
              <span className="text-[11px] leading-none font-medium opacity-80">
                {getUTCDateParts(talk.date).year}
              </span>
            </time>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Pill
                size="xxs"
                className={
                  isPrague
                    ? "bg-rose-500/10 font-semibold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                    : "bg-blue-500/10 font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                }
              >
                {isPrague ? t("prague") : t("zlin")}
              </Pill>
              {isUpcoming && (
                <Pill
                  size="xxs"
                  className="bg-emerald-500/10 font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                >
                  {t("upcoming")}
                </Pill>
              )}
              <Link
                href={PAGE_ROUTES.EVENT(talk.eventId)}
                className="text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                {talk.eventTitle}
              </Link>
            </div>

            <h3 className="mt-3 text-2xl font-bold tracking-tight text-balance text-neutral-900 sm:text-3xl dark:text-white">
              {talk.topic}
            </h3>

            {talk.group && (
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                {t("partOf")}{" "}
                <Link
                  href={PAGE_ROUTES.SPEAKER(talk.group.slug)}
                  className="font-semibold underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500 dark:decoration-neutral-600"
                >
                  {talk.group.name}
                </Link>
              </p>
            )}

            {talk.coSpeakers.length > 0 && (
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                {t("withSpeakers")}{" "}
                {talk.coSpeakers.map((coSpeaker, index) => (
                  <span key={coSpeaker.slug}>
                    {index > 0 && ", "}
                    <Link
                      href={PAGE_ROUTES.SPEAKER(coSpeaker.slug)}
                      className="font-semibold underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500 dark:decoration-neutral-600"
                    >
                      {coSpeaker.name}
                    </Link>
                  </span>
                ))}
              </p>
            )}

            {talk.description?.trim() && (
              <p className="mt-3 max-w-[70ch] text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                {talk.description}
              </p>
            )}

            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600 dark:text-neutral-300">
              {dated && (
                <li className="flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-neutral-400" />
                  {formatLongDateUTC(talk.date, locale)}
                </li>
              )}
              {talk.startTime && (
                <li className="flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4 text-neutral-400" />
                  {talk.startTime}
                </li>
              )}
              {talk.company && talk.company !== profileCompany && (
                <li className="flex items-center gap-1.5">
                  <BuildingIcon className="h-4 w-4 text-neutral-400" />
                  {talk.company}
                </li>
              )}
              {talk.venue && (
                <li className="flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4 text-neutral-400" />
                  {talk.venue}
                </li>
              )}
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {talk.recording && (
                <Button href={talk.recording.href} variant="primary" size="sm">
                  <PlayIcon className="h-3.5 w-3.5" />
                  {t("watchRecording")}
                </Button>
              )}
              <Button
                href={PAGE_ROUTES.EVENT(talk.eventId)}
                variant={talk.recording ? "secondary" : "primary"}
                size="sm"
              >
                {t("viewEvent")}
              </Button>
              {talk.socials.length > 0 && (
                <Button
                  href={PAGE_ROUTES.SPEAKER_SOCIALS(speakerSlug, talk.eventId)}
                  variant="secondary"
                  size="sm"
                >
                  <ShareIcon className="h-3.5 w-3.5" />
                  {t("shareImages", { count: talk.socials.length })}
                </Button>
              )}
              {talk.photos && (
                <Button href={talk.photos.href} variant="secondary" size="sm">
                  <CameraIcon className="h-3.5 w-3.5" />
                  {t("eventPhotos", { count: talk.photos.count })}
                </Button>
              )}
            </div>
          </div>
        </div>

        {talk.image ? (
          <Image
            src={talk.image.url}
            alt=""
            width={talk.image.width}
            height={talk.image.height}
            sizes="(max-width: 1024px) 100vw, 300px"
            className="h-auto w-full self-start rounded-2xl border border-black/10 shadow-sm dark:border-white/10"
          />
        ) : talk.recording ? (
          <Link href={talk.recording.href} className={mediaFrame}>
            <Image
              src={talk.recording.thumbnail}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 300px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/10">
              <PlayIcon className="h-14 w-14 text-white drop-shadow-lg transition group-hover:scale-110" />
            </span>
            <span className="sr-only">{t("watchRecording")}</span>
          </Link>
        ) : talk.photos ? (
          <Link href={talk.photos.href} className={mediaFrame}>
            <Image
              src={talk.photos.coverSrc}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 300px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <span className={mediaCaption}>
              <CameraIcon className="h-3.5 w-3.5" />
              {t("eventPhotos", { count: talk.photos.count })}
            </span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function SpeakerProfileContent({
  communitySlot,
  profile,
  talks,
}: SpeakerProfileContentProps) {
  const t = useTranslations("speakerPage");
  const now = useRenderNow();
  const isGroup = profile.kind === "group";
  const websiteDomain = profile.url ? new URL(profile.url).hostname.replace(/^www\./u, "") : null;

  return (
    <main className="gradient-bg min-h-screen px-4 pt-28 pb-24 sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-end sm:gap-10 sm:text-left">
          <div className={`relative shrink-0 ${isGroup ? "w-64 sm:w-80" : "w-44 sm:w-52"}`}>
            <div className="absolute inset-0 translate-y-3 scale-105 rounded-full bg-gradient-to-br from-fuchsia-600/40 via-orange-500/40 to-red-600/40 blur-2xl" />
            <SpeakerPhoto
              name={profile.name}
              photoUrl={profile.photoUrl}
              kind={profile.kind}
              priority
              sizes={isGroup ? "320px" : "208px"}
              className="w-full"
            />
          </div>

          <div className="min-w-0 pb-2">
            <p className={`${PROFILE_EYEBROW} mb-3 text-orange-600 dark:text-orange-400`}>
              {isGroup ? t("groupEyebrow") : t("eyebrow")}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
              {profile.name}
            </h1>
            {profile.company && (
              <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-300">
                {profile.company}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm sm:justify-start">
              <span
                className="inline-flex items-center gap-2.5 rounded-full border border-orange-500/25 bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-transparent py-1.5 pr-4 pl-1.5 dark:border-orange-400/25 dark:from-orange-500/15 dark:via-rose-500/15"
                aria-label={t("talkCount", { count: talks.length })}
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 min-w-8 items-center justify-center gap-1 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 px-2 text-sm font-black text-white shadow-md shadow-rose-500/30"
                >
                  <MicIcon className="h-3.5 w-3.5" />
                  {talks.length}
                </span>
                <span aria-hidden="true" className="font-semibold text-neutral-900 dark:text-white">
                  {t("talkCountLabel", { count: talks.length })}
                </span>
              </span>
              {profile.url && websiteDomain && (
                <a
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                >
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                  {websiteDomain}
                </a>
              )}
            </div>
          </div>
        </header>

        {isGroup && profile.members && profile.members.length > 0 && (
          <section aria-labelledby="speaker-members-heading" className="mt-10">
            <h2
              id="speaker-members-heading"
              className="mb-4 text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400"
            >
              {t("members")}
            </h2>
            <ul className="flex flex-wrap gap-3">
              {profile.members.map((member) => (
                <li key={member.slug}>
                  <Link
                    href={PAGE_ROUTES.SPEAKER(member.slug)}
                    className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white/70 py-2 pr-5 pl-2.5 transition-colors hover:border-orange-500/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-orange-400/40"
                  >
                    <SpeakerPhoto
                      name={member.name}
                      photoUrl={member.photoUrl}
                      sizes="40px"
                      className="w-10 shrink-0"
                      initialsClassName="text-xs"
                    />
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {member.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {communitySlot}

        <div className="section-divider my-12" />

        <section aria-labelledby="speaker-talks-heading">
          <div className="mb-6 flex items-center gap-3">
            <AccentBar />
            <h2
              id="speaker-talks-heading"
              className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white"
            >
              {t("talksHeading")}
            </h2>
          </div>

          <div className="space-y-6">
            {talks.map((talk) => (
              <TalkCard
                key={`${talk.eventId}-${talk.topic}`}
                talk={talk}
                profileCompany={profile.company}
                isUpcoming={
                  now !== null && isDatedEvent(talk.date) && isUpcomingDate(talk.date, now)
                }
                speakerSlug={profile.slug}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
