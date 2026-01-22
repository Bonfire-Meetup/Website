"use client";

import { useState, useMemo } from "react";
import { EventCard, type EventCardLabels } from "./EventCard";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Pill } from "../ui/Pill";
import { type LocationValue } from "@/lib/config/constants";

export type EventItem = {
  id: string;
  title: string;
  episode?: string;
  location: LocationValue;
  date: string;
  time: string;
  venue: string;
  description: string;
  registrationUrl?: string;
  speakers: Array<{ name: string; topic: string }>;
  links?: {
    luma?: string;
    facebook?: string;
    eventbrite?: string;
  };
};

type EventsSectionLabels = {
  title: string;
  subtitle: string;
  filterLabel: string;
  filterAll: string;
  noEvents: string;
  eventCard: EventCardLabels;
};

export function EventsSectionClient({
  events,
  labels,
  locale,
  initialEpisode,
  preFilteredEvents,
}: {
  events: EventItem[];
  labels: EventsSectionLabels;
  locale: string;
  initialEpisode?: string;
  preFilteredEvents?: EventItem[];
}) {
  const [activeEpisode, setActiveEpisode] = useState(initialEpisode ?? "all");

  const episodes = useMemo(() => {
    const names = new Set<string>();
    events.forEach((event) => {
      if (event.episode) {
        names.add(event.episode);
      }
    });
    return Array.from(names);
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (activeEpisode === initialEpisode && preFilteredEvents) {
      return preFilteredEvents;
    }
    return activeEpisode === "all"
      ? events
      : events.filter((event) => event.episode === activeEpisode);
  }, [activeEpisode, events, initialEpisode, preFilteredEvents]);

  return (
    <>
      {episodes.length > 0 && (
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          <Pill
            size="sm"
            className="bg-neutral-900/5 font-semibold uppercase tracking-[0.2em] text-neutral-600 dark:bg-white/10 dark:text-neutral-300"
          >
            {labels.filterLabel}
          </Pill>
          <Button
            onClick={() => setActiveEpisode("all")}
            variant="plain"
            size="xs"
            className={`rounded-full font-semibold ${
              activeEpisode === "all"
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                : "bg-white/80 text-neutral-600 hover:bg-white dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20"
            }`}
          >
            {labels.filterAll}
          </Button>
          {episodes.map((episode) => (
            <Button
              key={episode}
              onClick={() => setActiveEpisode(episode)}
              variant="plain"
              size="xs"
              className={`rounded-full font-semibold ${
                activeEpisode === episode
                  ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20 dark:bg-white dark:text-neutral-900"
                  : "bg-white/80 text-neutral-600 hover:bg-white dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20"
              }`}
            >
              {episode}
            </Button>
          ))}
        </div>
      )}

      {filteredEvents.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              episode={event.episode}
              location={event.location}
              date={event.date}
              time={event.time}
              venue={event.venue}
              description={event.description}
              registrationUrl={event.registrationUrl ?? ""}
              speakers={event.speakers}
              links={event.links}
              labels={labels.eventCard}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔥"
          message={labels.noEvents}
          className="border-gradient max-w-2xl p-16"
          messageClassName="text-lg text-neutral-600 dark:text-neutral-400"
        />
      )}
    </>
  );
}
