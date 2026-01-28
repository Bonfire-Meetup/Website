import type { CatalogRecording } from "./RecordingsCatalogTypes";
import Link from "next/link";
import type { ReactNode } from "react";

import { PAGE_ROUTES } from "@/lib/routes/pages";

import { Pill } from "../ui/Pill";
import { SpeakerList } from "../ui/SpeakerList";

import { RecordingImageServer } from "./RecordingImageServer";
import { RecordingMeta } from "./RecordingMeta";

interface RailCardBadge {
  icon: ReactNode;
  count: number;
  gradient: string;
}

interface RailCardServerProps {
  recording: CatalogRecording;
  locale: string;
  epShortLabel: string;
  isFirst?: boolean;
  badge?: RailCardBadge;
}

export function RailCardServer({
  recording,
  locale,
  epShortLabel,
  isFirst = false,
  badge,
}: RailCardServerProps) {
  return (
    <Link
      href={PAGE_ROUTES.WATCH(recording.slug, recording.shortId)}
      prefetch={false}
      className="group relative flex w-[75vw] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] bg-white/90 text-neutral-900 shadow-lg ring-1 shadow-black/5 ring-black/5 transition-all hover:-translate-y-1 sm:w-[45vw] lg:w-[280px] xl:w-[300px] dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10"
      aria-label={recording.title}
    >
      <div className="relative">
        <RecordingImageServer
          src={recording.thumbnail}
          alt={recording.title}
          imgClassName="group-hover:scale-105"
          sizes="(max-width: 640px) 75vw, (max-width: 1024px) 45vw, 300px"
          priority={isFirst}
        />
        {badge && badge.count > 0 && (
          <div
            className={`absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-lg ${badge.gradient}`}
          >
            {badge.icon}
            {badge.count}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col space-y-3 bg-white/85 px-4 pt-4 pb-5 text-neutral-900 dark:bg-black/75 dark:text-white">
        <RecordingMeta
          location={recording.location}
          date={recording.date}
          locale={locale}
          trackingClass="tracking-[0.2em]"
        />
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-neutral-900 dark:text-white">
          {recording.title}
        </h3>
        <SpeakerList speakers={recording.speaker} />
        <div className="flex flex-wrap gap-2">
          {recording.tags.slice(0, 3).map((tag: string) => (
            <Pill
              key={tag}
              size="xxs"
              className="bg-black/5 font-semibold tracking-[0.2em] text-neutral-600 uppercase dark:bg-white/10 dark:text-white/70"
            >
              {tag}
            </Pill>
          ))}
        </div>
      </div>
      {recording.episode && (
        <Pill
          size="xxs"
          className="absolute top-3 right-3 bg-black/60 font-semibold tracking-[0.18em] text-white uppercase shadow"
        >
          {recording.episodeNumber
            ? `${epShortLabel} ${recording.episodeNumber}`
            : recording.episode}
        </Pill>
      )}
    </Link>
  );
}
