import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { UAParser } from "ua-parser-js";
import crypto from "crypto";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_MUTATION = 5;
const RATE_LIMIT_MAX_READ = 60;

const rateLimitStore = new Map<string, number[]>();

const getSql = () => {
  const url = process.env.BNF_NEON_DATABASE_URL;
  if (!url) {
    throw new Error("BNF_NEON_DATABASE_URL is not set");
  }
  return neon(url);
};

const hashValue = (value: string) => {
  const salt = process.env.BNF_HEARTS_SALT ?? "";
  return crypto.createHash("sha256").update(`${value}:${salt}`).digest("hex");
};

const getClientHashes = (requestHeaders: Headers) => {
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "0.0.0.0";
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const parser = new UAParser(userAgent);
  const { browser, os, device } = parser.getResult();
  const uaSignature = [
    browser.name ?? "unknown",
    os.name ?? "unknown",
    device.type ?? "desktop",
  ]
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
    const sql = getSql();
    const requestHeaders = await headers();
    if (!isOriginAllowed(requestHeaders)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    const { ipHash, uaHash } = getClientHashes(requestHeaders);
    if (isRateLimited(`read:${videoId}:${ipHash}`, RATE_LIMIT_MAX_READ)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
    const [{ count }] = await sql<{ count: number }[]>
      `select count(*)::int as count from video_hearts where video_id = ${videoId}`;
    const [{ exists }] = await sql<{ exists: boolean }[]>
      `select exists(select 1 from video_hearts where video_id = ${videoId} and ip_hash = ${ipHash} and ua_hash = ${uaHash}) as exists`;
    return NextResponse.json({ count, hasHearted: exists }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Failed to load hearts" }, { status: 500 });
  }
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: videoId } = await params;
  if (!videoId || !isValidVideoId(videoId)) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  try {
    const sql = getSql();
    const requestHeaders = await headers();
    if (!isOriginAllowed(requestHeaders)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    const { ipHash, uaHash } = getClientHashes(requestHeaders);
    if (isRateLimited(`write:${videoId}:${ipHash}`, RATE_LIMIT_MAX_MUTATION)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
    const inserted = await sql<{ video_id: string }[]>
      `insert into video_hearts (video_id, ip_hash, ua_hash) values (${videoId}, ${ipHash}, ${uaHash}) on conflict do nothing returning video_id`;
    const [{ count }] = await sql<{ count: number }[]>
      `select count(*)::int as count from video_hearts where video_id = ${videoId}`;
    return NextResponse.json({ count, added: inserted.length > 0 });
  } catch {
    return NextResponse.json({ error: "Failed to save heart" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: videoId } = await params;
  if (!videoId || !isValidVideoId(videoId)) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  try {
    const sql = getSql();
    const requestHeaders = await headers();
    if (!isOriginAllowed(requestHeaders)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    const { ipHash, uaHash } = getClientHashes(requestHeaders);
    if (isRateLimited(`write:${videoId}:${ipHash}`, RATE_LIMIT_MAX_MUTATION)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
    const removed = await sql<{ video_id: string }[]>
      `delete from video_hearts where video_id = ${videoId} and ip_hash = ${ipHash} and ua_hash = ${uaHash} returning video_id`;
    const [{ count }] = await sql<{ count: number }[]>
      `select count(*)::int as count from video_hearts where video_id = ${videoId}`;
    return NextResponse.json({ count, removed: removed.length > 0 });
  } catch {
    return NextResponse.json({ error: "Failed to remove heart" }, { status: 500 });
  }
}
