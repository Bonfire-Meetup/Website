import { buildSitemapXml } from "../lib/sitemap";

const BASE_URL = "https://www.bnf.events";

export const revalidate = 60 * 60 * 24 * 7;

const STATIC_PATHS = ["/", "/library", "/photos", "/timeline", "/crew", "/press", "/legal"];

export async function GET() {
  const urls = STATIC_PATHS.map((path) => ({ loc: `${BASE_URL}${path}` }));
  const body = buildSitemapXml(urls);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
