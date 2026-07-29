import { WEBSITE_URLS } from "@/lib/config/constants";
import { isRecordingRestricted } from "@/lib/recordings/early-access";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { buildVideosRssXml } from "@/lib/utils/rss-utils";

const CACHE_CONTROL = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";

export async function GET() {
  const recordings = getAllRecordings().filter(
    (recording) => !isRecordingRestricted(recording.access),
  );

  const body = buildVideosRssXml(recordings, {
    description:
      "Talks, podcasts, and interviews from Bonfire Events — a game development community in Prague and Zlin.",
    feedUrl: `${WEBSITE_URLS.BASE}${PAGE_ROUTES.FEED_VIDEOS}`,
    link: `${WEBSITE_URLS.BASE}${PAGE_ROUTES.LIBRARY}`,
    managingEditor: `${WEBSITE_URLS.CONTACT_EMAIL} (Bonfire Events)`,
    title: "Bonfire Events — Videos",
  });

  return new Response(body, {
    headers: {
      "Cache-Control": CACHE_CONTROL,
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
    status: 200,
  });
}
