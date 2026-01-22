"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { type LocationValue } from "@/lib/config/constants";

import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Pill } from "../ui/Pill";
import { SectionHeader } from "../ui/SectionHeader";

import { EventCard } from "./EventCard";

export interface EventItem {
  id: string;
  title: string;
  episode?: string;
  location: LocationValue;
  date: string;
  time: string;
  venue: string;
  description: string;
  registrationUrl?: string;
  speakers: { name: string; topic: string }[];
  links?: {
    luma?: string;
    facebook?: string;
    eventbrite?: string;
  };
}

export function EventsSectionClient({
  events,
  initialEpisode,
  preFilteredEvents,
}: {
  events: EventItem[];
  initialEpisode?: string;
  preFilteredEvents?: EventItem[];
}) {
  const t = useTranslations("sections.events");
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
      <SectionHeader id="events" title={t("title")} subtitle={t("subtitle")} />
      {episodes.length > 0 && (
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          <Pill
            size="sm"
            className="bg-neutral-900/5 font-semibold tracking-[0.2em] text-neutral-600 uppercase dark:bg-white/10 dark:text-neutral-300"
          >
            {t("filter.label")}
          </Pill>
          <Button
            onClick={() => setActiveEpisode("all")}
            variant="plain"
            size="xs"
            className={`rounded-full font-semibold ${
              activeEpisode === "all"
                ? "bg-brand-500 shadow-brand-500/25 text-white shadow-lg"
                : "bg-white/80 text-neutral-600 hover:bg-white dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20"
            }`}
          >
            {t("filter.all")}
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
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔥"
          message={t("noEvents")}
          className="border-gradient max-w-2xl p-16"
          messageClassName="text-lg text-neutral-600 dark:text-neutral-400"
        />
      )}
    </>
  );
}
