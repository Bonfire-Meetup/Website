import { type EventItem, EventsSectionClient } from "./EventsSectionClient";

export type { EventItem };

export function EventsSection({ events }: { events: EventItem[] }) {
  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <EventsSectionClient events={events} initialEpisode="all" preFilteredEvents={events} />
      </div>
    </section>
  );
}
