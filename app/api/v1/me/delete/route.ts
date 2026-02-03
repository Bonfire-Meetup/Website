import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withAuth, withRequestContext } from "@/lib/api/route-wrappers";
import { timingGuardHash, verifyOtpChallenge } from "@/lib/auth/challenge";
import { getAuthUserById, markAuthChallengeUsed } from "@/lib/data/auth";
import { runTransaction } from "@/lib/data/db";
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
import {
  getClientFingerprint,
  getEmailFingerprint,
  logError,
  logInfo,
  logWarn,
} from "@/lib/utils/log";

const deleteSchema = z.object({
  challenge_token: z.string().min(32),
  code: z.string().regex(/^\d{1,6}$/),
});

export const POST = withRequestContext(
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
      await runTransaction(async (tx) => {
        await tx.delete(authToken).where(eq(authToken.userId, auth.userId));
        await tx.delete(authRefreshToken).where(eq(authRefreshToken.userId, auth.userId));
        await tx.delete(authChallenge).where(eq(authChallenge.email, email));
        await tx.delete(authAttempt).where(eq(authAttempt.userId, auth.userId));
        await tx.delete(userWatchlist).where(eq(userWatchlist.userId, auth.userId));
        await tx.delete(userBoostAllocation).where(eq(userBoostAllocation.userId, auth.userId));
        await tx.delete(videoBoosts).where(eq(videoBoosts.userId, auth.userId));
        await tx.delete(newsletterSubscription).where(eq(newsletterSubscription.email, email));
        await tx.delete(contactSubmissions).where(eq(contactSubmissions.email, email));
        await tx.delete(talkProposals).where(eq(talkProposals.email, email));
        await tx.delete(appUser).where(eq(appUser.id, auth.userId));
      });
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
