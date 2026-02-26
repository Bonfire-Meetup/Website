"use client";

import { useTranslations } from "next-intl";

import { EventsSection } from "./components/events/EventsSection";
import { HeroWrapper } from "./components/layout/HeroWrapper";
import { LocationsSection } from "./components/locations/LocationsSection";
import { NewsletterSection } from "./components/newsletter/NewsletterSection";
import { RecordingsSection } from "./components/recordings/RecordingsSection";
import { TalkBanner } from "./components/shared/TalkBanner";
import { upcomingEvents } from "./data/upcoming-events";
import type { Recording } from "./lib/recordings/recordings";
import type { TrendingRecording } from "./lib/recordings/trending";

interface HomeContentProps {
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
  heroTrendingRecordings,
  trendingRecordings,
}: HomeContentProps) {
  const t = useTranslations("hero");
  const photoAlt = t("photoAlt");

  const imagesWithAlt = heroImages.map((img) => ({
    ...img,
    alt: photoAlt,
  }));

  return (
    <main id="top" className="relative">
      <HeroWrapper images={imagesWithAlt} trendingRecordings={heroTrendingRecordings} />

      <EventsSection events={upcomingEvents} />

      <div className="section-divider mx-auto max-w-4xl" />

      <RecordingsSection recordings={trendingRecordings} />

      <div className="section-divider mx-auto max-w-4xl" />

      <NewsletterSection />

      <div className="section-divider mx-auto max-w-4xl" />

      <LocationsSection />

      <div className="section-divider mx-auto max-w-4xl" />

      <TalkBanner />
    </main>
  );
}
