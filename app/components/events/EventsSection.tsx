import { SectionHeader } from "../ui/SectionHeader";
import { EventsSectionClient, type EventItem } from "./EventsSectionClient";
import type { EventCardLabels } from "./EventCard";

export type { EventItem };

export type EventsSectionLabels = {
  title: string;
  subtitle: string;
  filterLabel: string;
  filterAll: string;
  noEvents: string;
  eventCard: EventCardLabels;
};

export function EventsSection({
  events,
  labels,
  locale,
}: {
  events: EventItem[];
  labels: EventsSectionLabels;
  locale: string;
}) {
  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeader id="events" title={labels.title} subtitle={labels.subtitle} />

        <EventsSectionClient
          events={events}
          labels={labels}
          locale={locale}
          initialEpisode="all"
          preFilteredEvents={events}
        />
      </div>
    </section>
  );
}
