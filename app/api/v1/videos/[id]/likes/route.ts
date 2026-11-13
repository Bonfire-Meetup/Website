import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { getClientHashes, validateVideoApiRequest } from "@/lib/api/rate-limit";
import { withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import { videoLikeMutationSchema, videoLikeStatsSchema } from "@/lib/api/schemas";
import { addVideoLike, getVideoLikeStats, removeVideoLike } from "@/lib/data/likes";
import { logError } from "@/lib/utils/log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Returns a video's like count and whether this visitor has liked it. */
export const GET = withRequestContext(
  withRateLimit<RouteParams>({
    maxHits: 60,
    keyFn: async ({ ctx, ipHash }) => {
      const { id } = await ctx.params;
      return `read:${id}:${ipHash}`;
    },
    onLimit: () => NextResponse.json({ error: "rate_limited" }, { status: 429 }),
    storeKey: "video-api",
  })(async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id: videoId } = await params;
    const validation = await validateVideoApiRequest(videoId, "read");

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    try {
      const { ipHash, uaHash } = await getClientHashes();
      const stats = await getVideoLikeStats(videoId, ipHash, uaHash);
      const validated = videoLikeStatsSchema.parse(stats);

      return NextResponse.json(validated, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      logError("video.likes.get_failed", error, { operation: "get", videoId });

      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);

/** Likes a video. No account needed: likes are tied to the visitor. */
export const POST = withRequestContext(
  withRateLimit<RouteParams>({
    maxHits: 5,
    keyFn: async ({ ctx, ipHash }) => {
      const { id } = await ctx.params;
      return `write:${id}:${ipHash}`;
    },
    onLimit: () => NextResponse.json({ error: "rate_limited" }, { status: 429 }),
    storeKey: "video-api",
  })(async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id: videoId } = await params;
    const validation = await validateVideoApiRequest(videoId, "write");

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    try {
      const { ipHash, uaHash } = await getClientHashes();
      const result = await addVideoLike(videoId, ipHash, uaHash);
      const validated = videoLikeMutationSchema.parse(result);

      revalidateTag("engagement-counts", "max");
      revalidateTag("hidden-gems", "max");

      return NextResponse.json(validated);
    } catch (error) {
      logError("video.likes.post_failed", error, { operation: "post", videoId });

      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);

/** Removes this visitor's like from a video. */
export const DELETE = withRequestContext(
  withRateLimit<RouteParams>({
    maxHits: 5,
    keyFn: async ({ ctx, ipHash }) => {
      const { id } = await ctx.params;
      return `write:${id}:${ipHash}`;
    },
    onLimit: () => NextResponse.json({ error: "rate_limited" }, { status: 429 }),
    storeKey: "video-api",
  })(async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id: videoId } = await params;
    const validation = await validateVideoApiRequest(videoId, "write");

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    try {
      const { ipHash, uaHash } = await getClientHashes();
      const result = await removeVideoLike(videoId, ipHash, uaHash);
      const validated = videoLikeMutationSchema.parse(result);

      revalidateTag("engagement-counts", "max");
      revalidateTag("hidden-gems", "max");

      return NextResponse.json(validated);
    } catch (error) {
      logError("video.likes.delete_failed", error, { operation: "delete", videoId });

      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
