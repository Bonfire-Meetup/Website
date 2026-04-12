import type { PhotoAlbum, PhotoAlbumImage, PhotoAlbumSummary } from "@/lib/photos/types";
import { buildAlbumSlug } from "@/lib/recordings/episodes";

export function mergePhotoAlbumPayload(
  meta: PhotoAlbumSummary,
  payload: { images: PhotoAlbumImage[] },
): PhotoAlbum {
  return {
    ...meta,
    images: payload.images,
    count: payload.images.length,
  };
}

export function findPhotoAlbumSummaryByKey(
  summaries: PhotoAlbumSummary[],
  albumKey: string,
): PhotoAlbumSummary | undefined {
  return summaries.find((a) => albumKey === a.id || albumKey.startsWith(`${a.id}-`));
}

export function photoAlbumUrlSlug(album: Pick<PhotoAlbumSummary, "id" | "episodeId">): string {
  return buildAlbumSlug(album.id, album.episodeId);
}
