import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { RecordingPlayer } from "../../../components/RecordingPlayer";
import { getAllRecordings } from "../../../lib/recordings";

import { LOCATIONS } from "../../../lib/constants";

function normalizeLocation(value: string) {
  const lower = value.toLowerCase();
  if (lower === LOCATIONS.PRAGUE.toLowerCase()) return LOCATIONS.PRAGUE;
  if (lower === LOCATIONS.ZLIN.toLowerCase()) return LOCATIONS.ZLIN;
  return null;
}

export function generateStaticParams() {
  return getAllRecordings().map((recording) => ({
    location: recording.location.toLowerCase(),
    slug: recording.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string; slug: string }>;
}) {
  const { slug, location } = await params;
  const normalizedLocation = normalizeLocation(location);
  const fallbackRecording = getAllRecordings().find((item) => item.slug === slug);
  const recording =
    normalizedLocation &&
    getAllRecordings().find((item) => item.slug === slug && item.location === normalizedLocation);

  if (!recording && fallbackRecording) {
    return {
      title: `${fallbackRecording.title} | Bonfire`,
      description: fallbackRecording.description,
      openGraph: {
        title: fallbackRecording.title,
        description: fallbackRecording.description,
        url: `/recordings/${fallbackRecording.location.toLowerCase()}/${fallbackRecording.slug}`,
        images: [fallbackRecording.thumbnail],
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackRecording.title,
        description: fallbackRecording.description,
        images: [fallbackRecording.thumbnail],
      },
    };
  }

  if (!recording) {
    const t = await getTranslations("meta");
    return {
      title: t("recordingNotFound"),
    };
  }

  return {
    title: `${recording.title} | Bonfire`,
    description: recording.description,
    openGraph: {
      title: recording.title,
      description: recording.description,
      url: `/recordings/${recording.location.toLowerCase()}/${recording.slug}`,
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

export default async function VideoPage({
  params,
}: {
  params: Promise<{ location: string; slug: string }>;
}) {
  const { slug, location } = await params;
  const normalizedLocation = normalizeLocation(location);
  const fallbackRecording = getAllRecordings().find((item) => item.slug === slug);
  const recording =
    normalizedLocation &&
    getAllRecordings().find((item) => item.slug === slug && item.location === normalizedLocation);

  if (!recording && fallbackRecording) {
    redirect(`/recordings/${fallbackRecording.location.toLowerCase()}/${fallbackRecording.slug}`);
  }

  if (!recording || !normalizedLocation) {
    notFound();
  }

  const t = await getTranslations("recordings");
  const labels = {
    backToRecordings: t("backToRecordings"),
    exitCinema: t("exitCinema"),
    cinema: t("cinema"),
    speaker: t("speaker"),
    date: t("date"),
    about: t("about"),
  };

  return <RecordingPlayer recording={recording} labels={labels} />;
}
