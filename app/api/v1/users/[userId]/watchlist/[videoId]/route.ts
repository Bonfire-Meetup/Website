import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  RATE_LIMITS,
  withOptionalResolvedUserId,
  withRequestContext,
  withResolvedUserId,
  withUserRateLimit,
} from "@/lib/api/route-wrappers";
import { db } from "@/lib/data/db";
import { userWatchlist } from "@/lib/data/schema";
import { logError } from "@/lib/utils/log";

const videoIdSchema = z.string().min(1).max(100);

interface RouteParams {
  params: Promise<{ userId: string; videoId: string }>;
}

/** Returns whether a video is on your Watch Later list. Always `false` when signed out. */
export const GET = withRequestContext(
  withOptionalResolvedUserId<RouteParams>("watchlist.check")(
    withUserRateLimit(
      "account-read",
      RATE_LIMITS.ACCOUNT_READ,
    )(async (_request: Request, { params, userId }) => {
      const { userId: userIdParam, videoId } = await params;

      try {
        const parsed = videoIdSchema.safeParse(videoId);
        if (!parsed.success) {
          return NextResponse.json({ error: "invalid_id" }, { status: 400 });
        }

        if (!userId) {
          return NextResponse.json({ inWatchlist: false });
        }

        const rows = await db()
          .select({ id: userWatchlist.id })
          .from(userWatchlist)
          .where(and(eq(userWatchlist.userId, userId), eq(userWatchlist.videoId, videoId)))
          .limit(1);

        return NextResponse.json({ inWatchlist: rows.length > 0 });
      } catch (err) {
        logError("watchlist_check_failed", err, { videoId, userId: userIdParam });
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
      }
    }),
  ),
);

/** Adds a video to your Watch Later list. */
export const PUT = withRequestContext(
  withResolvedUserId<RouteParams>("watchlist.add")(
    withUserRateLimit(
      "account-write",
      RATE_LIMITS.ACCOUNT_WRITE,
    )(async (_request: Request, { params, userId }) => {
      const { videoId } = await params;

      try {
        const parsed = videoIdSchema.safeParse(videoId);
        if (!parsed.success) {
          return NextResponse.json({ error: "invalid_id" }, { status: 400 });
        }

        await db().insert(userWatchlist).values({ userId, videoId }).onConflictDoNothing();

        return NextResponse.json({ added: true, inWatchlist: true });
      } catch (err) {
        logError("watchlist_add_failed", err, { videoId, userId });
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
      }
    }),
  ),
);

/** Removes a video from your Watch Later list. */
export const DELETE = withRequestContext(
  withResolvedUserId<RouteParams>("watchlist.remove")(
    withUserRateLimit(
      "account-write",
      RATE_LIMITS.ACCOUNT_WRITE,
    )(async (_request: Request, { params, userId }) => {
      const { videoId } = await params;

      try {
        const parsed = videoIdSchema.safeParse(videoId);
        if (!parsed.success) {
          return NextResponse.json({ error: "invalid_id" }, { status: 400 });
        }

        await db()
          .delete(userWatchlist)
          .where(and(eq(userWatchlist.userId, userId), eq(userWatchlist.videoId, videoId)));

        return NextResponse.json({ removed: true, inWatchlist: false });
      } catch (err) {
        logError("watchlist_remove_failed", err, { videoId, userId });
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
      }
    }),
  ),
);
