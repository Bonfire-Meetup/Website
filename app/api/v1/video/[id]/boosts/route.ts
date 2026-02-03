import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { getAuthUserId } from "@/lib/api/auth";
import { checkRateLimit, getClientHashes, validateVideoApiRequest } from "@/lib/api/rate-limit";
import { videoBoostMutationSchema, videoBoostStatsSchema } from "@/lib/api/schemas";
import {
  addVideoBoost,
  consumeBoost,
  getVideoBoostStats,
  getVideoBoostedUsers,
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

      const { ipHash } = await getClientHashes();
      const identifier = userId ?? ipHash;
      const rateLimit = await checkRateLimit(videoId, "read", identifier, 60);

      if (rateLimit.rateLimited) {
        logWarn("video.boosts.rate_limited", { operation: "get", userId, videoId });

        return NextResponse.json({ error: "Rate limited" }, { status: 429 });
      }

      const [stats, boostedUsers] = await Promise.all([
        getVideoBoostStats(videoId, userId),
        getVideoBoostedUsers(videoId),
      ]);

      const response: {
        count: number;
        hasBoosted: boolean;
        availableBoosts?: number;
        boostedBy?: {
          publicUsers: {
            publicId: string;
            name: string | null;
          }[];
          privateCount: number;
        };
      } = {
        ...stats,
        boostedBy: {
          privateCount: boostedUsers.privateCount,
          publicUsers: boostedUsers.publicUsers,
        },
      };

      if (userId && authResult.status === "valid") {
        const allocation = await getUserBoostAllocation(userId);
        response.availableBoosts = allocation.availableBoosts;
      }

      const validated = videoBoostStatsSchema.parse(response);

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

      const boostResult = await consumeBoost(userId);

      if (!boostResult.success) {
        logWarn("video.boosts.no_boosts_available", { userId, videoId });

        return NextResponse.json(
          { availableBoosts: boostResult.availableBoosts, error: "no_boosts_available" },
          { status: 403 },
        );
      }

      const result = await addVideoBoost(videoId, userId);

      revalidateTag("engagement-counts", "max");
      revalidateTag("member-picks", "max");
      revalidateTag("hidden-gems", "max");

      const response = {
        ...result,
        availableBoosts: boostResult.availableBoosts,
      };
      const validated = videoBoostMutationSchema.parse(response);

      return NextResponse.json(validated);
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

      let availableBoosts: number;
      if (result.removed) {
        availableBoosts = await refundBoost(userId);
      } else {
        const allocation = await getUserBoostAllocation(userId);
        ({ availableBoosts } = allocation);
      }

      revalidateTag("engagement-counts", "max");
      revalidateTag("member-picks", "max");
      revalidateTag("hidden-gems", "max");

      const validated = videoBoostMutationSchema.parse(result);

      return NextResponse.json({ ...validated, availableBoosts });
    } catch (error) {
      logError("video.boosts.delete_failed", error, { operation: "delete", videoId });

      return NextResponse.json({ error: "Failed to remove boost" }, { status: 500 });
    }
  });
}
