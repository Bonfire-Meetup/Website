import { type CatalogRecording } from "@/lib/recordings/catalog-types";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatShortDateUTC } from "@/lib/utils/locale";

import { RecordingAccessPill } from "./RecordingAccessPill";
import { RecordingHeaderMetaRow } from "./RecordingHeaderMetaRow";
import { RecordingSpeakerList } from "./RecordingSpeakerList";
import { RecordingTagPill } from "./RecordingTagPill";

interface RecordingFeaturedContentProps {
  recording: CatalogRecording;
  locale: string;
  hasFeaturedHero: boolean;
  showAccessPill?: boolean;
}

export function RecordingFeaturedContent({
  recording,
  locale,
  hasFeaturedHero,
  showAccessPill = false,
}: RecordingFeaturedContentProps) {
  const featuredHeroPanelClass =
    "bg-black/60 text-white ring-1 ring-white/10 sm:border sm:border-white/55 sm:bg-[linear-gradient(180deg,rgba(255,248,240,0.76)_0%,rgba(255,244,232,0.6)_100%)] sm:text-neutral-950 sm:ring-white/35 sm:shadow-[0_28px_60px_-36px_rgba(15,23,42,0.34)] sm:backdrop-blur-xl sm:backdrop-saturate-150 dark:sm:border-white/16 dark:sm:bg-[linear-gradient(180deg,rgba(16,16,18,0.78)_0%,rgba(10,10,12,0.62)_100%)] dark:sm:text-white dark:sm:ring-white/10 dark:sm:shadow-[0_20px_48px_-32px_rgba(0,0,0,0.7)]";

  return (
    <div
      className={`flex max-w-2xl flex-col gap-2 rounded-3xl px-4 py-4 sm:px-5 sm:py-4 ${
        hasFeaturedHero
          ? featuredHeroPanelClass
          : "bg-white/85 text-neutral-900 ring-1 ring-black/5 dark:bg-black/60 dark:text-white dark:ring-white/10"
      }`}
    >
      <RecordingHeaderMetaRow
        location={recording.location}
        formattedDate={formatShortDateUTC(recording.date, locale)}
        className={`flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.28em] uppercase ${
          hasFeaturedHero
            ? "text-white/80 sm:text-neutral-600 dark:sm:text-white/70"
            : "text-neutral-600 dark:text-white/70"
        }`}
        leftGroupClassName="flex flex-wrap items-center gap-2"
        metaGroupClassName="flex flex-wrap items-center gap-2"
        leftContent={
          showAccessPill ? (
            <RecordingAccessPill access={recording.access} className="pointer-events-auto" />
          ) : null
        }
        locationSize="xs"
        locationClassName={`${
          hasFeaturedHero
            ? "bg-white/15 text-white/90 sm:bg-white/45 sm:text-neutral-700 sm:ring-1 sm:ring-white/35 dark:sm:bg-white/10 dark:sm:text-white/80 dark:sm:ring-white/10"
            : "bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-white/80"
        }`}
      />
      <h2
        className={`line-clamp-2 text-xl leading-tight font-semibold break-words sm:text-3xl lg:text-4xl ${
          hasFeaturedHero
            ? "text-white sm:text-neutral-900 dark:sm:text-white"
            : "text-neutral-900 dark:text-white"
        }`}
      >
        {recording.title}
      </h2>
      <RecordingSpeakerList
        speakers={recording.speaker}
        textClassName={`text-xs font-medium sm:text-sm ${
          hasFeaturedHero
            ? "text-white/90 sm:text-neutral-900/80 dark:sm:text-white/80"
            : "text-neutral-900/80 dark:text-white/80"
        }`}
      />
      <p
        className={`text-xs sm:text-base ${
          hasFeaturedHero
            ? "text-white/70 sm:text-neutral-700 dark:sm:text-white/70"
            : "text-neutral-600 dark:text-white/70"
        }`}
      >
        {recording.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {recording.tags.map((tag: string) => (
          <RecordingTagPill
            key={tag}
            tag={tag}
            href={`${PAGE_ROUTES.LIBRARY_BROWSE}?tag=${encodeURIComponent(tag)}`}
            size="xxs"
            className={`${
              hasFeaturedHero
                ? "sm:text-brand-700 dark:sm:bg-brand-500/12 dark:sm:text-brand-200 bg-white/20 text-white/85 sm:bg-white/55 sm:ring-1 sm:ring-white/35 dark:sm:ring-white/10"
                : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
