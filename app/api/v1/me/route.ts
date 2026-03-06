import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withAuth, withRequestContext } from "@/lib/api/route-wrappers";
import { timingGuardHash, verifyOtpChallenge } from "@/lib/auth/challenge";
import {
  getAuthAttemptsByEmailHash,
  getAuthUserById,
  markAuthChallengeUsed,
} from "@/lib/data/auth";
import { getUserBoostAllocation, getUserBoosts, refundBoost } from "@/lib/data/boosts";
import { db } from "@/lib/data/db";
import { deleteAllEventQuestionsByUser } from "@/lib/data/event-questions";
import {
  appUser,
  authAttempt,
  authChallenge,
  authRefreshToken,
  authToken,
  contactSubmissions,
  newsletterSubscription,
  talkProposals,
  userBoostAllocation,
  userWatchlist,
  videoBoosts,
} from "@/lib/data/schema";
import { getAllRecordings } from "@/lib/recordings/recordings";
import {
  getClientFingerprint,
  getEmailFingerprint,
  logError,
  logInfo,
  logWarn,
} from "@/lib/utils/log";

const getWatchSlug = (recording: { slug: string; shortId: string }) =>
  `${recording.slug}-${recording.shortId}`;

export const GET = withRequestContext(
  withAuth("account.me")(async (_request: Request, { auth }) => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

    try {
      const user = await getAuthUserById(auth.userId);

      if (!user) {
        return respond({ error: "not_found" }, { status: 404 });
      }

      const fingerprint = getEmailFingerprint(user.email);
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [boosts, attempts, boostAllocation] = await Promise.all([
        getUserBoosts(auth.userId),
        fingerprint.emailHash
          ? getAuthAttemptsByEmailHash({
              accountCreatedAt: user.createdAt,
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
          const recording = recordingMap.get(boost.videoId);

          if (!recording) {
            return null;
          }

          return {
            boostedAt: new Date(boost.createdAt).toISOString(),
            date: recording.date,
            shortId: recording.shortId,
            slug: getWatchSlug(recording),
            speaker: recording.speaker,
            title: recording.title,
          };
        })
        .filter((item) => item !== null);

      const attemptItems = attempts.map((attempt) => ({
        createdAt: new Date(attempt.createdAt).toISOString(),
        id: attempt.id,
        method: attempt.method,
        outcome: attempt.outcome,
        userAgentSummary: attempt.userAgentSummary,
      }));

      const lastAllocationDateObj = new Date(boostAllocation.lastAllocationDate);
      const nextMonth = new Date(
        lastAllocationDateObj.getFullYear(),
        lastAllocationDateObj.getMonth() + 1,
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
          allowCommunityEmails: user.preferences.allowCommunityEmails ?? false,
          createdAt: new Date(user.createdAt).toISOString(),
          email: user.email,
          id: user.id,
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
          name: user.name,
          publicProfile: user.preferences.publicProfile ?? false,
        },
      });
    } catch (error) {
      logError("account.me.failed", error);

      return respond({ error: "internal_error" }, { status: 500 });
    }
  }),
);

const deleteSchema = z.object({
  challenge_token: z.string().min(32),
  code: z.string().regex(/^\d{1,6}$/),
});

export const DELETE = withRequestContext(
  withAuth("account.delete")(async (request: Request, { auth }) => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
    const invalidResponse = () => respond({ error: "invalid_code" }, { status: 400 });
    const expiredResponse = () => respond({ error: "expired" }, { status: 410 });
    const tooManyAttemptsResponse = () => respond({ error: "too_many_attempts" }, { status: 429 });

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    const result = deleteSchema.safeParse(payload);

    if (!result.success) {
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    const user = await getAuthUserById(auth.userId);

    if (!user) {
      return respond({ error: "not_found" }, { status: 404 });
    }

    const email = user.email.trim().toLowerCase();
    const { headers } = request;
    const ip =
      headers.get("x-real-ip") || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = headers.get("user-agent");
    const emailFingerprint = getEmailFingerprint(email);
    const clientFingerprint = getClientFingerprint({ ip, userAgent });
    const verification = await verifyOtpChallenge({
      challengeToken: result.data.challenge_token,
      code: result.data.code,
      email,
      timingGuard: timingGuardHash,
    });

    if (!verification.ok) {
      logWarn("account.delete.invalid_code", {
        ...emailFingerprint,
        ...clientFingerprint,
        reason: verification.reason,
      });

      if (verification.reason === "expired") {
        return expiredResponse();
      }

      if (verification.reason === "max_attempts") {
        return tooManyAttemptsResponse();
      }

      return invalidResponse();
    }

    await markAuthChallengeUsed(verification.id);

    try {
      const { boostUserIds } = await deleteAllEventQuestionsByUser(auth.userId);
      const refundUserIds = boostUserIds.filter((userId) => userId !== auth.userId);

      await Promise.all(refundUserIds.map((userId) => refundBoost(userId)));

      await db().delete(authToken).where(eq(authToken.userId, auth.userId));
      await db().delete(authRefreshToken).where(eq(authRefreshToken.userId, auth.userId));
      await db().delete(authChallenge).where(eq(authChallenge.email, email));
      await db().delete(authAttempt).where(eq(authAttempt.userId, auth.userId));
      await db().delete(userWatchlist).where(eq(userWatchlist.userId, auth.userId));
      await db().delete(userBoostAllocation).where(eq(userBoostAllocation.userId, auth.userId));
      await db().delete(videoBoosts).where(eq(videoBoosts.userId, auth.userId));
      await db().delete(newsletterSubscription).where(eq(newsletterSubscription.email, email));
      await db().delete(contactSubmissions).where(eq(contactSubmissions.email, email));
      await db().delete(talkProposals).where(eq(talkProposals.email, email));
      await db().delete(appUser).where(eq(appUser.id, auth.userId));
    } catch (error) {
      logError("account.delete.failed", error, {
        ...emailFingerprint,
        ...clientFingerprint,
      });

      return respond({ error: "delete_failed" }, { status: 500 });
    }

    logInfo("account.delete.completed", {
      ...emailFingerprint,
      ...clientFingerprint,
    });

    return respond({ ok: true });
  }),
);
