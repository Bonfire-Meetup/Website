import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./components/layout/Hero";
import type { EventsSectionLabels } from "./components/events/EventsSection";
import { LocationsSection } from "./components/locations/LocationsSection";
import { RecordingsSection } from "./components/recordings/RecordingsSection";
import { TalkBanner } from "./components/shared/TalkBanner";
import { RecordingsSectionSkeleton, LocationsSectionSkeleton } from "./components/shared/Skeletons";

import { upcomingEvents } from "./data/upcoming-events";
import { getHeroImages } from "./lib/recordings/data";
import { getTrendingRecordings } from "./lib/recordings/trending";
import { EventsSection } from "./components/events/EventsSection";

export const revalidate = 3600;

export default async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const photoAlt = t("hero.photoAlt");

  const heroImages = await getHeroImages(photoAlt);
  const trendingRecordings = await getTrendingRecordings(6);

  const eventsLabels = {
    title: t("sections.events.title"),
    subtitle: t("sections.events.subtitle"),
    filterLabel: t("sections.events.filter.label"),
    filterAll: t("sections.events.filter.all"),
    noEvents: t("sections.events.noEvents"),
    eventCard: {
      locationLabel: t("events.locationLabel", { location: "{location}" }),
      episodeLabel: t("events.episodeLabel"),
      tba: t("events.tba"),
      speakers: t("events.speakers"),
      register: t("events.register"),
      platforms: {
        luma: t("events.platforms.luma"),
        facebook: t("events.platforms.facebook"),
        eventbrite: t("events.platforms.eventbrite"),
      },
    },
  } satisfies EventsSectionLabels;

  return (
    <>
      <Header />

      <main id="top" className="relative">
        <Hero images={heroImages} />

        <EventsSection events={upcomingEvents} labels={eventsLabels} locale={locale} />

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
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
    country: tCommon("country"),
  };
  return {
    title: t("homeTitle", commonValues),
    description: t("homeDescription", commonValues),
    openGraph: {
      title: t("homeTitle", commonValues),
      description: t("homeDescription", commonValues),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("homeTitle", commonValues),
      description: t("homeDescription", commonValues),
    },
  };
}
