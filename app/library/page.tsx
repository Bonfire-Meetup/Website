import { getLocale, getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { getAllRecordings } from "../lib/recordings";
import { getProxiedThumbnailUrl } from "../lib/thumbnail";

const RecordingsCatalog = dynamic(() =>
  import("../components/RecordingsCatalog").then((mod) => mod.RecordingsCatalog),
);

export default async function LibraryPage() {
  const t = await getTranslations("libraryPage");
  const locale = await getLocale();
  const recordings = getAllRecordings().map((recording) => ({
    shortId: recording.shortId,
    slug: recording.slug,
    title: recording.title,
    speaker: recording.speaker,
    date: recording.date,
    thumbnail: getProxiedThumbnailUrl(recording.thumbnail),
    featureHeroThumbnail: recording.featureHeroThumbnail
      ? recording.featureHeroThumbnail.startsWith("/library/featured/")
        ? recording.featureHeroThumbnail
        : getProxiedThumbnailUrl(recording.featureHeroThumbnail)
      : undefined,
    description: recording.description,
    tags: recording.tags,
    location: recording.location,
    episodeId: recording.episodeId,
    episode: recording.episode,
    episodeNumber: recording.episodeNumber,
  }));

  const labels = {
    eyebrow: t("eyebrow"),
    title: t("title"),
    subtitle: t("subtitle"),
    rows: {
      latest: t("rows.latest"),
      prague: t("rows.prague"),
      zlin: t("rows.zlin"),
      topic: t.raw("rows.topic"),
    },
    view: {
      all: t("view.all"),
      rows: t("view.rows"),
    },
    search: {
      label: t("search.label"),
      placeholder: t("search.placeholder"),
    },
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
    notRecorded: {
      title: t("notRecorded.title"),
      body: t.raw("notRecorded.body"),
      cta: t("notRecorded.cta"),
    },
  };

  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen pt-24">
        <RecordingsCatalog recordings={recordings} labels={labels} locale={locale} />
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
