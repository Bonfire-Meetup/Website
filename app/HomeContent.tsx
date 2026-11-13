"use client";

import { useTranslations } from "next-intl";

import { EventsSection } from "./components/events/EventsSection";
import { HeroWrapper } from "./components/layout/HeroWrapper";
import { LocationsSection } from "./components/locations/LocationsSection";
import { NewsletterSection } from "./components/newsletter/NewsletterSection";
import { RecordingsSection } from "./components/recordings/RecordingsSection";
import { TalkBanner } from "./components/shared/TalkBanner";
import { upcomingEventsWithFallbackOf } from "./lib/events/event-lists";
import type { HostedEventCounts } from "./lib/events/event-views";
import type { EventItem } from "./lib/events/types";
import type { Recording } from "./lib/recordings/recordings";
import type { TrendingRecording } from "./lib/recordings/trending";

interface HomeContentProps {
  hostedCounts: HostedEventCounts;
  upcoming: EventItem[];
  speakerPhotos: Record<string, string>;
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
  heroImages,
  hostedCounts,
  upcoming,
  speakerPhotos,
  heroTrendingRecordings,
  trendingRecordings,
}: HomeContentProps) {
  const t = useTranslations("hero");
  const photoAlt = t("photoAlt");

  const imagesWithAlt = heroImages.map((img) => ({
    ...img,
    alt: photoAlt,
  }));
  const upcomingEvents = upcomingEventsWithFallbackOf(upcoming, new Date());
  const hasUpcomingEvent = upcomingEvents.some((event) => !event.isPlaceholder);

  return (
    <main id="top" className="relative">
      <HeroWrapper
        images={imagesWithAlt}
        trendingRecordings={heroTrendingRecordings}
        hasUpcomingEvent={hasUpcomingEvent}
      />

      <EventsSection events={upcomingEvents} cardVariant="compact" speakerPhotos={speakerPhotos} />

      <div className="section-divider mx-auto max-w-4xl" />

      <RecordingsSection recordings={trendingRecordings} />

      <div className="section-divider mx-auto max-w-4xl" />

      <NewsletterSection />

      <div className="section-divider mx-auto max-w-4xl" />

      <LocationsSection hostedCounts={hostedCounts} />

      <div className="section-divider mx-auto max-w-4xl" />

      <TalkBanner />
    </main>
  );
}
