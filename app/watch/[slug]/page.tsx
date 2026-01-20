import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getLocale, getTranslations } from "next-intl/server";
import { getAllRecordings, getRelatedRecordings } from "../../lib/recordings";

const RecordingPlayer = dynamic(() =>
  import("../../components/RecordingPlayer").then((mod) => mod.RecordingPlayer),
);

function getWatchSlug(recording: { slug: string; shortId: string }) {
  return `${recording.slug}-${recording.shortId}`;
}

function parseShortId(slug: string) {
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
    spark: t("spark"),
    sparks: t("sparks"),
    lightItUp: t("lightItUp"),
    nextUp: t("nextUp"),
    speaker: t("speaker"),
    date: t("date"),
    about: t("about"),
    relatedTitle: t("relatedTitle"),
    back: t("back"),
    epShort: t("epShort"),
    special: t("special"),
    share: t("share"),
    copyLink: t("copyLink"),
    copied: t("copied"),
  };

  const allRecordings = getAllRecordings();
  const relatedRecordings = getRelatedRecordings(recording, allRecordings);

  return (
    <RecordingPlayer
      recording={recording}
      relatedRecordings={relatedRecordings}
      labels={labels}
      locale={locale}
    />
  );
}
