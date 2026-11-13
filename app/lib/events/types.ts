import { type LocationValue } from "@/lib/config/constants";

export interface EventSpeakerGroup {
  id: string;
  name: string;
  url?: string;
}

export interface EventSpeaker {
  /** Ids into app/data/speakers.json, in the same order as `name`. */
  speakerIds?: string[];
  name: string | string[];
  company?: string | string[];
  topic: string;
  description?: string;
  startTime?: string;
  profileId?: string | string[];
  url?: string | string[];
  recordingId?: string;
  /** A podcast crew or similar that appears as one act; `name` still lists its members. */
  group?: EventSpeakerGroup;
}

export interface EventLinks {
  luma?: string;
  facebook?: string;
  eventbrite?: string;
}

export type EventAnnouncementStatus = "draft" | "partial" | "full";

export interface EventItem {
  announcementStatus?: EventAnnouncementStatus;
  announcedAt?: string;
  id: string;
  isPlaceholder?: boolean;
  title: string;
  episode?: string;
  location: LocationValue;
  date: string;
  time: string;
  venue: string;
  description: string;
  registrationUrl?: string;
  speakers: EventSpeaker[];
  links?: EventLinks;
}
