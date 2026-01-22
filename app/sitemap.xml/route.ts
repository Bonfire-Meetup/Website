import type { PhotoAlbum } from "@/lib/photos/types";

import photoAlbums from "@/data/photo-albums.json";
import { WEBSITE_URLS } from "@/lib/config/constants";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { buildSitemapIndexXml } from "@/lib/utils/sitemap-utils";
const PAGE_SIZE = 10000;

const { albums } = photoAlbums as { albums: Pick<PhotoAlbum, "id" | "episodeId">[] };

const CACHE_CONTROL = "public, max-age=0, s-maxage=604800, stale-while-revalidate=86400";

function buildPagedUrls(basePath: string, totalCount: number) {
  const pages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return Array.from({ length: pages }, (_, index) => {
    const page = index + 1;
    const suffix = page === 1 ? "" : `?page=${page}`;

    return `${WEBSITE_URLS.BASE}${basePath}${suffix}`;
  });
}

export async function GET() {
  const recordingsCount = getAllRecordings().length;
  const albumCount = albums.length;

  const sitemapUrls = [
    { loc: `${WEBSITE_URLS.BASE}/sitemap-pages.xml` },
    ...buildPagedUrls("/sitemap-recordings.xml", recordingsCount).map((loc) => ({ loc })),
    ...buildPagedUrls("/sitemap-albums.xml", albumCount).map((loc) => ({ loc })),
  ];

  const body = buildSitemapIndexXml(sitemapUrls);

  return new Response(body, {
    headers: {
      "Cache-Control": CACHE_CONTROL,
      "Content-Type": "application/xml; charset=utf-8",
    },
    status: 200,
  });
}
