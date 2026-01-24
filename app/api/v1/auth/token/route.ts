import crypto from "crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { timingGuardHash, verifyOtpChallenge } from "@/lib/auth/challenge";
import {
  generateRefreshToken,
  getAccessTokenTtlSeconds,
  getRefreshTokenCookieOptions,
  getRefreshTokenReuseWindowSeconds,
  getRefreshTokenTtlSeconds,
  hashRefreshToken,
  isValidRefreshTokenFormat,
  REFRESH_TOKEN_COOKIE_NAME,
  signAccessToken,
} from "@/lib/auth/jwt";
import {
  getRefreshTokenByHash,
  insertAuthAttempt,
  insertAuthToken,
  insertRefreshToken,
  markAuthChallengeUsed,
  markRefreshTokenUsed,
  maybeCleanupExpiredRefreshTokens,
  revokeRefreshTokenFamily,
  upsertAuthUser,
} from "@/lib/data/auth";
import {
  getClientFingerprint,
  getEmailFingerprint,
  logError,
  logInfo,
  logWarn,
} from "@/lib/utils/log";
import { getRequestId, runWithRequestContext } from "@/lib/utils/request-context";

// Schema for email OTP grant
const otpGrantSchema = z.object({
  grant_type: z.literal("urn:bonfire:grant-type:email-otp"),
  challenge_token: z.string().min(32),
  code: z.string().regex(/^\d{1,6}$/),
  email: z.string().email(),
});

// Schema for refresh token grant
const refreshGrantSchema = z.object({
  grant_type: z.literal("refresh_token"),
});

// Combined schema - discriminated union
const tokenRequestSchema = z.discriminatedUnion("grant_type", [otpGrantSchema, refreshGrantSchema]);

// Rate limiting config
const rateLimitWindowMs = 10 * 60_000;
const maxEmailVerifications = 10;
const maxIpVerifications = 20;
const refreshRateLimitWindowMs = 60_000;
const maxRefreshPerIp = 30;
const failureDelayMs = 200;

const rateLimitStore = new Map<string, number[]>();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getClientIp = (headers: Headers) => {
  const forwarded = headers.get("x-forwarded-for");
  const ip = headers.get("x-real-ip") || forwarded?.split(",")[0]?.trim() || null;

  return ip === "0.0.0.0" ? null : ip;
};

const isRateLimited = (key: string, maxHits: number, windowMs: number = rateLimitWindowMs) => {
  const now = Date.now();
  const hits = rateLimitStore.get(key)?.filter((time) => now - time < windowMs) ?? [];

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
    const delay = () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, failureDelayMs);
      });

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      logWarn("auth.token.invalid_request");
      await delay();
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    const result = tokenRequestSchema.safeParse(payload);

    if (!result.success) {
      logWarn("auth.token.invalid_request");
      await delay();
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    const { headers } = request;
    const ip = getClientIp(headers);
    const userAgent = headers.get("user-agent");
    const clientFingerprint = getClientFingerprint({ ip, userAgent });
    const requestId = getRequestId() ?? "unknown";

    if (result.data.grant_type === "refresh_token") {
      return handleRefreshTokenGrant(request, ip, userAgent, clientFingerprint, requestId);
    }
    return handleEmailOtpGrant(result.data, ip, userAgent, clientFingerprint, requestId);
  });

