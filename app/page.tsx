import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { EventsSection, type EventItem } from "./components/EventsSection";
import { LocationCard } from "./components/LocationCard";
import { RecordingsSection } from "./components/RecordingsSection";

import upcomingEventsData from "./data/upcoming-events.json";
import { getHeroImages, getHomepageRecordings } from "./lib/data";
import { LOCATIONS } from "./lib/constants";

function SectionHeader({ title, subtitle, id }: { title: string; subtitle: string; id: string }) {
  return (
    <div id={id} className="mb-16 scroll-mt-24 text-center">
      <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
        {title}
      </h2>
      <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
        {subtitle}
      </p>
    </div>
  );
}

export default async function HomePage() {
  const t = await getTranslations();
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

      <main className="relative">
        <Hero images={heroImages} />

        <EventsSection
          events={upcomingEventsData.events as unknown as EventItem[]}
          labels={eventsLabels}
        />

        <div className="section-divider mx-auto max-w-4xl" />

        <RecordingsSection recordings={homepageRecordings} />

        <div className="section-divider mx-auto max-w-4xl" />

        <section className="relative px-4 py-28 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-7xl">
            <SectionHeader
              id="locations"
              title={t("sections.locations.title")}
              subtitle={t("sections.locations.subtitle")}
            />

            <div className="grid gap-8 md:grid-cols-2">
              <LocationCard
                name={t("sections.locations.prague.name")}
                city={LOCATIONS.PRAGUE}
                description={t("sections.locations.prague.description")}
                eventCount={12}
                sponsorsTitle={t("sections.locations.sponsorsTitle")}
                sponsors={[
                  {
                    name: "Flying Rat Studio",
                    logo: "/partners/flyingrat_light.png",
                    url: "https://flying-rat.studio",
                  },
                  {
                    name: "Visiongame",
                    logo: "/partners/visiongame_light.png",
                    url: "http://visiongame.cz/",
                  },
                  {
                    name: "Space Break",
                    logo: "/partners/space_break_light.png",
                    url: "https://www.instagram.com/spacebreakcoffee/",
                    logoClassName: "h-7 sm:h-8",
                  },
                ]}
              />
              <LocationCard
                name={t("sections.locations.zlin.name")}
                city={LOCATIONS.ZLIN}
                description={t("sections.locations.zlin.description")}
                eventCount={8}
                sponsorsTitle={t("sections.locations.sponsorsTitle")}
                sponsors={[
                  {
                    name: "Flying Rat Studio",
                    logo: "/partners/flyingrat_light.png",
                    url: "https://flying-rat.studio",
                  },
                  {
                    name: "Visiongame",
                    logo: "/partners/visiongame_light.png",
                    url: "http://visiongame.cz/",
                  },
                  {
                    name: "Polyperfect",
                    logo: "/partners/polyperfect_light.png",
                    url: "https://www.polyperfect.com/",
                  },
                  {
                    name: "Tomas Bata University",
                    logo: "/partners/tomas_bata_university_light.png",
                    url: "https://www.utb.cz/en/",
                  },
                  {
                    name: "Upper",
                    logo: "/partners/upper_light.png",
                    url: "https://upper.utb.cz/",
                  },
                ]}
              />
            </div>
          </div>
        </section>
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
