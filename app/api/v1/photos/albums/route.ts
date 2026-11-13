import { NextResponse } from "next/server";

import { STATIC_DATA_CACHE_HEADERS } from "@/lib/api/public-cache";
import { toPhotoAlbumSummaryResource } from "@/lib/photos/photo-album-resource";
import { getAllFullPhotoAlbums } from "@/lib/photos/photo-albums-data";
import { sortPhotoAlbumsByEpisodeDateDesc } from "@/lib/photos/photos-page-order";

/** Lists event photo albums, newest event first, with cover image and photo count. */
export function GET() {
  const items = sortPhotoAlbumsByEpisodeDateDesc(getAllFullPhotoAlbums()).map(
    toPhotoAlbumSummaryResource,
  );

  return NextResponse.json({ items }, { headers: STATIC_DATA_CACHE_HEADERS });
}
