import type { TrendingRecording } from "./lib/recordings/trending";
import { getTranslations } from "next-intl/server";

import { EventsSection } from "./components/events/EventsSection";
import { HeroWrapper } from "./components/layout/HeroWrapper";
import { LocationsSection } from "./components/locations/LocationsSection";
import { NewsletterSection } from "./components/newsletter/NewsletterSection";
import { RecordingsSection } from "./components/recordings/RecordingsSection";
import { TalkBanner } from "./components/shared/TalkBanner";
import { upcomingEvents } from "./data/upcoming-events";
import { type Locale } from "./lib/i18n/locales";

interface HomeContentProps {
  heroImages: {
    src: string;
    alt: string;
    fallbackSrc?: string;
    fallbackType?: "image/jpeg" | "image/png";
  }[];
  trendingRecordings: TrendingRecording[];
  locale: Locale;
}

export async function HomeContent({ heroImages, trendingRecordings, locale }: HomeContentProps) {
  const t = await getTranslations({ locale, namespace: "hero" });
  const photoAlt = t("photoAlt");

  const imagesWithAlt = heroImages.map((img) => ({
    ...img,
    alt: photoAlt,
  }));

  return (
    <main id="top" className="relative">
      <HeroWrapper images={imagesWithAlt} locale={locale} />

      <EventsSection events={upcomingEvents} />

      <div className="section-divider mx-auto max-w-4xl" />

      <RecordingsSection recordings={trendingRecordings} locale={locale} />

      <div className="section-divider mx-auto max-w-4xl" />

      <NewsletterSection locale={locale} />

      <div className="section-divider mx-auto max-w-4xl" />

      <LocationsSection locale={locale} />

      <div className="section-divider mx-auto max-w-4xl" />

      <TalkBanner locale={locale} />
    </main>
  );
}
