import { getEpisodeById } from "@/lib/recordings/episodes";

function photoAlbumRecencyMs(episodeId: string): number {
  const date = getEpisodeById(episodeId)?.date;
  if (!date) {
    return Number.NEGATIVE_INFINITY;
  }
  return new Date(date).getTime();
}

export function sortPhotoAlbumsByEpisodeDateDesc<T extends { id: string; episodeId: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const diff = photoAlbumRecencyMs(b.episodeId) - photoAlbumRecencyMs(a.episodeId);
    if (diff !== 0) {
      return diff;
    }
    return a.id.localeCompare(b.id);
  });
}
