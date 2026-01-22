import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import {
  getAllRecordings,
  getRelatedRecordings,
  type Recording,
} from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";

const RecordingPlayer = dynamic(() =>
  import("@/components/recordings/RecordingPlayer").then((mod) => mod.RecordingPlayer),
);

function getWatchSlug(recording: { slug: string; shortId: string }) {
  return `${recording.slug}-${recording.shortId}`;
}

function parseShortId(slug: string) {
  return slug.slice(-6);
}

export function generateStaticParams() {
  return getAllRecordings().map((recording: Recording) => ({
    slug: getWatchSlug(recording),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shortId = parseShortId(slug);
  const recording = getAllRecordings().find((item: Recording) => item.shortId === shortId);
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
      url: PAGE_ROUTES.WATCH(recording.slug, recording.shortId),
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
  const recording = getAllRecordings().find((item: Recording) => item.shortId === shortId);

  if (!recording) {
    notFound();
  }

  const allRecordings = getAllRecordings();
  const relatedRecordings = getRelatedRecordings(recording, allRecordings);

  return <RecordingPlayer recording={recording} relatedRecordings={relatedRecordings} />;
}
