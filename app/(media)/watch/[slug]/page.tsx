import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import {
  type Recording,
  getAllRecordings,
  getRelatedRecordings,
} from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";

const RecordingPlayer = dynamic(() =>
  import("@/components/recordings/RecordingPlayer").then((mod) => mod.RecordingPlayer),
);

function parseShortId(slug: string) {
  return slug.slice(-6);
}

export function generateStaticParams() {
  return getAllRecordings().map((recording) => ({
    slug: `${recording.slug}-${recording.shortId}`,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shortId = parseShortId(slug);
  const recording = getAllRecordings().find((item: Recording) => item.shortId === shortId);
  const t = await getTranslations({ locale: DEFAULT_LOCALE, namespace: "meta" });

  if (!recording) {
    return {
      title: t("recordingNotFound"),
    };
  }

  return {
    description: recording.description,
    openGraph: {
      description: recording.description,
      images: [recording.thumbnail],
      title: recording.title,
      url: PAGE_ROUTES.WATCH(recording.slug, recording.shortId),
    },
    title: `${recording.title}${t("titleSuffix")}`,
    twitter: {
      card: "summary_large_image",
      description: recording.description,
      images: [recording.thumbnail],
      title: recording.title,
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
