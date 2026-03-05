"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import type { ReactNode } from "react";

import { LocationPill } from "@/components/locations/LocationPill";
import { BoltIcon, FireIcon, MapPinIcon } from "@/components/shared/Icons";
import { type LocationValue } from "@/lib/config/constants";
import { type RecordingAccessPolicy } from "@/lib/recordings/early-access";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatDate } from "@/lib/utils/locale";

import { SpeakerList } from "../ui/SpeakerList";

import {
  CARD_MEDIA_PARALLAX_BASE_CLASS,
  CARD_MEDIA_PARALLAX_HOVER_CLASS,
  CARD_TILT_CLASS,
  CARD_TILT_STYLE,
  createCardTiltHandlers,
} from "./card-tilt";
import { RecordingAccessPill } from "./RecordingAccessPill";
import { RecordingCardShell } from "./RecordingCardShell";
import { RecordingEpisodePill } from "./RecordingEpisodePill";
import { RecordingImage } from "./RecordingImage";
import { RecordingMeta } from "./RecordingMeta";
import { RecordingTagPill } from "./RecordingTagPill";
import { WatchLaterButton } from "./WatchLaterButton";

type RecordingDetailedVariant = "rail" | "grid" | "glass";

interface RecordingDetailedCardProps {
  variant: RecordingDetailedVariant;
  shortId: string;
  slug: string;
  title: string;
  speaker: string[];
  date: string;
  thumbnail: string;
  location: LocationValue;
  tags?: string[];
  episode?: string;
  episodeNumber?: number;
  access?: RecordingAccessPolicy;
  isFirst?: boolean;
  className?: string;
  locationLabel?: string;
  ariaLocationLabel?: string;
  locale?: string;
  likeCount?: number;
  boostCount?: number;
  badge?: {
    icon: ReactNode;
    count?: number;
    label?: string;
    gradient: string;
  };
  disableShadow?: boolean;
}

