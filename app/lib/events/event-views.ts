import "server-only";

import { cacheLife } from "next/cache";

import { allEvents } from "@/data/events-calendar";
import { LOCATIONS, type LocationValue } from "@/lib/config/constants";
import { hostedEventCountOf, pastEventsOf, upcomingEventsOf } from "@/lib/events/event-lists";
import type { EventItem, EventSpeaker } from "@/lib/events/types";

const RECENT_PAST_LIMIT = 4;

export type EventTiming = Pick<EventItem, "id" | "title" | "date" | "time">;
export type PastEventSummary = EventTiming & Pick<EventItem, "location" | "venue" | "description">;
export type SurveyEvent = EventTiming & { speakers: Pick<EventSpeaker, "name" | "topic">[] };
export type HostedEventCounts = Record<LocationValue, number>;

const toTiming = ({ id, title, date, time }: EventItem): EventTiming => ({ date, id, time, title });

const toPastSummary = (event: EventItem): PastEventSummary => ({
  ...toTiming(event),
  description: event.description,
  location: event.location,
  venue: event.venue,
});

const toSurveyEvent = (event: EventItem): SurveyEvent => ({
  ...toTiming(event),
  speakers: event.speakers.map(({ name, topic }) => ({ name, topic })),
});

async function getEventWindow() {
  "use cache";
  cacheLife("hours");

  const now = new Date();

  return {
    hostedCounts: {
      [LOCATIONS.PRAGUE]: hostedEventCountOf(allEvents, LOCATIONS.PRAGUE, now),
      [LOCATIONS.ZLIN]: hostedEventCountOf(allEvents, LOCATIONS.ZLIN, now),
    } as HostedEventCounts,
    pastAscending: pastEventsOf(allEvents, now).reverse(),
    upcoming: upcomingEventsOf(allEvents, now),
  };
}

export async function getHomeEvents() {
  const { hostedCounts, upcoming } = await getEventWindow();

  return { hostedCounts, upcoming };
}

export async function getUpcomingPageEvents() {
  const { pastAscending, upcoming } = await getEventWindow();

  return { recentPast: pastAscending.slice(-RECENT_PAST_LIMIT).map(toTiming), upcoming };
}

export async function getPastPageEvents() {
  const { pastAscending, upcoming } = await getEventWindow();

  return [...pastAscending, ...upcoming].map(toPastSummary);
}

export async function getReaderEvents() {
  const { upcoming } = await getEventWindow();

  return upcoming.map(toTiming);
}

export async function getSurveyEvents() {
  const { pastAscending, upcoming } = await getEventWindow();

  return [...pastAscending, ...upcoming].map(toSurveyEvent);
}
