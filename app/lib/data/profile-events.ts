import "server-only";

import { getEventById, isEventPast } from "@/data/events-calendar";
import { getUserCheckIns } from "@/lib/data/check-in";
import { getUserRsvps } from "@/lib/data/rsvps";
import { isTbaDate, parseEventDateTimeMs } from "@/lib/events/datetime";
import { getEpisodeById } from "@/lib/recordings/episodes";

function getDateValue(date: string | null): number {
  if (!date || isTbaDate(date)) {
    return Number.NEGATIVE_INFINITY;
  }

  return parseEventDateTimeMs(date, "00:00") ?? Number.NEGATIVE_INFINITY;
}

function sortByDateAsc<T extends { date: string | null }>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    const dateA = a.date && !isTbaDate(a.date) ? getDateValue(a.date) : Number.MAX_SAFE_INTEGER;
    const dateB = b.date && !isTbaDate(b.date) ? getDateValue(b.date) : Number.MAX_SAFE_INTEGER;
    return dateA - dateB;
  });
}

function sortByDateDesc<T extends { date: string | null; activityAt?: string }>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    const dateA = getDateValue(a.date);
    const dateB = getDateValue(b.date);

    if (dateA !== dateB) {
      return dateB - dateA;
    }

    const activityA = a.activityAt ? new Date(a.activityAt).getTime() : 0;
    const activityB = b.activityAt ? new Date(b.activityAt).getTime() : 0;
    return activityB - activityA;
  });
}

function getLatestByEventId(items: { eventId: string; createdAt: string }[]): Map<string, string> {
  const byEventId = new Map<string, string>();

  for (const item of items) {
    if (!byEventId.has(item.eventId)) {
      byEventId.set(item.eventId, item.createdAt);
    }
  }

  return byEventId;
}

function resolveCalendarEvent(eventId: string) {
  return getEventById(eventId) ?? getEventById(eventId.trim().toLowerCase());
}

interface BaseProfileEvent {
  id: string;
  title: string;
  location: string;
  date: string | null;
}

export interface UpcomingRsvpEvent extends BaseProfileEvent {
  rsvpedAt: string;
}

export interface AttendedEvent extends BaseProfileEvent {
  type: "event" | "episode";
  checkedInAt?: string;
  rsvpedAt?: string;
  hasCheckIn: boolean;
  hasRsvp: boolean;
  activityAt?: string;
}

export async function getUpcomingRsvpEvents(
  userId: string,
  now: Date,
): Promise<UpcomingRsvpEvent[]> {
  const rsvps = await getUserRsvps(userId);
  const rsvpByEventId = getLatestByEventId(rsvps);
  const events: UpcomingRsvpEvent[] = [];

  for (const [eventId, rsvpedAt] of rsvpByEventId) {
    const event = resolveCalendarEvent(eventId);
    if (event && !isEventPast(event, now)) {
      events.push({
        id: event.id,
        title: event.title,
        location: event.location,
        date: event.date,
        rsvpedAt,
      });
    }
  }

  return sortByDateAsc(events);
}

export async function getAttendedEvents(userId: string, now: Date): Promise<AttendedEvent[]> {
  const [rsvps, checkIns] = await Promise.all([getUserRsvps(userId), getUserCheckIns(userId)]);
  const rsvpByEventId = getLatestByEventId(rsvps);
  const checkInByEventId = getLatestByEventId(checkIns);
  const eventsById = new Map<string, AttendedEvent>();

  for (const [eventId, checkedInAt] of checkInByEventId) {
    const event = resolveCalendarEvent(eventId);

    if (event) {
      eventsById.set(eventId, {
        id: event.id,
        title: event.title,
        location: event.location,
        date: event.date,
        type: "event",
        checkedInAt,
        hasCheckIn: true,
        hasRsvp: false,
        activityAt: checkedInAt,
      });
    } else {
      const episode = getEpisodeById(eventId);
      if (episode) {
        eventsById.set(eventId, {
          id: episode.id,
          title: `Bonfire@${episode.city === "prague" ? "Prague" : "Zlin"} #${episode.number} - ${episode.title}`,
          location: episode.city === "prague" ? "Prague" : "Zlin",
          date: episode.date,
          type: "episode",
          checkedInAt,
          hasCheckIn: true,
          hasRsvp: false,
          activityAt: checkedInAt,
        });
      }
    }
  }

  for (const [eventId, rsvpedAt] of rsvpByEventId) {
    const event = resolveCalendarEvent(eventId);
    if (event && isEventPast(event, now)) {
      const existing = eventsById.get(eventId);
      if (existing) {
        existing.hasRsvp = true;
        existing.rsvpedAt = rsvpedAt;
        existing.activityAt = existing.checkedInAt ?? rsvpedAt;
      } else {
        eventsById.set(eventId, {
          id: event.id,
          title: event.title,
          location: event.location,
          date: event.date,
          type: "event",
          hasCheckIn: false,
          hasRsvp: true,
          rsvpedAt,
          activityAt: rsvpedAt,
        });
      }
    }
  }

  return sortByDateDesc(Array.from(eventsById.values()));
}
