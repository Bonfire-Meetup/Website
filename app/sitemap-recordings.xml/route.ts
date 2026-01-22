import { getAllRecordings } from "../lib/recordings/recordings";
import { buildSitemapXml } from "../lib/utils/sitemap-utils";

const BASE_URL = "https://www.bnf.events";
const PAGE_SIZE = 10000;

const CACHE_CONTROL = "public, max-age=0, s-maxage=604800, stale-while-revalidate=86400";

function getWatchSlug(recording: { slug: string; shortId: string }) {
  return `${recording.slug}-${recording.shortId}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pageParam = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const recordings = getAllRecordings();
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = recordings.slice(start, start + PAGE_SIZE);

  const urls = pageItems.map((recording) => ({
    loc: `${BASE_URL}/watch/${getWatchSlug(recording)}`,
    lastmod: new Date(recording.date).toISOString(),
  }));

  const body = buildSitemapXml(urls);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
