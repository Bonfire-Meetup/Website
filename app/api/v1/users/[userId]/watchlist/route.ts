import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import {
  RATE_LIMITS,
  withRequestContext,
  withResolvedUserId,
  withUserRateLimit,
} from "@/lib/api/route-wrappers";
import { db } from "@/lib/data/db";
import { userWatchlist } from "@/lib/data/schema";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { logError } from "@/lib/utils/log";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

/** Lists the videos on your Watch Later list, newest first, with each recording. Use `me` as the user ID. */
export const GET = withRequestContext(
  withResolvedUserId<RouteParams>("watchlist.get")(
    withUserRateLimit(
      "account-read",
      RATE_LIMITS.ACCOUNT_READ,
    )(async (_request: Request, { userId }) => {
      try {
        const rows = await db()
          .select({
            videoId: userWatchlist.videoId,
            createdAt: userWatchlist.createdAt,
          })
          .from(userWatchlist)
          .where(eq(userWatchlist.userId, userId))
          .orderBy(sql`${userWatchlist.createdAt} DESC`);

        const recordings = new Map(
          getAllRecordings().map((recording) => [recording.shortId, recording]),
        );

        return NextResponse.json({
          items: rows.map((row) => ({
            addedAt: new Date(row.createdAt).toISOString(),
            recording: recordings.get(row.videoId) ?? null,
            videoId: row.videoId,
          })),
        });
      } catch (err) {
        logError("watchlist_fetch_failed", err, { userId });
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
      }
    }),
  ),
);
