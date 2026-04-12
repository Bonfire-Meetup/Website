import photoAlbumsSummaryJson from "@/data/photo-albums/summary.json";
import type { PhotoAlbumSummary } from "@/lib/photos/types";

export interface PhotoAlbumsSummaryPayload {
  baseUrl: string;
  albums: PhotoAlbumSummary[];
}

export const photoAlbumsSummary = photoAlbumsSummaryJson as PhotoAlbumsSummaryPayload;

export const PHOTO_ALBUM_BASE_URL = photoAlbumsSummary.baseUrl;

export function getPhotoAlbumSummariesOrdered(): PhotoAlbumSummary[] {
  return photoAlbumsSummary.albums;
}
