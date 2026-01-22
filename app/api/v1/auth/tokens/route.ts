import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccessTokenTtlSeconds, signAccessToken } from "@/app/lib/auth/jwt";
import { timingGuardHash, verifyOtpChallenge } from "@/app/lib/auth/challenge";
import { insertAuthToken, markAuthChallengeUsed, upsertAuthUser } from "@/app/lib/data/auth";
import {
  getClientFingerprint,
  getEmailFingerprint,
  logError,
  logInfo,
  logWarn,
} from "@/app/lib/utils/log";
import { runWithRequestContext } from "@/app/lib/utils/request-context";
import { insertAuthAttempt } from "@/app/lib/data/auth";
import { getRequestId } from "@/app/lib/utils/request-context";

const tokenSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{1,6}$/),
  challenge_token: z.string().min(32),
});

const rateLimitWindowMs = 10 * 60_000;
const maxEmailVerifications = 10;
const maxIpVerifications = 20;
const failureDelayMs = 200;

const rateLimitStore = new Map<string, number[]>();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getClientIp = (headers: Headers) => {
  const forwarded = headers.get("x-forwarded-for");
  const ip = headers.get("x-real-ip") || forwarded?.split(",")[0]?.trim() || null;
  return ip === "0.0.0.0" ? null : ip;
};

const isRateLimited = (key: string, maxHits: number) => {
  const now = Date.now();
  const hits = rateLimitStore.get(key)?.filter((time) => now - time < rateLimitWindowMs) ?? [];
  if (hits.length >= maxHits) {
    rateLimitStore.set(key, hits);
    return true;
  }
  hits.push(now);
  rateLimitStore.set(key, hits);
  return false;
};

export const POST = async (request: Request) =>
  runWithRequestContext(request, async () => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
    const delay = () => new Promise((resolve) => setTimeout(resolve, failureDelayMs));
    const invalidResponse = async () => {
      await delay();
      return respond({ error: "invalid_code" }, { status: 400 });
    };
    const invalidRequest = async () => {
      await delay();
      return respond({ error: "invalid_request" }, { status: 400 });
    };
    const expiredResponse = async () => {
      await delay();
      return respond({ error: "expired" }, { status: 410 });
    };
    const tooManyAttemptsResponse = async () => {
      await delay();
      return respond({ error: "too_many_attempts" }, { status: 429 });
    };
    const rateLimitedResponse = async () => {
      await delay();
      return respond({ error: "rate_limited" }, { status: 429 });
    };
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      logWarn("auth.token.invalid_request");
      return invalidRequest();
    }

    const result = tokenSchema.safeParse(payload);
    if (!result.success) {
      logWarn("auth.token.invalid_request");
      return invalidRequest();
    }

    const email = normalizeEmail(result.data.email);
    const headers = request.headers;
    const ip = getClientIp(headers);
    const userAgent = headers.get("user-agent");
    const emailFingerprint = getEmailFingerprint(email);
    const clientFingerprint = getClientFingerprint({ ip, userAgent });
    const requestId = getRequestId();

    const recordAttempt = async (outcome: string, userId?: string | null) => {
      if (!emailFingerprint.emailHash) return;
      await insertAuthAttempt({
        userId,
        emailHash: emailFingerprint.emailHash,
        emailDomain: emailFingerprint.emailDomain,
        outcome,
        ipHash: clientFingerprint.ipHash ?? undefined,
        userAgentHash: clientFingerprint.userAgentHash ?? undefined,
        requestId,
      });
    };
    if (isRateLimited(`email:${email}`, maxEmailVerifications)) {
      logWarn("auth.token.rate_limited", {
        ...emailFingerprint,
        ...clientFingerprint,
        scope: "email",
      });
      await recordAttempt("rate_limited");
      return rateLimitedResponse();
    }

    if (ip && isRateLimited(`ip:${ip}`, maxIpVerifications)) {
      logWarn("auth.token.rate_limited", {
        ...emailFingerprint,
        ...clientFingerprint,
        scope: "ip",
      });
      await recordAttempt("rate_limited");
      return rateLimitedResponse();
    }

    const verification = await verifyOtpChallenge({
      email,
      challengeToken: result.data.challenge_token,
      code: result.data.code,
      timingGuard: timingGuardHash,
    });
    if (!verification.ok) {
      logWarn("auth.token.invalid_code", {
        ...emailFingerprint,
        ...clientFingerprint,
        reason: verification.reason,
      });
      await recordAttempt(verification.reason);
      if (verification.reason === "expired") {
        return expiredResponse();
      }
      if (verification.reason === "max_attempts") {
        return tooManyAttemptsResponse();
      }
      return invalidResponse();
    }

    await markAuthChallengeUsed(verification.id);

    const userId = await upsertAuthUser(email);
    if (!userId) {
      logError("auth.token.user_failed", new Error("user_upsert_failed"), {
        ...emailFingerprint,
        ...clientFingerprint,
      });
      await recordAttempt("user_failed");
      return respond({ error: "Authentication failed" }, { status: 500 });
    }

    const jti = crypto.randomUUID();
    const accessToken = await signAccessToken(userId, jti);
    const expiresIn = getAccessTokenTtlSeconds();
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await insertAuthToken({
      jti,
      userId,
      expiresAt,
      ip,
      userAgent,
    });

    await recordAttempt("success", userId);
    logInfo("auth.token.issued", { ...emailFingerprint, ...clientFingerprint, jti });
    return respond({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: expiresIn,
    });
  });
