import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { RecordingsCatalog } from "../components/RecordingsCatalog";
import { getAllRecordings } from "../lib/recordings";

export default async function LibraryPage() {
  const t = await getTranslations("libraryPage");
  const locale = await getLocale();
  const recordings = getAllRecordings().map((recording) => ({
    shortId: recording.shortId,
    slug: recording.slug,
    title: recording.title,
    speaker: recording.speaker,
    date: recording.date,
    thumbnail: recording.thumbnail,
    description: recording.description,
    tags: recording.tags,
    location: recording.location,
    episode: recording.episode,
    episodeNumber: recording.episodeNumber,
  }));

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
    disclaimer: t("disclaimer"),
    noteLabel: t("noteLabel"),
    epShort: (await getTranslations("recordings"))("epShort"),
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
          locale={locale}
        />
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("libraryTitle"),
    description: t("libraryDescription"),
    openGraph: {
      title: t("libraryTitle"),
      description: t("libraryDescription"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("libraryTitle"),
      description: t("libraryDescription"),
    },
  };
}
