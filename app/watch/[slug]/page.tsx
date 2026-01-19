import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { RecordingPlayer } from "../../components/RecordingPlayer";
import { getAllRecordings } from "../../lib/recordings";

function getWatchSlug(recording: { slug: string; shortId: string }) {
  return `${recording.slug}-${recording.shortId}`;
}

function parseShortId(slug: string) {
  // Short IDs are 6 characters, extract from end of slug
  return slug.slice(-6);
}

export function generateStaticParams() {
  return getAllRecordings().map((recording) => ({
    slug: getWatchSlug(recording),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shortId = parseShortId(slug);
  const recording = getAllRecordings().find((item) => item.shortId === shortId);
  const t = await getTranslations("meta");

  if (!recording) {
    return {
      title: t("recordingNotFound"),
    };
  }

  return {
    title: `${recording.title}${t("titleSuffix")}`,
    description: recording.description,
    openGraph: {
      title: recording.title,
      description: recording.description,
      url: `/watch/${getWatchSlug(recording)}`,
      images: [recording.thumbnail],
    },
    twitter: {
      card: "summary_large_image",
      title: recording.title,
      description: recording.description,
      images: [recording.thumbnail],
    },
  };
}

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shortId = parseShortId(slug);
  const recording = getAllRecordings().find((item) => item.shortId === shortId);

  if (!recording) {
    notFound();
  }

  const locale = await getLocale();
  const t = await getTranslations("recordings");
  const labels = {
    backToLibrary: t("backToLibrary"),
    exitCinema: t("exitCinema"),
    cinema: t("cinema"),
    speaker: t("speaker"),
    date: t("date"),
    about: t("about"),
    relatedTitle: t("relatedTitle"),
    back: t("back"),
    epShort: t("epShort"),
    special: t("special"),
  };

  const allRecordings = getAllRecordings();

  return (
    <RecordingPlayer
      recording={recording}
      allRecordings={allRecordings}
      labels={labels}
      locale={locale}
    />
  );
}
