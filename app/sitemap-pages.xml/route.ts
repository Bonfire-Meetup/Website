import { buildSitemapXml } from "@/lib/utils/sitemap-utils";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { WEBSITE_URLS } from "@/lib/config/constants";

const CACHE_CONTROL = "public, max-age=0, s-maxage=604800, stale-while-revalidate=86400";

const STATIC_PATHS = [
  PAGE_ROUTES.HOME,
  PAGE_ROUTES.LIBRARY,
  PAGE_ROUTES.PHOTOS,
  PAGE_ROUTES.TIMELINE,
  PAGE_ROUTES.CREW,
  PAGE_ROUTES.PRESS,
  PAGE_ROUTES.LEGAL,
  PAGE_ROUTES.CONTACT,
  PAGE_ROUTES.SPEAK,
];

export async function GET() {
  const urls = STATIC_PATHS.map((path) => ({ loc: `${WEBSITE_URLS.BASE}${path}` }));
  const body = buildSitemapXml(urls);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
