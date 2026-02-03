import { NextResponse } from "next/server";

import { withRequestContext, withResolvedUserId } from "@/lib/api/route-wrappers";
import { getUserBoosts } from "@/lib/data/boosts";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { logError, logWarn } from "@/lib/utils/log";

const getWatchSlug = (recording: { slug: string; shortId: string }) =>
  `${recording.slug}-${recording.shortId}`;

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export const GET = withRequestContext(
  withResolvedUserId<RouteParams>("account.boosts")(async (_request: Request, { userId }) => {
    try {
      const boosts = await getUserBoosts(userId);
      const recordings = getAllRecordings();
      const recordingMap = new Map(recordings.map((recording) => [recording.shortId, recording]));
      const items = boosts
        .map((boost) => {
          const recording = recordingMap.get(boost.videoId);

          if (!recording) {
            logWarn("account.boosts.recording_missing", {
              userId,
              videoId: boost.videoId,
            });

            return null;
          }

          return {
            date: recording.date,
            shortId: recording.shortId,
            slug: getWatchSlug(recording),
            speaker: recording.speaker,
            title: recording.title,
          };
        })
        .filter((item) => item !== null);

      return NextResponse.json({ items });
    } catch (error) {
      logError("account.boosts.failed", error, { userId });

      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
