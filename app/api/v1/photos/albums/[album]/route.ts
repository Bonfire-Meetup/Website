import { NextResponse } from "next/server";

import { STATIC_DATA_CACHE_HEADERS } from "@/lib/api/public-cache";
import { toPhotoAlbumResource } from "@/lib/photos/photo-album-resource";
import { getFullPhotoAlbumById } from "@/lib/photos/photo-albums-data";

interface RouteParams {
  params: Promise<{ album: string }>;
}

/** Returns one photo album with every photo's URL and dimensions. `album` is the album slug. */
export async function GET(_request: Request, { params }: RouteParams) {
  const album = getFullPhotoAlbumById((await params).album);

  if (!album) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(toPhotoAlbumResource(album), { headers: STATIC_DATA_CACHE_HEADERS });
}
