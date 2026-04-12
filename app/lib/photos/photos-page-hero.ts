import type { PhotoAlbum } from "@/lib/photos/types";
import { formatEpisodeTitle, getEpisodeById } from "@/lib/recordings/episodes";

function hashSeed(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function pickDailyRandomAlbumImage(album: PhotoAlbum, seed: string) {
  const coverSrc = album.cover.src;
  const candidates = album.images.filter((img) => img.src !== coverSrc);
  if (candidates.length === 0) {
    return album.cover;
  }
  const index = hashSeed(`${seed}-${album.id}`) % candidates.length;
  return candidates[index];
}

export function pickSeededSubset<T>(items: T[], limit: number, seed: string) {
  if (items.length <= limit) {
    return items;
  }
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = hashSeed(`${seed}-${i}`) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, limit);
}

export function buildPhotosHeroLandscapeItems(
  albums: PhotoAlbum[],
  cdnBaseUrl: string,
): { alt: string; src: string }[] {
  return albums.flatMap((album) =>
    album.images
      .filter((img) => img.width > img.height)
      .map((img) => {
        const episode = getEpisodeById(album.episodeId);
        const alt = episode ? formatEpisodeTitle(episode) : album.id;
        return { alt, src: `${cdnBaseUrl}/${img.src}` };
      }),
  );
}
