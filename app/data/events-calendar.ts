import type { LocationValue } from "@/lib/config/constants";
import {
  isEventPast,
  isTbaDate,
  parseEventDateTimeMs,
  parseEventDateTimeParts,
} from "@/lib/events/datetime";
import {
  hostedEventCountOf,
  pastEventsOf,
  upcomingEventsOf,
  upcomingEventsWithFallbackOf,
} from "@/lib/events/event-lists";
import { getSpeakerRecord, getSpeakerTalkRecord } from "@/lib/events/speaker-records";
import type { EventAnnouncementStatus, EventItem, EventSpeaker } from "@/lib/events/types";
import { eventEpisodeLabel } from "@/lib/recordings/episodes";

import eventsCalendarData from "./events-calendar.json";

export { isEventPast, isTbaDate, parseEventDateTimeParts };

interface EventCalendarJson {
  events: CalendarEventJson[];
}

/** A talk in events-calendar.json: who spoke is a reference into speakers.json. */
interface CalendarSpeakerJson {
  description?: string;
  group?: string;
  recordingId?: string;
  speaker: string | string[];
  start?: string;
  startTime?: string;
  topic: string;
}

interface CalendarEventJson {
  announcementStatus?: EventAnnouncementStatus;
  announcedAt?: string;
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  speakers: CalendarSpeakerJson[];
  links?: {
    luma?: string;
    facebook?: string;
    eventbrite?: string;
  };
}

function requireSpeakerRecord(id: string, eventId: string) {
  const record = getSpeakerRecord(id);
  if (!record) {
    throw new Error(`Event "${eventId}" refers to speaker "${id}", which is not in speakers.json.`);
  }
  return record;
}

// One value stays a string, several become an array aligned with the names.
function collapse(values: (string | undefined)[]): string | string[] | undefined {
  if (!values.some(Boolean)) {
    return undefined;
  }
  return values.length === 1 ? values[0] : values.map((value) => value ?? "");
}

function resolveSpeaker(speaker: CalendarSpeakerJson, eventId: string): EventSpeaker {
  const ids = Array.isArray(speaker.speaker) ? speaker.speaker : [speaker.speaker];
  const people = ids.map((id) => {
    const record = requireSpeakerRecord(id, eventId);
    const talk = getSpeakerTalkRecord(id, eventId);
    return {
      company: talk?.company ?? record.company,
      name: record.name,
      profileId: record.communityId,
      url: talk?.url ?? record.url,
    };
  });
  const names = people.map((person) => person.name);
  const company = collapse(people.map((person) => person.company));
  const profileId = collapse(people.map((person) => person.profileId));
  const url = collapse(people.map((person) => person.url));
  const group = speaker.group ? requireSpeakerRecord(speaker.group, eventId) : undefined;

  return {
    name: names.length === 1 ? (names[0] ?? "") : names,
    speakerIds: ids,
    ...(company && { company }),
    startTime: speaker.startTime ?? speaker.start,
    topic: speaker.topic,
    ...(speaker.description && { description: speaker.description }),
    ...(profileId && { profileId }),
    ...(url && { url }),
    ...(speaker.recordingId && { recordingId: speaker.recordingId }),
    ...(group && { group: { id: group.id, name: group.name, url: group.url } }),
  };
}

function validateEvent(event: CalendarEventJson): EventItem {
  const speakers = event.speakers.map((speaker) => resolveSpeaker(speaker, event.id));

  return {
    announcedAt: event.announcedAt,
    announcementStatus: event.announcementStatus,
    date: event.date,
    description: event.description,
    episode: eventEpisodeLabel(event.title),
    id: event.id,
    links: event.links,
    location: event.location as EventItem["location"],
    speakers,
    time: event.time,
    title: event.title,
    venue: event.venue,
  };
}

function parseEventStartMs(event: Pick<EventItem, "date" | "time">): number | null {
  return parseEventDateTimeMs(event.date, event.time);
}

function compareByStartAsc(a: EventItem, b: EventItem): number {
  const aStart = parseEventStartMs(a);
  const bStart = parseEventStartMs(b);

  if (aStart === null && bStart === null) {
    return a.title.localeCompare(b.title);
  }
  if (aStart === null) {
    return 1;
  }
  if (bStart === null) {
    return -1;
  }

  return aStart - bStart;
}

const rawEvents = (eventsCalendarData as EventCalendarJson).events.map(validateEvent);

export const allEvents: EventItem[] = [...rawEvents].sort(compareByStartAsc);

const allEventsById = new Map(allEvents.map((event) => [event.id, event]));

export function getEventById(id: string): EventItem | undefined {
  return allEventsById.get(id);
}

export function getUpcomingEvents(now: Date): EventItem[] {
  return upcomingEventsOf(allEvents, now);
}

export function getPastEvents(now: Date): EventItem[] {
  return pastEventsOf(allEvents, now);
}

export function getHostedEventCount(location: LocationValue, now: Date): number {
  return hostedEventCountOf(allEvents, location, now);
}

export function getUpcomingEventsWithFallback(now: Date): EventItem[] {
  return upcomingEventsWithFallbackOf(allEvents, now);
}
