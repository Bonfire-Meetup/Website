import { NextResponse } from "next/server";
import { getUserBoosts } from "@/lib/data/boosts";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";
import { requireAuth } from "@/lib/api/auth";

const getWatchSlug = (recording: { slug: string; shortId: string }) =>
  `${recording.slug}-${recording.shortId}`;

export async function GET(request: Request) {
  return runWithRequestContext(request, async () => {
    const auth = await requireAuth(request, "account.boosts");
    if (!auth.success) {
      return auth.response;
    }

    try {
      const boosts = await getUserBoosts(auth.userId);
      const recordings = getAllRecordings();
      const recordingMap = new Map(recordings.map((recording) => [recording.shortId, recording]));
      const items = boosts
        .map((boost) => {
          const recording = recordingMap.get(boost.video_id);
          if (!recording) return null;
          return {
            shortId: recording.shortId,
            title: recording.title,
            speaker: recording.speaker,
            date: recording.date,
            slug: getWatchSlug(recording),
          };
        })
        .filter((item) => item !== null);

      return NextResponse.json({ items });
    } catch (error) {
      logError("account.boosts.failed", error);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  });
}
