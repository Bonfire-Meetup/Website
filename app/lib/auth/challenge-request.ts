import { generateChallengeToken, generateOtpCode, hashOtpCode } from "@/lib/auth/otp";
import { insertAuthChallenge, maybeCleanupExpiredAuthChallenges } from "@/lib/data/auth";
import {
  getClientFingerprint,
  getEmailFingerprint,
  logError,
  logInfo,
  logWarn,
} from "@/lib/utils/log";

interface ChallengeRequestConfig {
  email: string;
  request: Request;
  maxAttempts: number;
  maxEmailChallenges: number;
  maxIpChallenges: number;
  rateLimitWindowMs: number;
  ttlMs: number;
  sendEmail: (email: string, code: string) => Promise<void>;
  logPrefix: string;
  rateLimitStore: Map<string, number[]>;
  allowSilentFailure?: boolean;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getClientIp = (headers: Headers) => {
  const forwarded = headers.get("x-forwarded-for");
  const ip = headers.get("x-real-ip") || forwarded?.split(",")[0]?.trim() || null;

  return ip === "0.0.0.0" ? null : ip;
};

const isRateLimited = (
  key: string,
  maxHits: number,
  windowMs: number,
  store: Map<string, number[]>,
) => {
  const now = Date.now();
  const hits = store.get(key)?.filter((time) => now - time < windowMs) ?? [];

  if (hits.length >= maxHits) {
    store.set(key, hits);

    return true;
  }

  hits.push(now);
  store.set(key, hits);

  return false;
};

export const createEmailChallenge = async (config: ChallengeRequestConfig) => {
  const {
    email,
    request,
    maxAttempts,
    maxEmailChallenges,
    maxIpChallenges,
    rateLimitWindowMs,
    ttlMs,
    sendEmail,
    logPrefix,
    rateLimitStore,
    allowSilentFailure,
  } = config;
  const normalizedEmail = normalizeEmail(email);
  const { headers } = request;
  const ip = getClientIp(headers);
  const userAgent = headers.get("user-agent");
  const emailFingerprint = getEmailFingerprint(normalizedEmail);
  const clientFingerprint = getClientFingerprint({ ip, userAgent });

  if (
    isRateLimited(`email:${normalizedEmail}`, maxEmailChallenges, rateLimitWindowMs, rateLimitStore)
  ) {
    logWarn(`${logPrefix}.rate_limited`, {
      ...emailFingerprint,
      ...clientFingerprint,
      scope: "email",
    });

    return { ok: false, reason: "rate_limited" as const };
  }

  if (ip && isRateLimited(`ip:${ip}`, maxIpChallenges, rateLimitWindowMs, rateLimitStore)) {
    logWarn(`${logPrefix}.rate_limited`, {
      ...emailFingerprint,
      ...clientFingerprint,
      scope: "ip",
    });

    return { ok: false, reason: "rate_limited" as const };
  }

  const code = generateOtpCode();
  const codeHash = hashOtpCode(normalizedEmail, code);
  const challengeToken = generateChallengeToken();
  const challengeTokenHash = hashOtpCode(normalizedEmail, challengeToken);
  const expiresAt = new Date(Date.now() + ttlMs);

  try {
    await sendEmail(normalizedEmail, code);
  } catch (error) {
    logError(`${logPrefix}.email_failed`, error, {
      ...emailFingerprint,
      ...clientFingerprint,
    });

    return allowSilentFailure
      ? { ok: false, reason: "silent" as const }
      : { ok: false, reason: "email_failed" as const };
  }

  try {
    await insertAuthChallenge({
      challengeTokenHash,
      codeHash,
      email: normalizedEmail,
      expiresAt,
      ip,
      maxAttempts,
      userAgent,
    });
    maybeCleanupExpiredAuthChallenges();
  } catch (error) {
    logError(`${logPrefix}.persist_failed`, error, {
      ...emailFingerprint,
      ...clientFingerprint,
    });

    return allowSilentFailure
      ? { ok: false, reason: "silent" as const }
      : { ok: false, reason: "persist_failed" as const };
  }

  logInfo(`${logPrefix}.created`, { ...emailFingerprint, ...clientFingerprint });

  return { challenge_token: challengeToken, email: normalizedEmail, ok: true };
};
