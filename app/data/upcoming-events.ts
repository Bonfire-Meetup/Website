import upcomingEventsData from "./upcoming-events.json";
import type { EventItem } from "../components/events/EventsSection";

type UpcomingEventJson = {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  speakers: Array<{ name: string; topic: string }>;
  links?: {
    luma?: string;
    facebook?: string;
    eventbrite?: string;
  };
};

function validateEvent(event: UpcomingEventJson): EventItem {
  return {
    id: event.id,
    title: event.title,
    location: event.location as EventItem["location"],
    date: event.date,
    time: event.time,
    venue: event.venue,
    description: event.description,
    speakers: event.speakers,
    links: event.links,
  };
}

export const upcomingEvents: EventItem[] = (
  upcomingEventsData as { events: UpcomingEventJson[] }
).events.map(validateEvent);
