import photoAlbums from "../data/photo-albums.json";
import { buildAlbumSlug, getEpisodeById } from "../lib/episodes";
import { buildSitemapXml } from "../lib/sitemap-utils";

const BASE_URL = "https://www.bnf.events";
const PAGE_SIZE = 10000;

type Album = {
  id: string;
  episodeId?: string;
};

const { albums } = photoAlbums as { albums: Album[] };

const CACHE_CONTROL = "public, max-age=0, s-maxage=604800, stale-while-revalidate=86400";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pageParam = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = albums.slice(start, start + PAGE_SIZE);

  const urls = pageItems.map((album) => {
    const slug = buildAlbumSlug(album.id, album.episodeId);
    const episode = album.episodeId ? getEpisodeById(album.episodeId) : undefined;
    const lastmod = episode?.date ? new Date(episode.date).toISOString() : undefined;

    return {
      loc: `${BASE_URL}/photos/${slug}`,
      lastmod,
    };
  });

  const body = buildSitemapXml(urls);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
