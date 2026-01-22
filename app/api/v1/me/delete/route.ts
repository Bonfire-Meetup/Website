import { NextResponse } from "next/server";
import { z } from "zod";
import { timingGuardHash, verifyOtpChallenge } from "@/lib/auth/challenge";
import { getAuthUserById, markAuthChallengeUsed } from "@/lib/data/auth";
import { runTransaction } from "@/lib/data/db";
import {
  getClientFingerprint,
  getEmailFingerprint,
  logError,
  logInfo,
  logWarn,
} from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";
import { requireAuth } from "@/lib/api/auth";

const deleteSchema = z.object({
  code: z.string().regex(/^\d{1,6}$/),
  challenge_token: z.string().min(32),
});

export const POST = async (request: Request) =>
  runWithRequestContext(request, async () => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
    const invalidResponse = () => respond({ error: "invalid_code" }, { status: 400 });
    const expiredResponse = () => respond({ error: "expired" }, { status: 410 });
    const tooManyAttemptsResponse = () => respond({ error: "too_many_attempts" }, { status: 429 });

    const auth = await requireAuth(request, "account.delete");
    if (!auth.success) {
      return auth.response;
    }

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
    const headers = request.headers;
    const ip =
      headers.get("x-real-ip") || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = headers.get("user-agent");
    const emailFingerprint = getEmailFingerprint(email);
    const clientFingerprint = getClientFingerprint({ ip, userAgent });
    const verification = await verifyOtpChallenge({
      email,
      challengeToken: result.data.challenge_token,
      code: result.data.code,
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
      await runTransaction((sql) => [
        sql`DELETE FROM auth_challenge WHERE email = ${email}`,
        sql`DELETE FROM app_user WHERE id = ${auth.userId}`,
      ]);
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
  });
