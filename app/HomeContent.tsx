import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { EventsSection } from "./components/events/EventsSection";
import { HeroWrapper } from "./components/layout/HeroWrapper";
import { LocationsSection } from "./components/locations/LocationsSection";
import { NewsletterSection } from "./components/newsletter/NewsletterSection";
import { RecordingsSection } from "./components/recordings/RecordingsSection";
import { RecordingsSectionSkeleton } from "./components/shared/Skeletons";
import { TalkBanner } from "./components/shared/TalkBanner";
import { upcomingEvents } from "./data/upcoming-events";
import { type Locale } from "./lib/i18n/locales";
import { getTrendingRecordingsSafe } from "./lib/recordings/trending";

interface HomeContentProps {
  heroImages: {
    src: string;
    alt: string;
    fallbackSrc?: string;
    fallbackType?: "image/jpeg" | "image/png";
  }[];
  locale: Locale;
}

async function TrendingRecordingsSection({ locale }: { locale: Locale }) {
  const trendingRecordings = await getTrendingRecordingsSafe(6);
  return <RecordingsSection recordings={trendingRecordings} locale={locale} />;
}

export async function HomeContent({ heroImages, locale }: HomeContentProps) {
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

      <Suspense fallback={<RecordingsSectionSkeleton />}>
        <TrendingRecordingsSection locale={locale} />
      </Suspense>

      <div className="section-divider mx-auto max-w-4xl" />

      <NewsletterSection locale={locale} />

      <div className="section-divider mx-auto max-w-4xl" />

      <LocationsSection locale={locale} />

      <div className="section-divider mx-auto max-w-4xl" />

      <TalkBanner locale={locale} />
    </main>
  );
}
