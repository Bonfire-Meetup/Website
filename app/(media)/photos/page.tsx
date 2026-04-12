import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { CACHE_LIFETIMES } from "@/lib/config/cache-lifetimes";
import { buildMetaPageMetadata } from "@/lib/metadata";
import { PHOTO_ALBUM_BASE_URL } from "@/lib/photos/photo-album-summary";
import { getAllFullPhotoAlbums } from "@/lib/photos/photo-albums-data";
import {
  buildPhotosHeroLandscapeItems,
  pickDailyRandomAlbumImage,
  pickSeededSubset,
} from "@/lib/photos/photos-page-hero";
import { sortPhotoAlbumsByEpisodeDateDesc } from "@/lib/photos/photos-page-order";
import { buildAlbumSlug, formatEpisodeTitle, getEpisodeById } from "@/lib/recordings/episodes";

import { PhotosPageContent } from "./PhotosPageContent";

async function getPhotosPageData() {
  "use cache";
  cacheLife({ revalidate: CACHE_LIFETIMES.PHOTOS_PAGE_HERO });

  const albums = sortPhotoAlbumsByEpisodeDateDesc(getAllFullPhotoAlbums());
  const buildSeed = new Date().toISOString();
  const totalPhotos = albums.reduce((sum, album) => sum + album.count, 0);
  const cdnBase = PHOTO_ALBUM_BASE_URL;

  const landscapeImages = buildPhotosHeroLandscapeItems(albums, cdnBase);
  const slideshowImages = pickSeededSubset(landscapeImages, 10, buildSeed);

  const preparedAlbums = albums.map((album) => {
    const episode = getEpisodeById(album.episodeId);
    const highlight = pickDailyRandomAlbumImage(album, buildSeed);
    return {
      id: album.id,
      slug: buildAlbumSlug(album.id, album.episodeId),
      title: episode ? formatEpisodeTitle(episode) : album.id,
      count: album.count,
      coverSrc: `${cdnBase}/${album.cover.src}`,
      highlightSrc: `${cdnBase}/${highlight.src}`,
    };
  });

  return { preparedAlbums, slideshowImages, totalPhotos };
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("photos");
}

export default async function PhotosPage() {
  const { preparedAlbums, slideshowImages, totalPhotos } = await getPhotosPageData();

  return (
    <PhotosPageContent
      albums={preparedAlbums}
      slideshowImages={slideshowImages}
      totalPhotos={totalPhotos}
    />
  );
}
