import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { addVideoLike, getVideoLikeStats, removeVideoLike } from "@/app/lib/data/likes";
import { UAParser } from "ua-parser-js";
import { checkBotId } from "botid/server";
import crypto from "crypto";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_MUTATION = 5;
const RATE_LIMIT_MAX_READ = 60;

const rateLimitStore = new Map<string, number[]>();

const hashValue = (value: string) => {
  const salt = process.env.BNF_HEARTS_SALT ?? "";
  return crypto.createHash("sha256").update(`${value}:${salt}`).digest("hex");
};

const getClientHashes = (requestHeaders: Headers) => {
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip = requestHeaders.get("x-real-ip") || forwarded?.split(",")[0]?.trim() || "0.0.0.0";
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const parser = new UAParser(userAgent);
  const { browser, os, device } = parser.getResult();
  const uaSignature = [browser.name ?? "unknown", os.name ?? "unknown", device.type ?? "desktop"]
    .join("|")
    .toLowerCase();
  return { ipHash: hashValue(ip), uaHash: hashValue(uaSignature) };
};

const isRateLimited = (key: string, maxHits: number) => {
  const now = Date.now();
  const hits = rateLimitStore.get(key)?.filter((time) => now - time < RATE_LIMIT_WINDOW_MS) ?? [];
  if (hits.length >= maxHits) {
    rateLimitStore.set(key, hits);
    return true;
  }
  hits.push(now);
  rateLimitStore.set(key, hits);
  return false;
};

const isValidVideoId = (videoId: string) => /^[a-z0-9]{6}$/i.test(videoId);

const isOriginAllowed = (requestHeaders: Headers) => {
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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: videoId } = await params;
  if (!videoId || !isValidVideoId(videoId)) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  try {
    const requestHeaders = await headers();
    if (!isOriginAllowed(requestHeaders)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    const verification = await checkBotId();
    if (verification.isBot) {
      return NextResponse.json({ error: "Bot traffic blocked" }, { status: 403 });
    }
    const { ipHash, uaHash } = getClientHashes(requestHeaders);
    if (isRateLimited(`read:${videoId}:${ipHash}`, RATE_LIMIT_MAX_READ)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
    const { count, hasLiked } = await getVideoLikeStats(videoId, ipHash, uaHash);
    return NextResponse.json({ count, hasLiked }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Failed to load likes" }, { status: 500 });
  }
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: videoId } = await params;
  if (!videoId || !isValidVideoId(videoId)) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  try {
    const requestHeaders = await headers();
    if (!isOriginAllowed(requestHeaders)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    const verification = await checkBotId();
    if (verification.isBot) {
      return NextResponse.json({ error: "Bot traffic blocked" }, { status: 403 });
    }
    const { ipHash, uaHash } = getClientHashes(requestHeaders);
    if (isRateLimited(`write:${videoId}:${ipHash}`, RATE_LIMIT_MAX_MUTATION)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
    const { count, added } = await addVideoLike(videoId, ipHash, uaHash);
    return NextResponse.json({ count, added });
  } catch {
    return NextResponse.json({ error: "Failed to save like" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: videoId } = await params;
  if (!videoId || !isValidVideoId(videoId)) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  try {
    const requestHeaders = await headers();
    if (!isOriginAllowed(requestHeaders)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    const verification = await checkBotId();
    if (verification.isBot) {
      return NextResponse.json({ error: "Bot traffic blocked" }, { status: 403 });
    }
    const { ipHash, uaHash } = getClientHashes(requestHeaders);
    if (isRateLimited(`write:${videoId}:${ipHash}`, RATE_LIMIT_MAX_MUTATION)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
    const { count, removed } = await removeVideoLike(videoId, ipHash, uaHash);
    return NextResponse.json({ count, removed });
  } catch {
    return NextResponse.json({ error: "Failed to remove like" }, { status: 500 });
  }
}
