import speakersData from "@/data/speakers.json";

/** One talk a speaker gave: its images, plus optional overrides for that event. */
export interface SpeakerTalkRecord {
  company?: string;
  eventId: string;
  image?: { height: number; src: string; width: number };
  photo?: string;
  socials?: string[];
  url?: string;
}

/**
 * A speaker in app/data/speakers.json, the single place speaker details live.
 * Events refer to speakers by `id`. A `kind: "group"` entry is a podcast crew
 * or similar that appears as one act.
 */
export interface SpeakerRecord {
  communityId?: string;
  company?: string;
  id: string;
  kind?: "group";
  name: string;
  photo?: string;
  talks?: SpeakerTalkRecord[];
  url?: string;
}

interface SpeakersData {
  baseUrl: string;
  speakers: SpeakerRecord[];
}

const speakersFile = speakersData as SpeakersData;
const records = new Map(speakersFile.speakers.map((record) => [record.id, record]));

export function getSpeakerRecord(id: string): SpeakerRecord | undefined {
  return records.get(id);
}

export function getSpeakerTalkRecord(id: string, eventId: string): SpeakerTalkRecord | undefined {
  return records.get(id)?.talks?.find((talk) => talk.eventId === eventId);
}

export function speakerAssetUrl(src: string | undefined): string | undefined {
  return src ? `${speakersFile.baseUrl}/${src}` : undefined;
}
