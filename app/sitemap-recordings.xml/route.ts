import { WEBSITE_URLS } from "@/lib/config/constants";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { buildSitemapXml } from "@/lib/utils/sitemap-utils";

const CACHE_CONTROL = "public, max-age=0, s-maxage=604800, stale-while-revalidate=86400";

export async function GET() {
  const recordings = getAllRecordings();
  const urls = recordings.map((recording) => ({
    lastmod: new Date(recording.date).toISOString(),
    loc: `${WEBSITE_URLS.BASE}${PAGE_ROUTES.WATCH(recording.slug, recording.shortId)}`,
  }));

  const body = buildSitemapXml(urls);

  return new Response(body, {
    headers: {
      "Cache-Control": CACHE_CONTROL,
      "Content-Type": "application/xml; charset=utf-8",
    },
    status: 200,
  });
}
