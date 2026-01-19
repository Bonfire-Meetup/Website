"use client";

import { useMemo, useState } from "react";
import { EventCard, type EventCardLabels } from "./EventCard";
import { type LocationValue } from "../lib/constants";

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

export function EventsSection({
  events,
  labels,
  locale,
}: {
  events: EventItem[];
  labels: EventsSectionLabels;
  locale: string;
}) {
  const [activeEpisode, setActiveEpisode] = useState("all");

  const episodes = useMemo(() => {
    const names = new Set<string>();
    events.forEach((event) => {
      if (event.episode) {
        names.add(event.episode);
      }
    });
    return Array.from(names);
  }, [events]);

  const filteredEvents =
    activeEpisode === "all" ? events : events.filter((event) => event.episode === activeEpisode);

  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div id="events" className="mb-16 scroll-mt-24 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
            {labels.title}
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
            {labels.subtitle}
          </p>
        </div>

        {episodes.length > 0 && (
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full bg-neutral-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
              {labels.filterLabel}
            </span>
            <button
              type="button"
              onClick={() => setActiveEpisode("all")}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                activeEpisode === "all"
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                  : "bg-white/80 text-neutral-600 hover:bg-white dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20"
              }`}
            >
              {labels.filterAll}
            </button>
            {episodes.map((episode) => (
              <button
                key={episode}
                type="button"
                onClick={() => setActiveEpisode(episode)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  activeEpisode === episode
                    ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20 dark:bg-white dark:text-neutral-900"
                    : "bg-white/80 text-neutral-600 hover:bg-white dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20"
                }`}
              >
                {episode}
              </button>
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
          <div className="glass-card border-gradient mx-auto max-w-2xl p-16 text-center">
            <div className="mb-4 text-5xl">🔥</div>
            <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
              {labels.noEvents}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
