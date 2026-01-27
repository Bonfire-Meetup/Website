import type { PhotoAlbum } from "@/lib/photos/types";

import photoAlbums from "@/data/photo-albums.json";
import { WEBSITE_URLS } from "@/lib/config/constants";
import { buildAlbumSlug, getEpisodeById } from "@/lib/recordings/episodes";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { buildSitemapXml } from "@/lib/utils/sitemap-utils";

const { albums } = photoAlbums as { albums: Pick<PhotoAlbum, "id" | "episodeId">[] };

const CACHE_CONTROL = "public, max-age=0, s-maxage=604800, stale-while-revalidate=86400";

export async function GET() {
  const urls = albums.map((album) => {
    const slug = buildAlbumSlug(album.id, album.episodeId);
    const episode = album.episodeId ? getEpisodeById(album.episodeId) : undefined;
    const lastmod = episode?.date ? new Date(episode.date).toISOString() : undefined;

    return {
      lastmod,
      loc: `${WEBSITE_URLS.BASE}${PAGE_ROUTES.PHOTOS_ALBUM(slug)}`,
    };
  });

  const body = buildSitemapXml(urls);

  return new Response(body, {
    headers: {
      "Cache-Control": CACHE_CONTROL,
      "Content-Type": "application/xml; charset=utf-8",
    },
    status: 200,
  });
}
