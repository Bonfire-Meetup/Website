import prague_2Images from "@/data/photo-albums/albums/prague-2.json";
import prague_3Images from "@/data/photo-albums/albums/prague-3.json";
import prague_4Images from "@/data/photo-albums/albums/prague-4.json";
import prague_5Images from "@/data/photo-albums/albums/prague-5.json";
import prague_6Images from "@/data/photo-albums/albums/prague-6.json";
import prague_7Images from "@/data/photo-albums/albums/prague-7.json";
import prague_8Images from "@/data/photo-albums/albums/prague-8.json";
import zlin_2Images from "@/data/photo-albums/albums/zlin-2.json";
import zlin_3Images from "@/data/photo-albums/albums/zlin-3.json";
import zlin_4Images from "@/data/photo-albums/albums/zlin-4.json";
import zlin_5Images from "@/data/photo-albums/albums/zlin-5.json";
import zlin_6Images from "@/data/photo-albums/albums/zlin-6.json";
import { photoAlbumsSummary } from "@/lib/photos/photo-album-summary";
import {
  findPhotoAlbumSummaryByKey,
  mergePhotoAlbumPayload,
} from "@/lib/photos/photo-albums-resolve";
import type { PhotoAlbum, PhotoAlbumImage } from "@/lib/photos/types";

const IMAGE_PAYLOADS: Record<string, { images: PhotoAlbumImage[] }> = {
  "zlin-5": zlin_5Images,
  "zlin-6": zlin_6Images,
  "prague-8": prague_8Images,
  "prague-7": prague_7Images,
  "prague-6": prague_6Images,
  "zlin-4": zlin_4Images,
  "prague-5": prague_5Images,
  "prague-3": prague_3Images,
  "zlin-3": zlin_3Images,
  "prague-4": prague_4Images,
  "zlin-2": zlin_2Images,
  "prague-2": prague_2Images,
};

export function getAllFullPhotoAlbums(): PhotoAlbum[] {
  return photoAlbumsSummary.albums.map((meta) => {
    const payload = IMAGE_PAYLOADS[meta.id];
    if (!payload) {
      throw new Error(`Missing image payload for album ${meta.id}`);
    }
    return mergePhotoAlbumPayload(meta, payload);
  });
}

export function getFullPhotoAlbumById(albumKey: string): PhotoAlbum | undefined {
  const meta = findPhotoAlbumSummaryByKey(photoAlbumsSummary.albums, albumKey);
  if (!meta) {
    return undefined;
  }
  const payload = IMAGE_PAYLOADS[meta.id];
  if (!payload) {
    return undefined;
  }
  return mergePhotoAlbumPayload(meta, payload);
}
