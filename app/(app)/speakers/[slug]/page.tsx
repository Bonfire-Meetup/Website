import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getAllSpeakerProfiles, getSpeakerProfile } from "@/lib/events/speaker-profiles";
import { buildNotFoundTitleMetadata, getMetaTitleSuffix } from "@/lib/metadata";
import {
  PHOTO_ALBUM_BASE_URL,
  getPhotoAlbumSummariesOrdered,
} from "@/lib/photos/photo-album-summary";
import { photoAlbumUrlSlug } from "@/lib/photos/photo-albums-resolve";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { SpeakerCommunityCard } from "./SpeakerCommunityCard";
import { SpeakerProfileContent } from "./SpeakerProfileContent";

export function generateStaticParams() {
  return getAllSpeakerProfiles().map((profile) => ({ slug: profile.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = getSpeakerProfile(slug);

  if (!profile) {
    return buildNotFoundTitleMetadata("speakerNotFound");
  }

  const [t, titleSuffix] = await Promise.all([
    getTranslations("speakerPage"),
    getMetaTitleSuffix(),
  ]);
  const description = t("metaDescription", { name: profile.name });
  const images = profile.photoUrl ? [profile.photoUrl] : undefined;

  return {
    description,
    openGraph: { description, images, title: profile.name, type: "profile" },
    title: `${profile.name}${titleSuffix}`,
    twitter: { card: "summary", description, images, title: profile.name },
  };
}

export default async function SpeakerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = getSpeakerProfile(slug);

  if (!profile) {
    notFound();
  }

  const recordingsById = new Map(
    getAllRecordings().map((recording) => [recording.shortId, recording]),
  );
  const albums = getPhotoAlbumSummariesOrdered();
  const talks = profile.talks.map((talk) => {
    const recording = talk.recordingId ? recordingsById.get(talk.recordingId) : undefined;
    const album = albums.find((item) => item.episodeId === talk.eventId);

    return {
      ...talk,
      photos: album
        ? {
            count: album.count,
            coverSrc: `${PHOTO_ALBUM_BASE_URL}/${album.cover.src}`,
            href: PAGE_ROUTES.PHOTOS_ALBUM(photoAlbumUrlSlug(album)),
          }
        : undefined,
      recording: recording
        ? {
            href: PAGE_ROUTES.WATCH(recording.slug, recording.shortId),
            thumbnail: recording.thumbnail,
          }
        : undefined,
    };
  });

  return (
    <SpeakerProfileContent
      profile={profile}
      talks={talks}
      communitySlot={
        profile.profileId ? (
          <Suspense fallback={null}>
            <SpeakerCommunityCard profileId={profile.profileId} />
          </Suspense>
        ) : null
      }
    />
  );
}
