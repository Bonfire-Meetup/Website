import { type EventItem } from "@/lib/events/types";

import { EventsSectionClient } from "./EventsSectionClient";

export type { EventItem } from "@/lib/events/types";

export function EventsSection({
  events,
  cardVariant = "full",
}: {
  events: EventItem[];
  cardVariant?: "full" | "compact";
}) {
  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <EventsSectionClient
          events={events}
          initialEpisode="all"
          preFilteredEvents={events}
          cardVariant={cardVariant}
        />
      </div>
    </section>
  );
}
