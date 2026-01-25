import { NextResponse } from "next/server";

import { resolveUserId } from "@/lib/api/auth";
import { getUserBoosts } from "@/lib/data/boosts";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { logError, logWarn } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

const getWatchSlug = (recording: { slug: string; shortId: string }) =>
  `${recording.slug}-${recording.shortId}`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  return runWithRequestContext(request, async () => {
    const { userId: userIdParam } = await params;
    const userIdResult = await resolveUserId(request, "account.boosts", userIdParam);

    if (!userIdResult.success) {
      return userIdResult.response;
    }

    const { userId } = userIdResult;

    try {
      const boosts = await getUserBoosts(userId);
      const recordings = getAllRecordings();
      const recordingMap = new Map(recordings.map((recording) => [recording.shortId, recording]));
      const items = boosts
        .map((boost) => {
          const recording = recordingMap.get(boost.video_id);

          if (!recording) {
            logWarn("account.boosts.recording_missing", {
              userId,
              videoId: boost.video_id,
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
  });
}
