import { NextResponse } from "next/server";
import { addVideoBoost, getVideoBoostStats, removeVideoBoost } from "@/lib/data/boosts";
import { validateVideoApiRequest, getAuthUserId, checkRateLimit } from "@/lib/api/rate-limit";
import { videoBoostStatsSchema, videoBoostMutationSchema } from "@/lib/api/schemas";
import { logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return runWithRequestContext(request, async () => {
    const { id: videoId } = await params;
    const validation = await validateVideoApiRequest(videoId, "read");
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    try {
      const { userId, status } = await getAuthUserId(request);
      if (status === "invalid") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const rateLimit = await checkRateLimit(videoId, "read", userId ?? "anonymous", 60);
      if (rateLimit.rateLimited) {
        return NextResponse.json({ error: "Rate limited" }, { status: 429 });
      }
      const stats = await getVideoBoostStats(videoId, userId);
      const validated = videoBoostStatsSchema.parse(stats);
      return NextResponse.json(validated, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      logError("video.boosts.get_failed", error, { videoId });
      return NextResponse.json({ error: "Failed to load boosts" }, { status: 500 });
    }
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return runWithRequestContext(request, async () => {
    const { id: videoId } = await params;
    const validation = await validateVideoApiRequest(videoId, "write");
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    try {
      const { userId, status } = await getAuthUserId(request);
      if (status !== "valid" || !userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const rateLimit = await checkRateLimit(videoId, "write", userId, 10);
      if (rateLimit.rateLimited) {
        return NextResponse.json({ error: "Rate limited" }, { status: 429 });
      }
      const result = await addVideoBoost(videoId, userId);
      const validated = videoBoostMutationSchema.parse(result);
      return NextResponse.json(validated);
    } catch (error) {
      logError("video.boosts.post_failed", error, { videoId });
      return NextResponse.json({ error: "Failed to save boost" }, { status: 500 });
    }
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return runWithRequestContext(request, async () => {
    const { id: videoId } = await params;
    const validation = await validateVideoApiRequest(videoId, "write");
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    try {
      const { userId, status } = await getAuthUserId(request);
      if (status !== "valid" || !userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const rateLimit = await checkRateLimit(videoId, "write", userId, 10);
      if (rateLimit.rateLimited) {
        return NextResponse.json({ error: "Rate limited" }, { status: 429 });
      }
      const result = await removeVideoBoost(videoId, userId);
      const validated = videoBoostMutationSchema.parse(result);
      return NextResponse.json(validated);
    } catch (error) {
      logError("video.boosts.delete_failed", error, { videoId });
      return NextResponse.json({ error: "Failed to remove boost" }, { status: 500 });
    }
  });
}
