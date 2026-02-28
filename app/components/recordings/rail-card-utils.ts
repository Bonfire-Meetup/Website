import type { ReactNode } from "react";

import type { CatalogRecording } from "@/lib/recordings/catalog-types";

export interface RailCardBadge {
  icon: ReactNode;
  count: number;
  gradient: string;
}

export function buildRailDetailedCardProps({
  recording,
  isFirst = false,
  badge,
  locale,
}: {
  recording: CatalogRecording;
  isFirst?: boolean;
  badge?: RailCardBadge;
  locale?: string;
}) {
  return {
    variant: "rail" as const,
    shortId: recording.shortId,
    slug: recording.slug,
    title: recording.title,
    speaker: recording.speaker,
    date: recording.date,
    thumbnail: recording.thumbnail,
    location: recording.location,
    tags: recording.tags,
    episode: recording.episode,
    episodeNumber: recording.episodeNumber,
    access: recording.access,
    isFirst,
    badge,
    locale,
    disableShadow: true,
  };
}

export function getRailCardKey(prefix: string, shortId: string) {
  return `${prefix}-${shortId}`;
}
