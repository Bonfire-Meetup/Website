import { LOCATIONS, type LocationValue } from "@/lib/config/constants";
import { isEventPast } from "@/lib/events/datetime";
import type { EventItem } from "@/lib/events/types";

const EDITION_TITLE_PATTERN = /^Bonfire@(?:Prague|Zlin) #\d+ - .+$/u;

const UPCOMING_FALLBACK_EVENTS: EventItem[] = [
  {
    date: "TBA",
    description: "Next Prague meetup details will be announced soon.",
    id: "tba-prague",
    isPlaceholder: true,
    location: LOCATIONS.PRAGUE,
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
    location: LOCATIONS.ZLIN,
    speakers: [{ name: "TBA", topic: "To be announced" }],
    time: "TBA",
    title: "Bonfire@Zlin - To be announced",
    venue: "Zlin",
  },
];

export function upcomingEventsOf(events: EventItem[], now: Date): EventItem[] {
  return events.filter((event) => !isEventPast(event, now));
}

export function pastEventsOf(events: EventItem[], now: Date): EventItem[] {
  return events.filter((event) => isEventPast(event, now)).reverse();
}

export function upcomingEventsWithFallbackOf(events: EventItem[], now: Date): EventItem[] {
  const upcoming = upcomingEventsOf(events, now);
  const locations = new Set(upcoming.map((event) => event.location));

  return [
    ...upcoming,
    ...UPCOMING_FALLBACK_EVENTS.filter((event) => !locations.has(event.location)),
  ];
}

export function hostedEventCountOf(events: EventItem[], location: LocationValue, now: Date) {
  return events.filter(
    (event) =>
      event.location === location &&
      (isEventPast(event, now) || EDITION_TITLE_PATTERN.test(event.title)),
  ).length;
}
