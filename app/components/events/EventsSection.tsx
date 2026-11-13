import { type EventItem } from "@/lib/events/types";

import { EventsSectionClient } from "./EventsSectionClient";

export type { EventItem } from "@/lib/events/types";

export function EventsSection({
  events,
  cardVariant = "full",
  speakerPhotos,
}: {
  events: EventItem[];
  cardVariant?: "full" | "compact";
  speakerPhotos?: Record<string, string>;
}) {
  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <EventsSectionClient
          events={events}
          initialEpisode="all"
          preFilteredEvents={events}
          hideEpisodeFilter
          cardVariant={cardVariant}
          speakerPhotos={speakerPhotos}
        />
      </div>
    </section>
  );
}
