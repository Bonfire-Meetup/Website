import { buildSitemapXml } from "../lib/sitemap-utils";

const BASE_URL = "https://www.bnf.events";

const CACHE_CONTROL = "public, max-age=0, s-maxage=604800, stale-while-revalidate=86400";

const STATIC_PATHS = ["/", "/library", "/photos", "/timeline", "/crew", "/press", "/legal"];

export async function GET() {
  const urls = STATIC_PATHS.map((path) => ({ loc: `${BASE_URL}${path}` }));
  const body = buildSitemapXml(urls);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
