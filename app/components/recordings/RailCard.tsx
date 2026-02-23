import type { CatalogRecording } from "./RecordingsCatalogTypes";
import type { ReactNode } from "react";

import { RecordingDetailedCard } from "./RecordingDetailedCard";

interface RailCardBadge {
  icon: ReactNode;
  count: number;
  gradient: string;
}

interface RailCardProps {
  recording: CatalogRecording;
  isFirst?: boolean;
  badge?: RailCardBadge;
}

export function RailCard({ recording, isFirst = false, badge }: RailCardProps) {
  return (
    <RecordingDetailedCard
      variant="rail"
      shortId={recording.shortId}
      slug={recording.slug}
      title={recording.title}
      speaker={recording.speaker}
      date={recording.date}
      thumbnail={recording.thumbnail}
      location={recording.location}
      tags={recording.tags}
      episode={recording.episode}
      episodeNumber={recording.episodeNumber}
      access={recording.access}
      isFirst={isFirst}
      badge={badge}
      className="group relative flex w-[75vw] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] bg-white/90 text-neutral-900 shadow-lg ring-1 shadow-black/5 ring-black/5 transition-all hover:-translate-y-1 sm:w-[45vw] lg:w-[280px] xl:w-[300px] dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10"
    />
  );
}
