import type { PhotoAlbum } from "@/lib/photos/types";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";

import photoAlbums from "@/data/photo-albums.json";
import { CACHE_LIFETIMES } from "@/lib/config/cache-lifetimes";
import { buildAlbumSlug, formatEpisodeTitle, getEpisodeById } from "@/lib/recordings/episodes";

import { PhotosPageContent } from "./PhotosPageContent";

const { baseUrl, albums } = photoAlbums as { baseUrl: string; albums: PhotoAlbum[] };

function hashSeed(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickDailyRandomImage(album: PhotoAlbum, seed: string) {
  const coverSrc = album.cover.src;
  const candidates = album.images.filter((img) => img.src !== coverSrc);
  if (candidates.length === 0) {
    return album.cover;
  }
  const index = hashSeed(`${seed}-${album.id}`) % candidates.length;
  return candidates[index];
}

function pickSeededImages<T>(images: T[], limit: number, seed: string) {
  if (images.length <= limit) {
    return images;
  }
  const pool = [...images];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = hashSeed(`${seed}-${i}`) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, limit);
}

async function getPhotosPageData() {
  "use cache";
  cacheLife({ revalidate: CACHE_LIFETIMES.PHOTOS_PAGE_HERO });

  const buildSeed = new Date().toISOString();
  const totalPhotos = albums.reduce((sum, album) => sum + album.count, 0);

  const landscapeImages = albums.flatMap((album) =>
    album.images
      .filter((img) => img.width > img.height)
      .map((img) => ({
        alt: (() => {
          const episode = getEpisodeById(album.episodeId);
          return episode ? formatEpisodeTitle(episode) : album.id;
        })(),
        src: `${baseUrl}/${img.src}`,
      })),
  );
  const slideshowImages = pickSeededImages(landscapeImages, 10, buildSeed);

  const preparedAlbums = albums.map((album) => {
    const episode = getEpisodeById(album.episodeId);
    const highlight = pickDailyRandomImage(album, buildSeed);
    return {
      id: album.id,
      slug: buildAlbumSlug(album.id, album.episodeId),
      title: episode ? formatEpisodeTitle(episode) : album.id,
      count: album.count,
      coverSrc: `${baseUrl}/${album.cover.src}`,
      highlightSrc: `${baseUrl}/${highlight.src}`,
    };
  });

  return { preparedAlbums, slideshowImages, totalPhotos };
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };

  return {
    description: t("photosDescription", commonValues),
    openGraph: {
      description: t("photosDescription", commonValues),
      title: t("photosTitle", commonValues),
      type: "website",
    },
    title: t("photosTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("photosDescription", commonValues),
      title: t("photosTitle", commonValues),
    },
  };
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
