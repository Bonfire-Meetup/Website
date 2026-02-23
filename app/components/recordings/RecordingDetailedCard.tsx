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
  badge?: { icon: ReactNode; count: number; gradient: string };
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
  const outerClassName =
    className ??
    (isGrid
      ? "group relative flex cursor-pointer flex-col overflow-hidden rounded-[28px] bg-white/90 text-neutral-900 shadow-lg ring-1 shadow-black/5 ring-black/5 transition-all hover:shadow-xl dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10"
      : "group relative flex w-[75vw] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] bg-white/90 text-neutral-900 shadow-lg ring-1 shadow-black/5 ring-black/5 transition-all hover:-translate-y-1 sm:w-[45vw] lg:w-[280px] xl:w-[300px] dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10");

  return (
    <RecordingCardShell
      href={undefined}
      prefetch={false}
      ariaLabel={title}
      className={outerClassName}
      overlayContent={
        <Link href={watchHref} prefetch={false} className="absolute inset-0 z-0" aria-label={title}>
          <span className="sr-only">{title}</span>
        </Link>
      }
      imageClassName={
        isGrid ? "relative z-10 shrink-0 pointer-events-none" : "relative z-10 pointer-events-none"
      }
      image={
        <>
          <RecordingImage
            src={thumbnail}
            alt={title}
            imgClassName="group-hover:scale-105"
            sizes={
              isGrid
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                : "(max-width: 640px) 75vw, (max-width: 1024px) 45vw, 300px"
            }
            loading={isFirst ? "eager" : "lazy"}
            fetchPriority={isFirst ? "high" : "low"}
          />
          {badge && badge.count > 0 && (
            <div
              className={`absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-lg ${badge.gradient}`}
            >
              {badge.icon}
              {badge.count}
            </div>
          )}
        </>
      }
      bodyClassName={
        isGrid
          ? "relative z-10 flex flex-1 flex-col space-y-3 bg-white/85 px-5 pt-5 pb-6 text-neutral-900 pointer-events-none dark:bg-black/75 dark:text-white"
          : "relative z-10 pointer-events-none"
      }
      body={
        <div className="pointer-events-none flex flex-1 flex-col space-y-3 bg-white/85 px-4 pt-4 pb-5 text-neutral-900 dark:bg-black/75 dark:text-white">
          <RecordingMeta
            location={location}
            date={date}
            locale={resolvedLocale}
            trackingClass={isGrid ? "tracking-[0.25em]" : "tracking-[0.2em]"}
          />
          <h3
            className={`${isGrid ? "text-base" : "text-sm"} line-clamp-2 leading-snug font-semibold text-neutral-900 dark:text-white`}
          >
            {title}
          </h3>
          <SpeakerList speakers={speaker} />
          <div className="pointer-events-auto flex flex-wrap gap-2">
            {tags.slice(0, isGrid ? tags.length : 3).map((tag: string) => (
              <RecordingTagPill
                key={tag}
                tag={tag}
                href={`${PAGE_ROUTES.LIBRARY_BROWSE}?tag=${encodeURIComponent(tag)}`}
                size="xxs"
              />
            ))}
          </div>
        </div>
      }
    >
      {isGrid ? (
        <>
          <RecordingAccessPill
            access={access}
            className="pointer-events-none absolute top-2 left-2 z-10"
          />
          <div className="pointer-events-auto absolute top-2 right-2 z-10">
            <WatchLaterButton shortId={shortId} variant="icon" size="sm" showLabel={false} />
          </div>
        </>
      ) : (
        <>
          <RecordingAccessPill
            access={access}
            className="pointer-events-none absolute top-3 left-3 z-10"
          />
          {episode && (
            <RecordingEpisodePill
              className="pointer-events-none absolute top-3 right-3 bg-black/60 font-semibold tracking-[0.18em] text-white uppercase shadow"
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
