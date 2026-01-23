import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getAuthAttemptsByEmailHash, getAuthUserById } from "@/lib/data/auth";
import { getUserBoostAllocation, getUserBoosts } from "@/lib/data/boosts";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { getEmailFingerprint, logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

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

      const [boosts, attempts, boostAllocation] = await Promise.all([
        getUserBoosts(auth.userId),
        fingerprint.emailHash
          ? getAuthAttemptsByEmailHash({
              accountCreatedAt: user.created_at,
              emailHash: fingerprint.emailHash,
              limit: 50,
              since,
              userId: auth.userId,
            })
          : Promise.resolve([]),
        getUserBoostAllocation(auth.userId),
      ]);

      const recordings = getAllRecordings();
      const recordingMap = new Map(recordings.map((recording) => [recording.shortId, recording]));

      const boostItems = boosts
        .map((boost) => {
          const recording = recordingMap.get(boost.video_id);

          if (!recording) {
            return null;
          }

          return {
            boostedAt: boost.created_at.toISOString(),
            date: recording.date,
            shortId: recording.shortId,
            slug: getWatchSlug(recording),
            speaker: recording.speaker,
            title: recording.title,
          };
        })
        .filter((item) => item !== null);

      const attemptItems = attempts.map((attempt) => ({
        createdAt: attempt.created_at.toISOString(),
        id: attempt.id,
        outcome: attempt.outcome,
      }));

      const nextMonth = new Date(
        boostAllocation.lastAllocationDate.getFullYear(),
        boostAllocation.lastAllocationDate.getMonth() + 1,
        1,
      );

      return respond({
        attempts: { items: attemptItems },
        boostAllocation: {
          availableBoosts: boostAllocation.availableBoosts,
          nextAllocationDate: nextMonth.toISOString(),
        },
        boosts: { items: boostItems },
        profile: {
          allowCommunityEmails: user.allow_community_emails,
          createdAt: user.created_at.toISOString(),
          email: user.email,
          id: user.id,
          lastLoginAt: user.last_login_at ? user.last_login_at.toISOString() : null,
          name: user.name,
          publicProfile: user.public_profile,
        },
      });
    } catch (error) {
      logError("account.me.failed", error);

      return respond({ error: "internal_error" }, { status: 500 });
    }
  });
