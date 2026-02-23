import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatShortDateUTC } from "@/lib/utils/locale";

import { RecordingAccessPill } from "./RecordingAccessPill";
import { RecordingHeaderMetaRow } from "./RecordingHeaderMetaRow";
import { type CatalogRecording } from "./RecordingsCatalogTypes";
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
  return (
    <div
      className={`flex max-w-2xl flex-col gap-2 rounded-3xl px-4 py-4 sm:px-5 sm:py-4 ${
        hasFeaturedHero
          ? "bg-black/60 text-white ring-1 ring-white/10 sm:bg-white/90 sm:text-neutral-900 sm:ring-black/5 dark:sm:bg-black/60 dark:sm:text-white dark:sm:ring-white/10"
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
            ? "bg-white/15 text-white/90 sm:bg-black/5 sm:text-neutral-700 dark:sm:bg-white/10 dark:sm:text-white/80"
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
            ? "text-white/70 sm:text-neutral-600 dark:sm:text-white/70"
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
                ? "sm:bg-brand-50 sm:text-brand-700 dark:sm:bg-brand-500/12 dark:sm:text-brand-200 bg-white/20 text-white/85"
                : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
