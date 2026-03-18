import { isTbaDate, parseEventDateTimeMs, parseEventDateTimeParts } from "@/lib/events/datetime";
import type { EventAnnouncementStatus, EventItem, EventSpeaker } from "@/lib/events/types";

import eventsCalendarData from "./events-calendar.json";

export { isTbaDate, parseEventDateTimeParts };

interface EventCalendarJson {
  events: CalendarEventJson[];
}

interface CalendarEventJson {
  announcementStatus?: EventAnnouncementStatus;
  announcedAt?: string;
  id: string;
  title: string;
  episode?: string;
  location: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  speakers: (EventSpeaker & { start?: string })[];
  links?: {
    luma?: string;
    facebook?: string;
    eventbrite?: string;
  };
}

const PAST_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

function validateEvent(event: CalendarEventJson): EventItem {
  const speakers: EventSpeaker[] = event.speakers.map((speaker) => ({
    name: speaker.name,
    ...(speaker.company && { company: speaker.company }),
    startTime: speaker.startTime ?? speaker.start,
    topic: speaker.topic,
    ...(speaker.description && { description: speaker.description }),
    ...(speaker.profileId && { profileId: speaker.profileId }),
    ...(speaker.url && { url: speaker.url }),
    ...(speaker.recordingId && { recordingId: speaker.recordingId }),
  }));

  return {
    announcedAt: event.announcedAt,
    announcementStatus: event.announcementStatus,
    date: event.date,
    description: event.description,
    episode: event.episode,
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

export function isEventPast(event: Pick<EventItem, "date" | "time">, now: Date): boolean {
  const startMs = parseEventStartMs(event);
  if (startMs === null) {
    return false;
  }

  return now.getTime() > startMs + PAST_GRACE_PERIOD_MS;
}

const rawEvents = (eventsCalendarData as EventCalendarJson).events.map(validateEvent);

export const allEvents: EventItem[] = [...rawEvents].sort(compareByStartAsc);

const allEventsById = new Map(allEvents.map((event) => [event.id, event]));

export function getEventById(id: string): EventItem | undefined {
  return allEventsById.get(id);
}

export function getUpcomingEvents(now: Date): EventItem[] {
  return allEvents.filter((event) => !isEventPast(event, now));
}

export function getPastEvents(now: Date): EventItem[] {
  const events: EventItem[] = [];
  for (let i = allEvents.length - 1; i >= 0; i -= 1) {
    const event = allEvents[i];
    if (event && isEventPast(event, now)) {
      events.push(event);
    }
  }
  return events;
}

const upcomingFallbackEvents: EventItem[] = [
  {
    date: "TBA",
    description: "Next Prague meetup details will be announced soon.",
    id: "tba-prague",
    isPlaceholder: true,
    location: "Prague",
    speakers: [{ name: "TBA", topic: "To be announced" }],
    time: "TBA",
    title: "Bonfire@Prague - To be announced",
    venue: "Prague",
  },
  {
    date: "TBA",
    description: "Next Zlin meetup details will be announced soon.",
    id: "tba-zlin",
    isPlaceholder: true,
    location: "Zlin",
    speakers: [{ name: "TBA", topic: "To be announced" }],
    time: "TBA",
    title: "Bonfire@Zlin - To be announced",
    venue: "Zlin",
  },
];

export function getUpcomingEventsWithFallback(now: Date): EventItem[] {
  const upcomingEvents = getUpcomingEvents(now);
  const locationsWithUpcoming = new Set(upcomingEvents.map((event) => event.location));
  const missingLocationFallbacks = upcomingFallbackEvents.filter(
    (event) => !locationsWithUpcoming.has(event.location),
  );

  return [...upcomingEvents, ...missingLocationFallbacks];
}
