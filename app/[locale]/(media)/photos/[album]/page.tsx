import type { PhotoAlbum } from "@/lib/photos/types";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import photoAlbums from "@/data/photo-albums.json";
import { buildAlbumSlug, formatEpisodeTitle, getEpisodeById } from "@/lib/recordings/episodes";

import { AlbumPageContent } from "./AlbumPageContent";

const { albums } = photoAlbums as { baseUrl: string; albums: PhotoAlbum[] };

function toAlbumSlug(album: PhotoAlbum) {
  return buildAlbumSlug(album.id, album.episodeId);
}

interface PageProps {
  params: Promise<{ album: string }>;
}

export function generateStaticParams() {
  return albums.map((album) => ({
    album: toAlbumSlug(album),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };
  const { album: albumId } = await params;
  const album = albums.find((item) => albumId === item.id || albumId.startsWith(`${item.id}-`));

  if (!album) {
    return {
      description: t("photosDescription", commonValues),
      title: t("photosTitle", commonValues),
    };
  }

  const episode = getEpisodeById(album.episodeId);
  const title = episode ? formatEpisodeTitle(episode) : album.id;
  const brandName = tCommon("brandName");

  return {
    description: t("photosDescription", commonValues),
    openGraph: {
      description: t("photosDescription", commonValues),
      title: `${title} | ${brandName}`,
      type: "website",
    },
    title: `${title} | ${brandName}`,
    twitter: {
      card: "summary_large_image",
      description: t("photosDescription", commonValues),
      title: `${title} | ${brandName}`,
    },
  };
}

export default async function AlbumPage({ params }: PageProps) {
  const { album: albumId } = await params;
  const album = albums.find((item) => albumId === item.id || albumId.startsWith(`${item.id}-`));

  if (!album) {
    notFound();
  }

  return <AlbumPageContent albumId={albumId} />;
}
