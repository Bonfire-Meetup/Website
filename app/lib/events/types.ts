import { type LocationValue } from "@/lib/config/constants";

export interface EventSpeaker {
  name: string | string[];
  company?: string | string[];
  topic: string;
  startTime?: string;
  profileId?: string | string[];
  url?: string | string[];
  recordingId?: string;
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
