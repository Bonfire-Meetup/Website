import type { EventItem } from "@/components/events/EventsSection";

import upcomingEventsData from "./upcoming-events.json";

interface UpcomingEventJson {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  speakers: { name: string; topic: string }[];
  links?: {
    luma?: string;
    facebook?: string;
    eventbrite?: string;
  };
}

function validateEvent(event: UpcomingEventJson): EventItem {
  return {
    date: event.date,
    description: event.description,
    id: event.id,
    links: event.links,
    location: event.location as EventItem["location"],
    speakers: event.speakers,
    time: event.time,
    title: event.title,
    venue: event.venue,
  };
}

export const upcomingEvents: EventItem[] = (
  upcomingEventsData as { events: UpcomingEventJson[] }
).events.map(validateEvent);
