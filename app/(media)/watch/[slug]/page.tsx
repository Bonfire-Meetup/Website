import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { WEBSITE_URLS } from "@/lib/config/constants";
import { buildNotFoundTitleMetadata, getBrandName, getMetaTitleSuffix } from "@/lib/metadata";
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

  if (!recording) {
    return buildNotFoundTitleMetadata("recordingNotFound");
  }

  const [titleSuffix, brandName] = await Promise.all([getMetaTitleSuffix(), getBrandName()]);
  const absoluteUrl = `${WEBSITE_URLS.BASE}${PAGE_ROUTES.WATCH(recording.slug, recording.shortId)}`;
  const speakersText = recording.speaker.join(", ");
  const description = recording.description
    ? `${recording.description} | ${speakersText}`
    : `${recording.title} | ${speakersText}`;

  return {
    description,
    openGraph: {
      description,
      images: [
        {
          url: recording.thumbnail,
          width: 1280,
          height: 720,
          alt: recording.title,
        },
      ],
      siteName: brandName,
      title: recording.title,
      type: "video.other",
      url: absoluteUrl,
      videos: [
        {
          url: recording.url,
          type: "text/html",
        },
      ],
    },
    title: `${recording.title}${titleSuffix}`,
    twitter: {
      card: "summary_large_image",
      description,
      images: [recording.thumbnail],
      title: recording.title,
    },
  };
}

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shortId = parseShortId(slug);
  const allRecordings = getAllRecordings();
  const recording = allRecordings.find((item: Recording) => item.shortId === shortId);

  if (!recording) {
    notFound();
  }

  const relatedRecordings = getRelatedRecordings(recording, allRecordings);

  return <RecordingPlayer recording={recording} relatedRecordings={relatedRecordings} />;
}
