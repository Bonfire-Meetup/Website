import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import type { EventItem } from "./components/EventsSection";
import { LocationsSection } from "./components/LocationsSection";
import { RecordingsSection } from "./components/RecordingsSection";
import { TalkBanner } from "./components/TalkBanner";
import { RecordingsSectionSkeleton, LocationsSectionSkeleton } from "./components/Skeletons";

import upcomingEventsData from "./data/upcoming-events.json";
import { getHeroImages, getHomepageRecordings } from "./lib/data";

const EventsSection = dynamic(() =>
  import("./components/EventsSection").then((mod) => mod.EventsSection),
);

export default async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const photoAlt = t("hero.photoAlt");

  const heroImages = await getHeroImages(photoAlt);
  const homepageRecordings = getHomepageRecordings();

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
  };

  return (
    <>
      <Header />

      <main id="top" className="relative">
        <Hero images={heroImages} />

        <EventsSection
          events={upcomingEventsData.events as unknown as EventItem[]}
          labels={eventsLabels}
          locale={locale}
        />

        <div className="section-divider mx-auto max-w-4xl" />

        <Suspense fallback={<RecordingsSectionSkeleton />}>
          <RecordingsSection recordings={homepageRecordings} />
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
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
    openGraph: {
      title: t("homeTitle"),
      description: t("homeDescription"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("homeTitle"),
      description: t("homeDescription"),
    },
  };
}
