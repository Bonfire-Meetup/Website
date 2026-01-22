import { NextResponse } from "next/server";

import { checkRateLimit, getClientHashes, validateVideoApiRequest } from "@/lib/api/rate-limit";
import { videoLikeMutationSchema, videoLikeStatsSchema } from "@/lib/api/schemas";
import { addVideoLike, getVideoLikeStats, removeVideoLike } from "@/lib/data/likes";
import { logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return runWithRequestContext(_, async () => {
    const { id: videoId } = await params;
    const validation = await validateVideoApiRequest(videoId, "read");
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    try {
      const { ipHash, uaHash } = await getClientHashes();
      const rateLimit = await checkRateLimit(videoId, "read", ipHash, 60);
      if (rateLimit.rateLimited) {
        return NextResponse.json({ error: "Rate limited" }, { status: 429 });
      }
      const stats = await getVideoLikeStats(videoId, ipHash, uaHash);
      const validated = videoLikeStatsSchema.parse(stats);
      return NextResponse.json(validated, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      logError("video.likes.get_failed", error, { videoId });
      return NextResponse.json({ error: "Failed to load likes" }, { status: 500 });
    }
  });
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return runWithRequestContext(_, async () => {
    const { id: videoId } = await params;
    const validation = await validateVideoApiRequest(videoId, "write");
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    try {
      const { ipHash, uaHash } = await getClientHashes();
      const rateLimit = await checkRateLimit(videoId, "write", ipHash, 5);
      if (rateLimit.rateLimited) {
        return NextResponse.json({ error: "Rate limited" }, { status: 429 });
      }
      const result = await addVideoLike(videoId, ipHash, uaHash);
      const validated = videoLikeMutationSchema.parse(result);
      return NextResponse.json(validated);
    } catch (error) {
      logError("video.likes.post_failed", error, { videoId });
      return NextResponse.json({ error: "Failed to save like" }, { status: 500 });
    }
  });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return runWithRequestContext(_, async () => {
    const { id: videoId } = await params;
    const validation = await validateVideoApiRequest(videoId, "write");
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    try {
      const { ipHash, uaHash } = await getClientHashes();
      const rateLimit = await checkRateLimit(videoId, "write", ipHash, 5);
      if (rateLimit.rateLimited) {
        return NextResponse.json({ error: "Rate limited" }, { status: 429 });
      }
      const result = await removeVideoLike(videoId, ipHash, uaHash);
      const validated = videoLikeMutationSchema.parse(result);
      return NextResponse.json(validated);
    } catch (error) {
      logError("video.likes.delete_failed", error, { videoId });
      return NextResponse.json({ error: "Failed to remove like" }, { status: 500 });
    }
  });
}
