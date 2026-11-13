"use client";

import { useTranslations } from "next-intl";

import { EventsSection } from "./components/events/EventsSection";
import { HeroWrapper } from "./components/layout/HeroWrapper";
import { LocationsSection } from "./components/locations/LocationsSection";
import { NewsletterSection } from "./components/newsletter/NewsletterSection";
import { RecordingsSection } from "./components/recordings/RecordingsSection";
import { TalkBanner } from "./components/shared/TalkBanner";
import { upcomingEventsWithFallbackOf } from "./lib/events/event-lists";
import type { EventItem } from "./lib/events/types";
import type { Recording } from "./lib/recordings/recordings";
import type { TrendingRecording } from "./lib/recordings/trending";

interface HomeContentProps {
  events: EventItem[];
  heroImages: {
    src: string;
    alt: string;
    fallbackSrc?: string;
    fallbackType?: "image/jpeg" | "image/png";
  }[];
  heroTrendingRecordings: (Recording | TrendingRecording)[];
  trendingRecordings: (Recording | TrendingRecording)[];
}

export function HomeContent({
  events,
  heroImages,
  heroTrendingRecordings,
  trendingRecordings,
}: HomeContentProps) {
  const t = useTranslations("hero");
  const photoAlt = t("photoAlt");

  const imagesWithAlt = heroImages.map((img) => ({
    ...img,
    alt: photoAlt,
  }));
  const upcomingEvents = upcomingEventsWithFallbackOf(events, new Date());

  return (
    <main id="top" className="relative">
      <HeroWrapper images={imagesWithAlt} trendingRecordings={heroTrendingRecordings} />

      <EventsSection events={upcomingEvents} cardVariant="compact" />

      <div className="section-divider mx-auto max-w-4xl" />

      <RecordingsSection recordings={trendingRecordings} />

      <div className="section-divider mx-auto max-w-4xl" />

      <NewsletterSection />

      <div className="section-divider mx-auto max-w-4xl" />

      <LocationsSection events={events} />

      <div className="section-divider mx-auto max-w-4xl" />

      <TalkBanner />
    </main>
  );
}
