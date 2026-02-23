"use client";

import type { CatalogRecording } from "./RecordingsCatalogTypes";

import { RecordingDetailedCard } from "./RecordingDetailedCard";

export function GridView({
  recordings,
  locale,
  filterKey,
}: {
  recordings: CatalogRecording[];
  locale: string;
  filterKey: string;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recordings.map((recording, index) => (
        <RecordingDetailedCard
          key={`${recording.shortId}-${filterKey}`}
          variant="grid"
          shortId={recording.shortId}
          slug={recording.slug}
          title={recording.title}
          speaker={recording.speaker}
          date={recording.date}
          thumbnail={recording.thumbnail}
          location={recording.location}
          tags={recording.tags}
          access={recording.access}
          isFirst={index < 8}
          className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[28px] bg-white/90 text-neutral-900 shadow-lg ring-1 shadow-black/5 ring-black/5 transition-all hover:shadow-xl dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10"
          locale={locale}
        />
      ))}
    </div>
  );
}
