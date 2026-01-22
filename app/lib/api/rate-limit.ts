import { headers } from "next/headers";
import { checkBotId } from "botid/server";
import { UAParser } from "ua-parser-js";
import crypto from "crypto";
import { serverEnv } from "@/lib/config/env";
import { getRequestId } from "@/lib/utils/request-context";
import { logWarn } from "@/lib/utils/log";
import { verifyAccessToken } from "@/lib/auth/jwt";

const RATE_LIMIT_WINDOW_MS = 60_000;

const rateLimitStores = new Map<string, Map<string, number[]>>();

const hashValue = (value: string) => {
  const salt = serverEnv.BNF_HEARTS_SALT;
  return crypto.createHash("sha256").update(`${value}:${salt}`).digest("hex");
};

export const getClientHashes = async () => {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip = requestHeaders.get("x-real-ip") || forwarded?.split(",")[0]?.trim() || "0.0.0.0";
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const parser = new UAParser(userAgent);
  const { browser, os, device } = parser.getResult();
  const uaSignature = [browser.name ?? "unknown", os.name ?? "unknown", device.type ?? "desktop"]
    .join("|")
    .toLowerCase();
  return { ipHash: hashValue(ip), uaHash: hashValue(uaSignature), ip };
};

const getRateLimitStore = (storeKey: string) => {
  if (!rateLimitStores.has(storeKey)) {
    rateLimitStores.set(storeKey, new Map());
  }
  return rateLimitStores.get(storeKey)!;
};

export const isRateLimited = (storeKey: string, key: string, maxHits: number) => {
  const store = getRateLimitStore(storeKey);
  const now = Date.now();
  const hits = store.get(key)?.filter((time) => now - time < RATE_LIMIT_WINDOW_MS) ?? [];
  if (hits.length >= maxHits) {
    store.set(key, hits);
    return true;
  }
  hits.push(now);
  store.set(key, hits);
  return false;
};

export const isValidVideoId = (videoId: string) => /^[a-z0-9]{6}$/i.test(videoId);

export const isOriginAllowed = async () => {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("host");
  if (!origin || !host) return true;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
};

export const getAuthUserId = async (request: Request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { userId: null, status: "none" as const };
  }
  const token = authHeader.slice("Bearer ".length).trim();
  try {
    const payload = await verifyAccessToken(token);
    return { userId: payload.sub ?? null, status: "valid" as const };
  } catch {
    return { userId: null, status: "invalid" as const };
  }
};

export const validateVideoApiRequest = async (
  videoId: string,
  _operation: "read" | "write",
  _requireAuth = false,
) => {
  if (!isValidVideoId(videoId)) {
    logWarn("video.api.invalid_id", { videoId, requestId: getRequestId() });
    return { valid: false, error: "Missing videoId", status: 400 };
  }

  const originAllowed = await isOriginAllowed();
  if (!originAllowed) {
    logWarn("video.api.invalid_origin", { videoId, requestId: getRequestId() });
    return { valid: false, error: "Invalid origin", status: 403 };
  }

  const verification = await checkBotId();
  if (verification.isBot) {
    logWarn("video.api.bot_blocked", { videoId, requestId: getRequestId() });
    return { valid: false, error: "Bot traffic blocked", status: 403 };
  }

  return { valid: true };
};

export const checkRateLimit = async (
  videoId: string,
  operation: "read" | "write",
  identifier: string,
  maxHits: number,
) => {
  const rateLimitKey = `${operation}:${videoId}:${identifier}`;
  if (isRateLimited("video-api", rateLimitKey, maxHits)) {
    logWarn("video.api.rate_limited", { videoId, operation, requestId: getRequestId() });
    return { rateLimited: true };
  }
  return { rateLimited: false };
};
