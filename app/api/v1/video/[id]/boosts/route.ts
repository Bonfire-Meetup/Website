import { NextResponse } from "next/server";

import { checkRateLimit, getAuthUserId, validateVideoApiRequest } from "@/lib/api/rate-limit";
import { videoBoostMutationSchema, videoBoostStatsSchema } from "@/lib/api/schemas";
import {
  addVideoBoost,
  consumeBoost,
  getVideoBoostStats,
  getUserBoostAllocation,
  refundBoost,
  removeVideoBoost,
} from "@/lib/data/boosts";
import { logError, logWarn } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return runWithRequestContext(request, async () => {
    const { id: videoId } = await params;
    const validation = await validateVideoApiRequest(videoId, "read");

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    let userId: string | null = null;

    try {
      const authResult = await getAuthUserId(request);
      ({ userId } = authResult);

      if (authResult.status === "invalid") {
        logWarn("video.boosts.unauthorized", { operation: "get", videoId });

        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const rateLimit = await checkRateLimit(videoId, "read", userId ?? "anonymous", 60);

      if (rateLimit.rateLimited) {
        logWarn("video.boosts.rate_limited", { operation: "get", userId, videoId });

        return NextResponse.json({ error: "Rate limited" }, { status: 429 });
      }

      const stats = await getVideoBoostStats(videoId, userId);

      // Add available boosts for authenticated users
      if (userId && authResult.status === "valid") {
        const allocation = await getUserBoostAllocation(userId);
        const statsWithAllocation = {
          ...stats,
          availableBoosts: allocation.availableBoosts,
        };
        const validated = videoBoostStatsSchema.parse(statsWithAllocation);

        return NextResponse.json(validated, { headers: { "Cache-Control": "no-store" } });
      }

      const validated = videoBoostStatsSchema.parse(stats);

      return NextResponse.json(validated, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      logError("video.boosts.get_failed", error, {
        operation: "get",
        userId,
        videoId,
      });

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
        logWarn("video.boosts.unauthorized", { operation: "post", videoId });

        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const rateLimit = await checkRateLimit(videoId, "write", userId, 10);

      if (rateLimit.rateLimited) {
        logWarn("video.boosts.rate_limited", { operation: "post", userId, videoId });

        return NextResponse.json({ error: "Rate limited" }, { status: 429 });
      }

      // Check if user has available boosts
      const hasBoost = await consumeBoost(userId);

      if (!hasBoost) {
        logWarn("video.boosts.no_boosts_available", { userId, videoId });

        // Return current allocation so UI can update
        const allocation = await getUserBoostAllocation(userId);

        return NextResponse.json(
          { availableBoosts: allocation.availableBoosts, error: "no_boosts_available" },
          { status: 403 },
        );
      }

      const result = await addVideoBoost(videoId, userId);
      const allocation = await getUserBoostAllocation(userId);

      // Add availableBoosts to response
      const response = {
        ...result,
        availableBoosts: allocation.availableBoosts,
      };
      const validated = videoBoostMutationSchema.parse(response);

      return NextResponse.json({ ...validated, availableBoosts: allocation.availableBoosts });
    } catch (error) {
      logError("video.boosts.post_failed", error, { operation: "post", videoId });

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
        logWarn("video.boosts.unauthorized", { operation: "delete", videoId });

        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const rateLimit = await checkRateLimit(videoId, "write", userId, 10);

      if (rateLimit.rateLimited) {
        logWarn("video.boosts.rate_limited", { operation: "delete", userId, videoId });

        return NextResponse.json({ error: "Rate limited" }, { status: 429 });
      }

      const result = await removeVideoBoost(videoId, userId);

      // Refund the boost if it was successfully removed
      if (result.removed) {
        await refundBoost(userId);
      }

      const allocation = await getUserBoostAllocation(userId);
      const validated = videoBoostMutationSchema.parse(result);

      return NextResponse.json({ ...validated, availableBoosts: allocation.availableBoosts });
    } catch (error) {
      logError("video.boosts.delete_failed", error, { operation: "delete", videoId });

      return NextResponse.json({ error: "Failed to remove boost" }, { status: 500 });
    }
  });
}
