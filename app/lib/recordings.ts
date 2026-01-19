import { cache } from "react";
import { LOCATIONS, type LocationValue } from "./constants";
import pragueRecordingsData from "../data/prague-recordings.json";
import zlinRecordingsData from "../data/zlin-recordings.json";

export type Recording = {
  youtubeId: string;
  shortId: string;
  slug: string;
  title: string;
  speaker: string[];
  date: string;
  thumbnail: string;
  featureHeroThumbnail?: string;
  url: string;
  description: string | null;
  tags: string[];
  location: LocationValue;
  episode?: string;
  episodeNumber?: number;
};

export const getAllRecordings = cache((): Recording[] => {
  return [
    ...pragueRecordingsData.recordings.map((recording) => ({
      ...recording,
      tags: recording.tags.map((tag) => tag.toLowerCase()),
      location: LOCATIONS.PRAGUE,
    })),
    ...zlinRecordingsData.recordings.map((recording) => ({
      ...recording,
      tags: recording.tags.map((tag) => tag.toLowerCase()),
      location: LOCATIONS.ZLIN,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

export function getRecordingBySlug(slug: string): Recording | undefined {
  return getAllRecordings().find((recording) => recording.slug === slug);
}

export function getRelatedRecordings(
  recording: Recording,
  allRecordings: Recording[],
  limit = 4,
): Recording[] {
  const getScore = (r: Recording) => {
    let score = 0;
    if (r.location === recording.location) score += 2;
    score += r.tags.filter((tag) => recording.tags.includes(tag)).length * 3;
    return score;
  };

  return allRecordings
    .filter((r) => r.youtubeId !== recording.youtubeId)
    .sort((a, b) => getScore(b) - getScore(a))
    .slice(0, limit);
}
