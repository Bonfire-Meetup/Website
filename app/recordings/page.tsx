import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { RecordingsCatalog } from "../components/RecordingsCatalog";
import { getAllRecordings } from "../lib/recordings";

export default async function RecordingsPage() {
  const t = await getTranslations("recordingsPage");
  const recordings = getAllRecordings();

  const labels = {
    eyebrow: t("eyebrow"),
    title: t("title"),
    subtitle: t("subtitle"),
    filters: {
      title: t("filters.title"),
      location: t("filters.location"),
      tag: t("filters.tag"),
      episode: t("filters.episode"),
      reset: t("filters.reset"),
      allLocations: t("filters.allLocations"),
      allTags: t("filters.allTags"),
      allEpisodes: t("filters.allEpisodes"),
      prague: t("filters.prague"),
      zlin: t("filters.zlin"),
    },
    empty: t("empty"),
  };

  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen pt-24">
        <RecordingsCatalog
          recordings={recordings}
          title={t("title")}
          subtitle={t("subtitle")}
          labels={labels}
        />
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("recordingsTitle"),
    description: t("recordingsDescription"),
    openGraph: {
      title: t("recordingsTitle"),
      description: t("recordingsDescription"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("recordingsTitle"),
      description: t("recordingsDescription"),
    },
  };
}
