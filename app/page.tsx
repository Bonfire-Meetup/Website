import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { EventsSection } from "./components/events/EventsSection";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { Hero } from "./components/layout/Hero";
import { LocationsSection } from "./components/locations/LocationsSection";
import { RecordingsSection } from "./components/recordings/RecordingsSection";
import { LocationsSectionSkeleton, RecordingsSectionSkeleton } from "./components/shared/Skeletons";
import { TalkBanner } from "./components/shared/TalkBanner";
import { upcomingEvents } from "./data/upcoming-events";
import { getHeroImages } from "./lib/recordings/data";
import { getTrendingRecordings } from "./lib/recordings/trending";

export const revalidate = 3600;

export default async function HomePage() {
  const t = await getTranslations();
  const photoAlt = t("hero.photoAlt");

  const heroImages = await getHeroImages(photoAlt);
  const trendingRecordings = await getTrendingRecordings(6);

  return (
    <>
      <Header />

      <main id="top" className="relative">
        <Hero images={heroImages} />

        <EventsSection events={upcomingEvents} />

        <div className="section-divider mx-auto max-w-4xl" />

        <Suspense fallback={<RecordingsSectionSkeleton />}>
          <RecordingsSection recordings={trendingRecordings} />
        </Suspense>

        <div className="section-divider mx-auto max-w-4xl" />

        <Suspense fallback={<LocationsSectionSkeleton />}>
          <LocationsSection />
        </Suspense>

        <div className="section-divider mx-auto max-w-4xl" />

        <TalkBanner />
      </main>

      <Footer />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };

  return {
    description: t("homeDescription", commonValues),
    openGraph: {
      description: t("homeDescription", commonValues),
      title: t("homeTitle", commonValues),
      type: "website",
    },
    title: t("homeTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("homeDescription", commonValues),
      title: t("homeTitle", commonValues),
    },
  };
}
