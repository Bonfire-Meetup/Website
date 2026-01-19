import pragueRecordingsData from "../data/prague-recordings.json";
import zlinRecordingsData from "../data/zlin-recordings.json";

export type Recording = {
  id: string;
  slug: string;
  title: string;
  speaker: string;
  date: string;
  thumbnail: string;
  url: string;
  description: string;
  tags: string[];
  location: "Prague" | "Zlin";
  episode?: string;
  episodeNumber?: number;
};

export function getAllRecordings(): Recording[] {
  return [
    ...pragueRecordingsData.recordings.map((recording) => ({
      ...recording,
      tags: recording.tags.map((tag) => tag.toLowerCase()),
      location: "Prague" as const,
    })),
    ...zlinRecordingsData.recordings.map((recording) => ({
      ...recording,
      tags: recording.tags.map((tag) => tag.toLowerCase()),
      location: "Zlin" as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRecordingBySlug(slug: string): Recording | undefined {
  return getAllRecordings().find((recording) => recording.slug === slug);
}