export function RecordingDetailedCard({
  variant,
  shortId,
  slug,
  title,
  speaker,
  date,
  thumbnail,
  location,
  tags = [],
  episode,
  episodeNumber,
  access,
  isFirst = false,
  className,
  locationLabel,
  ariaLocationLabel,
  locale,
  likeCount,
  boostCount,
  badge,
  disableShadow = false,
}: RecordingDetailedCardProps) {
  const t = useTranslations("recordings");
  const localeFromContext = useLocale();
  const resolvedLocale = locale ?? localeFromContext;
  const watchHref = PAGE_ROUTES.WATCH(slug, shortId);

  if (variant === "glass") {
    const formattedDate = formatDate(date, resolvedLocale);

    return (
      <RecordingCardShell
        href={watchHref}
        prefetch={false}
        ariaLabel={title}
        className={className ?? "glass-card group flex h-full cursor-pointer flex-col"}
        imageClassName="video-overlay relative shrink-0 overflow-hidden rounded-t-3xl"
        image={
          <>
            <RecordingImage
              src={thumbnail}
              alt={title}
              imgClassName="group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              fetchPriority="low"
            />
            <div className="absolute bottom-4 left-4 z-10">
              <LocationPill
                location={location}
                ariaLabel={ariaLocationLabel || locationLabel || location}
                icon={<MapPinIcon className="h-3.5 w-3.5" />}
              />
            </div>
            <RecordingAccessPill access={access} className="absolute top-4 right-4 z-10" />
          </>
        }
        body={
          <div className="flex flex-1 flex-col p-6">
            <h3 className="group-hover:text-brand-600 dark:group-hover:text-brand-400 mb-3 line-clamp-2 text-base leading-snug font-semibold text-neutral-900 transition-colors duration-300 dark:text-white">
              {title}
            </h3>
            <div className="mt-auto space-y-4">
              <div className="flex flex-col gap-2">
                {speaker.map((name) => (
                  <div key={name} className="flex items-center gap-2.5">
                    <span className="speaker-dot" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-white/5">
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {formattedDate}
                </span>
                <div className="flex items-center gap-3">
                  {typeof boostCount === "number" && boostCount > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                      <BoltIcon className="h-3.5 w-3.5" />
                      {boostCount}
                    </span>
                  )}
                  {typeof likeCount === "number" && likeCount > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-rose-400">
                      <FireIcon className="h-3.5 w-3.5" />
                      {likeCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  const isGrid = variant === "grid";
  const tiltHandlers = createCardTiltHandlers();
  const shadowClass = disableShadow
    ? "shadow-none hover:shadow-none"
    : "shadow-[0_20px_38px_-24px_rgba(17,24,39,0.24),0_14px_34px_-26px_rgba(249,115,22,0.3)] hover:shadow-[0_30px_54px_-26px_rgba(17,24,39,0.3),0_18px_40px_-26px_rgba(249,115,22,0.38)] dark:shadow-[0_18px_38px_-18px_rgba(0,0,0,0.9)] dark:hover:shadow-[0_30px_52px_-20px_rgba(0,0,0,0.95)]";
  const outerClassName =
    className ??
    (isGrid
      ? `group relative flex cursor-pointer flex-col overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,rgba(255,253,249,0.99)_0%,rgba(252,244,236,0.992)_52%,rgba(244,232,220,0.995)_100%)] text-white ring-1 ring-black/6 transition-[box-shadow,ring-color,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.34)_0%,transparent_24%,transparent_100%)] before:opacity-100 hover:ring-black/12 hover:saturate-110 dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:ring-white/12 dark:before:hidden dark:hover:ring-white/20 ${shadowClass}`
      : `group relative z-0 flex w-[calc(100%-2.25rem)] shrink-0 snap-start flex-col overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,rgba(255,253,249,0.99)_0%,rgba(252,244,236,0.992)_52%,rgba(244,232,220,0.995)_100%)] text-white ring-1 ring-black/6 transition-[box-shadow,ring-color,filter,z-index] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.34)_0%,transparent_24%,transparent_100%)] before:opacity-100 hover:z-20 hover:ring-black/12 hover:saturate-110 sm:w-[70vw] lg:w-[calc((100%-3rem-1px)/3)] xl:w-[calc((100%-3rem-1px)/3)] dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:ring-white/12 dark:before:hidden dark:hover:ring-white/20 ${shadowClass}`);

  return (
    <RecordingCardShell
      href={undefined}
      prefetch={false}
      ariaLabel={title}
      className={`${outerClassName} ${CARD_TILT_CLASS}`}
      style={CARD_TILT_STYLE}
      {...tiltHandlers}
      overlayContent={
        <Link href={watchHref} prefetch={false} className="absolute inset-0 z-0" aria-label={title}>
          <span className="sr-only">{title}</span>
        </Link>
      }
      imageClassName={
        isGrid ? "relative z-0 shrink-0 pointer-events-none" : "relative z-0 pointer-events-none"
      }
      image={
        <>
          <RecordingImage
            src={thumbnail}
            alt={title}
            aspectClassName="aspect-video"
            imgClassName={`duration-200 ease-out saturate-[1.04] ${CARD_MEDIA_PARALLAX_BASE_CLASS} ${CARD_MEDIA_PARALLAX_HOVER_CLASS} dark:saturate-100`}
            sizes={
              isGrid
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                : "(max-width: 640px) 88vw, (max-width: 1024px) 70vw, 33vw"
            }
            loading={isFirst ? "eager" : "lazy"}
            fetchPriority={isFirst ? "high" : "low"}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/22 via-transparent to-transparent dark:from-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/36 via-black/10 via-62% to-transparent transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:from-black/26 dark:from-black/70 dark:via-black/34 dark:group-hover:from-black/56" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/34 via-white/12 to-transparent dark:from-white/6 dark:via-transparent" />
        </>
      }
      bodyClassName={
        isGrid
          ? "pointer-events-none absolute inset-0 z-10 flex items-end"
          : "pointer-events-none absolute inset-0 z-10 flex items-end"
      }
      body={
        <div
          className={
            isGrid
              ? "pointer-events-none flex h-full w-full items-end bg-gradient-to-t from-black/72 via-black/34 to-transparent text-white dark:from-black/86 dark:via-black/52"
              : "pointer-events-none flex h-full w-full items-end bg-gradient-to-t from-black/68 via-black/30 to-transparent text-white dark:from-black/82 dark:via-black/48"
          }
        >
          <div
            className={
              isGrid ? "w-full space-y-2 px-4 pt-14 pb-4" : "w-full space-y-2 px-3.5 pt-12 pb-3.5"
            }
          >
            <RecordingMeta
              location={location}
              date={date}
              locale={resolvedLocale}
              trackingClass={isGrid ? "tracking-[0.14em]" : "tracking-[0.12em]"}
            />
            <h3
              className={`${isGrid ? "text-[15px]" : "text-sm"} line-clamp-2 leading-[1.28] font-semibold tracking-[-0.01em] text-white`}
            >
              {title}
            </h3>
            <SpeakerList speakers={speaker.slice(0, 1)} />
            <div className="pointer-events-auto flex flex-wrap gap-1 pt-0.5">
              {tags.slice(0, isGrid ? 2 : 2).map((tag: string) => (
                <RecordingTagPill
                  key={tag}
                  tag={tag}
                  href={`${PAGE_ROUTES.LIBRARY_BROWSE}?tag=${encodeURIComponent(tag)}`}
                  size="xxxs"
                  className="tracking-[0.12em]"
                />
              ))}
            </div>
          </div>
        </div>
      }
    >
      {badge && ((badge.count !== undefined && badge.count > 0) || badge.label) && (
        <div
          className={`pointer-events-none absolute right-3 bottom-3 z-30 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-lg ${badge.gradient}`}
        >
          {badge.icon}
          {badge.label ?? badge.count}
        </div>
      )}
      {isGrid ? (
        <>
          <RecordingAccessPill
            access={access}
            className="pointer-events-none absolute top-2 left-2 z-20"
          />
          <div className="pointer-events-auto absolute top-2 right-2 z-5">
            <WatchLaterButton shortId={shortId} variant="icon" size="sm" showLabel={false} />
          </div>
        </>
      ) : (
        <>
          <RecordingAccessPill
            access={access}
            className="pointer-events-none absolute top-3 left-3 z-20"
          />
          {episode && (
            <RecordingEpisodePill
              className="pointer-events-none absolute top-3 right-3 z-20 bg-black/70 font-semibold tracking-[0.18em] text-white uppercase shadow"
              episode={episode}
              episodeNumber={episodeNumber}
              epShortLabel={t("epShort")}
            />
          )}
        </>
      )}
    </RecordingCardShell>
  );
}
