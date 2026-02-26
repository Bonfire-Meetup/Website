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
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
          locale={locale}
        />
      ))}
    </div>
  );
}
