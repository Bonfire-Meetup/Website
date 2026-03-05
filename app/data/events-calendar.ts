import type { EventItem } from "@/components/events/EventsSection";

import eventsCalendarData from "./events-calendar.json";

interface EventCalendarJson {
  events: CalendarEventJson[];
}

interface CalendarEventJson {
  id: string;
  title: string;
  episode?: string;
  location: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  speakers: {
    name: string | string[];
    company?: string | string[];
    topic: string;
    startTime?: string;
    start?: string;
    profileId?: string | string[];
    url?: string | string[];
  }[];
  links?: {
    luma?: string;
    facebook?: string;
    eventbrite?: string;
  };
}

const PAST_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

export function isTbaDate(date: string | null | undefined): boolean {
  if (!date) {
    return false;
  }

  return date.trim().toUpperCase() === "TBA";
}

function validateEvent(event: CalendarEventJson): EventItem {
  return {
    date: event.date,
    description: event.description,
    episode: event.episode,
    id: event.id,
    links: event.links,
    location: event.location as EventItem["location"],
    speakers: event.speakers.map((speaker) => ({
      name: speaker.name,
      ...(speaker.company && { company: speaker.company }),
      startTime: speaker.startTime ?? speaker.start,
      topic: speaker.topic,
      ...(speaker.profileId && { profileId: speaker.profileId }),
      ...(speaker.url && { url: speaker.url }),
    })),
    time: event.time,
    title: event.title,
    venue: event.venue,
  };
}

export function parseEventDateTimeParts(date: string, time: string) {
  if (isTbaDate(date)) {
    return null;
  }
  const [year, month, day] = date.split("-").map((part) => Number(part));
  if (!year || !month || !day) {
    return null;
  }

  const [hour, minute] = time.split(":").map((part) => Number(part));
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return { year, month, day, hour, minute };
}

function parseEventDateTimeMs(event: Pick<EventItem, "date" | "time">): number | null {
  const parts = parseEventDateTimeParts(event.date, event.time);
  if (!parts) {
    return null;
  }
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}

function compareByStartAsc(a: EventItem, b: EventItem): number {
  const aStart = parseEventDateTimeMs(a);
  const bStart = parseEventDateTimeMs(b);

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
  const startMs = parseEventDateTimeMs(event);
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
  return upcomingEvents.length > 0 ? upcomingEvents : upcomingFallbackEvents;
}
