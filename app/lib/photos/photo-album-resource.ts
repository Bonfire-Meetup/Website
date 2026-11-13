import { PHOTO_ALBUM_BASE_URL } from "@/lib/photos/photo-album-summary";
import { photoAlbumUrlSlug } from "@/lib/photos/photo-albums-resolve";
import type { PhotoAlbum, PhotoAlbumImage, PhotoAlbumSummary } from "@/lib/photos/types";
import { formatEpisodeTitle, getEpisodeById } from "@/lib/recordings/episodes";

const toPhoto = (image: PhotoAlbumImage) => ({
  height: image.height,
  url: `${PHOTO_ALBUM_BASE_URL}/${image.src}`,
  width: image.width,
});

export function toPhotoAlbumSummaryResource(album: PhotoAlbumSummary) {
  const episode = getEpisodeById(album.episodeId);

  return {
    count: album.count,
    cover: toPhoto(album.cover),
    episodeId: album.episodeId,
    id: album.id,
    photographers: album.photographers ?? [],
    slug: photoAlbumUrlSlug(album),
    title: episode ? formatEpisodeTitle(episode) : album.id,
  };
}

export function toPhotoAlbumResource(album: PhotoAlbum) {
  return { ...toPhotoAlbumSummaryResource(album), photos: album.images.map(toPhoto) };
}