// Helper to create and set tokens
const issueTokens = async (
  userId: string,
  tokenFamilyId: string,
  parentId: string | null,
  ip: string | null,
  userAgent: string | null,
) => {
  // Generate access token
  const accessTokenJti = crypto.randomUUID();
  const accessToken = await signAccessToken(userId, accessTokenJti);
  const accessExpiresIn = getAccessTokenTtlSeconds();
  const accessExpiresAt = new Date(Date.now() + accessExpiresIn * 1000);

  await insertAuthToken({
    expiresAt: accessExpiresAt,
    ip,
    jti: accessTokenJti,
    userAgent,
    userId,
  });

  // Generate refresh token
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const refreshExpiresIn = getRefreshTokenTtlSeconds();
  const refreshExpiresAt = new Date(Date.now() + refreshExpiresIn * 1000);

  await insertRefreshToken({
    expiresAt: refreshExpiresAt,
    ip,
    tokenHash: refreshTokenHash,
    parentId,
    tokenFamilyId,
    userAgent,
    userId,
  });

  // Build cookie
  const cookieOptions = getRefreshTokenCookieOptions(refreshExpiresIn);
  const cookieValue = `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}; HttpOnly; ${cookieOptions.secure ? "Secure; " : ""}SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}; Max-Age=${cookieOptions.maxAge}`;

  return {
    accessToken,
    accessExpiresIn,
    accessTokenJti,
    cookieValue,
  };
};

// Handle grant_type=refresh_token
const handleRefreshTokenGrant = async (
  request: Request,
  ip: string | null,
  userAgent: string | null,
  clientFingerprint: ReturnType<typeof getClientFingerprint>,
  requestId: string,
) => {
  const delay = () =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, failureDelayMs);
    });

  const unauthorizedResponse = async (reason: string) => {
    await delay();
    logWarn("auth.token.refresh.unauthorized", { reason, ...clientFingerprint, requestId });

    // Clear the refresh token cookie on failure
    const clearCookie = `${REFRESH_TOKEN_COOKIE_NAME}=; HttpOnly; Secure; SameSite=strict; Path=/api/v1/auth; Max-Age=0`;

    return NextResponse.json(
      { error: "unauthorized" },
      {
        status: 401,
        headers: {
          "Set-Cookie": clearCookie,
        },
      },
    );
  };

  // Rate limit by IP
  if (ip && isRateLimited(`refresh:${ip}`, maxRefreshPerIp, refreshRateLimitWindowMs)) {
    logWarn("auth.token.refresh.rate_limited", { ...clientFingerprint, requestId });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // Get refresh token from cookie
  const cookieStore = await cookies();
  const refreshTokenFromCookie = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (!refreshTokenFromCookie) {
    return unauthorizedResponse("missing_refresh_token");
  }

  // Validate token format
  if (!isValidRefreshTokenFormat(refreshTokenFromCookie)) {
    return unauthorizedResponse("invalid_refresh_token_format");
  }

  // Hash the token to look up in database
  const tokenHash = hashRefreshToken(refreshTokenFromCookie);
  const refreshToken = await getRefreshTokenByHash(tokenHash);

  if (!refreshToken) {
    return unauthorizedResponse("invalid_refresh_token");
  }

  if (refreshToken.revoked_at) {
    logWarn("auth.token.refresh.revoked_token_used", {
      ...clientFingerprint,
      tokenFamilyId: refreshToken.token_family_id,
      requestId,
    });
    return unauthorizedResponse("revoked_refresh_token");
  }

  if (refreshToken.expires_at <= new Date()) {
    return unauthorizedResponse("expired_refresh_token");
  }

  // Check for token reuse (theft detection)
  if (refreshToken.used_at) {
    const usedAtTime = refreshToken.used_at.getTime();
    const now = Date.now();
    const reuseWindowMs = getRefreshTokenReuseWindowSeconds() * 1000;

    if (now - usedAtTime > reuseWindowMs) {
      // Token reuse detected - potential theft!
      logError("auth.token.refresh.token_reuse_detected", new Error("Token reuse detected"), {
        ...clientFingerprint,
        tokenFamilyId: refreshToken.token_family_id,
        usedAt: refreshToken.used_at.toISOString(),
        requestId,
      });

      await revokeRefreshTokenFamily(refreshToken.token_family_id);
      return unauthorizedResponse("token_reuse_detected");
    }

    // Within grace period - likely concurrent request
    logInfo("auth.token.refresh.concurrent_request", { ...clientFingerprint, requestId });
  }

  // Mark current refresh token as used
  await markRefreshTokenUsed(tokenHash);

  // Issue new tokens
  const { accessToken, accessExpiresIn, accessTokenJti, cookieValue } = await issueTokens(
    refreshToken.user_id,
    refreshToken.token_family_id,
    refreshToken.id,
    ip,
    userAgent,
  );

  maybeCleanupExpiredRefreshTokens();

  logInfo("auth.token.refresh.success", {
    ...clientFingerprint,
    accessTokenJti,
    tokenFamilyId: refreshToken.token_family_id,
    requestId,
  });

  return NextResponse.json(
    {
      access_token: accessToken,
      expires_in: accessExpiresIn,
      token_type: "Bearer",
    },
    {
      headers: {
        "Set-Cookie": cookieValue,
        "Cache-Control": "no-store",
        Pragma: "no-cache",
      },
    },
  );
};

