import type { PhotoAlbum } from "@/lib/photos/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import photoAlbums from "@/data/photo-albums.json";
import { buildMetaPageMetadata, getBrandName } from "@/lib/metadata";
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
  const { album: albumId } = await params;
  const album = albums.find((item) => albumId === item.id || albumId.startsWith(`${item.id}-`));

  if (!album) {
    return buildMetaPageMetadata("photos");
  }

  const [base, brandName] = await Promise.all([buildMetaPageMetadata("photos"), getBrandName()]);
  const episode = getEpisodeById(album.episodeId);
  const pageTitle = episode ? formatEpisodeTitle(episode) : album.id;
  const title = `${pageTitle} | ${brandName}`;

  return {
    ...base,
    openGraph: { ...base.openGraph, title },
    title,
    twitter: { ...base.twitter, title },
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
