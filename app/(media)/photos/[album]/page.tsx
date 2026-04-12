import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import { buildMetaPageMetadata, getBrandName } from "@/lib/metadata";
import {
  getPhotoAlbumSummariesOrdered,
  PHOTO_ALBUM_BASE_URL,
} from "@/lib/photos/photo-album-summary";
import { getFullPhotoAlbumById } from "@/lib/photos/photo-albums-data";
import { photoAlbumUrlSlug } from "@/lib/photos/photo-albums-resolve";
import { formatEpisodeTitle, getEpisodeById } from "@/lib/recordings/episodes";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { AlbumPageContent } from "./AlbumPageContent";

const albums = getPhotoAlbumSummariesOrdered();

const loadAlbum = cache((albumId: string) => getFullPhotoAlbumById(albumId));

function redirectIfNonCanonicalAlbumUrl(
  albumKey: string,
  album: NonNullable<ReturnType<typeof loadAlbum>>,
) {
  const canonical = photoAlbumUrlSlug(album);
  if (albumKey !== canonical) {
    permanentRedirect(PAGE_ROUTES.PHOTOS_ALBUM(canonical));
  }
}

interface PageProps {
  params: Promise<{ album: string }>;
}

export function generateStaticParams() {
  return albums.map((album) => ({
    album: photoAlbumUrlSlug(album),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { album: albumId } = await params;
  const album = loadAlbum(albumId);

  if (!album) {
    return buildMetaPageMetadata("photos");
  }

  redirectIfNonCanonicalAlbumUrl(albumId, album);

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
  const album = loadAlbum(albumId);

  if (!album) {
    notFound();
  }

  redirectIfNonCanonicalAlbumUrl(albumId, album);

  return <AlbumPageContent album={album} baseUrl={PHOTO_ALBUM_BASE_URL} />;
}
