import { NextResponse } from "next/server";
import { getAuthUserById, getAuthAttemptsByEmailHash } from "@/lib/data/auth";
import { getUserBoosts } from "@/lib/data/boosts";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { getEmailFingerprint, logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";
import { requireAuth } from "@/lib/api/auth";

const getWatchSlug = (recording: { slug: string; shortId: string }) =>
  `${recording.slug}-${recording.shortId}`;

export const GET = async (request: Request) =>
  runWithRequestContext(request, async () => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

    const auth = await requireAuth(request, "account.me");
    if (!auth.success) {
      return auth.response;
    }

    try {
      const user = await getAuthUserById(auth.userId);
      if (!user) {
        return respond({ error: "not_found" }, { status: 404 });
      }

      const fingerprint = getEmailFingerprint(user.email);
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [boosts, attempts] = await Promise.all([
        getUserBoosts(auth.userId),
        fingerprint.emailHash
          ? getAuthAttemptsByEmailHash({
              emailHash: fingerprint.emailHash,
              since,
              limit: 50,
            })
          : Promise.resolve([]),
      ]);

      const recordings = getAllRecordings();
      const recordingMap = new Map(recordings.map((recording) => [recording.shortId, recording]));

      const boostItems = boosts
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

      const attemptItems = attempts.map((attempt) => ({
        id: attempt.id,
        outcome: attempt.outcome,
        createdAt: attempt.created_at.toISOString(),
      }));

      return respond({
        profile: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at.toISOString(),
          lastLoginAt: user.last_login_at ? user.last_login_at.toISOString() : null,
          allowCommunityEmails: user.allow_community_emails,
        },
        boosts: { items: boostItems },
        attempts: { items: attemptItems },
      });
    } catch (error) {
      logError("account.me.failed", error);
      return respond({ error: "internal_error" }, { status: 500 });
    }
  });
