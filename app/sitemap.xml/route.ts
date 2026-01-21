import { getAllRecordings } from "../lib/recordings";
import photoAlbums from "../data/photo-albums.json";
import { buildSitemapIndexXml } from "../lib/sitemap";

const BASE_URL = "https://www.bnf.events";
const PAGE_SIZE = 10000;

type Album = {
  id: string;
  episodeId?: string;
};

const { albums } = photoAlbums as { albums: Album[] };

export const revalidate = 60 * 60 * 24 * 7;

function buildPagedUrls(basePath: string, totalCount: number) {
  const pages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  return Array.from({ length: pages }, (_, index) => {
    const page = index + 1;
    const suffix = page === 1 ? "" : `?page=${page}`;
    return `${BASE_URL}${basePath}${suffix}`;
  });
}

export async function GET() {
  const recordingsCount = getAllRecordings().length;
  const albumCount = albums.length;

  const sitemapUrls = [
    { loc: `${BASE_URL}/sitemap-pages.xml` },
    ...buildPagedUrls("/sitemap-recordings.xml", recordingsCount).map((loc) => ({ loc })),
    ...buildPagedUrls("/sitemap-albums.xml", albumCount).map((loc) => ({ loc })),
  ];

  const body = buildSitemapIndexXml(sitemapUrls);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