// Handle grant_type=urn:bonfire:grant-type:email-otp
const handleEmailOtpGrant = async (
  data: z.infer<typeof otpGrantSchema>,
  ip: string | null,
  userAgent: string | null,
  clientFingerprint: ReturnType<typeof getClientFingerprint>,
  requestId: string,
) => {
  const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
  const delay = () =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, failureDelayMs);
    });

  const email = normalizeEmail(data.email);
  const emailFingerprint = getEmailFingerprint(email);

  const recordAttempt = async (outcome: string, userId?: string | null) => {
    if (!emailFingerprint.emailHash) {
      return;
    }

    await insertAuthAttempt({
      emailDomain: emailFingerprint.emailDomain,
      emailHash: emailFingerprint.emailHash,
      ipHash: clientFingerprint.ipHash ?? undefined,
      outcome,
      requestId,
      userAgentHash: clientFingerprint.userAgentHash ?? undefined,
      userId,
    });
  };

  if (isRateLimited(`email:${email}`, maxEmailVerifications)) {
    logWarn("auth.token.rate_limited", {
      ...emailFingerprint,
      ...clientFingerprint,
      scope: "email",
    });
    await recordAttempt("rate_limited");
    await delay();
    return respond({ error: "rate_limited" }, { status: 429 });
  }

  if (ip && isRateLimited(`ip:${ip}`, maxIpVerifications)) {
    logWarn("auth.token.rate_limited", {
      ...emailFingerprint,
      ...clientFingerprint,
      scope: "ip",
    });
    await recordAttempt("rate_limited");
    await delay();
    return respond({ error: "rate_limited" }, { status: 429 });
  }

  const verification = await verifyOtpChallenge({
    challengeToken: data.challenge_token,
    code: data.code,
    email,
    timingGuard: timingGuardHash,
  });

  if (!verification.ok) {
    logWarn("auth.token.invalid_code", {
      ...emailFingerprint,
      ...clientFingerprint,
      reason: verification.reason,
    });
    await recordAttempt(verification.reason);
    await delay();

    if (verification.reason === "expired") {
      return respond({ error: "expired" }, { status: 410 });
    }

    if (verification.reason === "max_attempts") {
      return respond({ error: "too_many_attempts" }, { status: 429 });
    }

    return respond({ error: "invalid_code" }, { status: 400 });
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

  // Create new token family for this login
  const tokenFamilyId = crypto.randomUUID();

  const { accessToken, accessExpiresIn, accessTokenJti, cookieValue } = await issueTokens(
    userId,
    tokenFamilyId,
    null,
    ip,
    userAgent,
  );

  await recordAttempt("success", userId);
  logInfo("auth.token.issued", {
    ...emailFingerprint,
    ...clientFingerprint,
    accessTokenJti,
    tokenFamilyId,
  });

  return NextResponse.json(
    {
      access_token: accessToken,
      expires_in: accessExpiresIn,
      token_type: "Bearer",
    },
    {
      headers: {
        "Set-Cookie": cookieValue,
        "Cache-Control": "no-store",
        Pragma: "no-cache",
      },
    },
  );
};
