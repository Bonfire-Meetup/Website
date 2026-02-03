import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { withRequestContext, withResolvedUserId } from "@/lib/api/route-wrappers";
import { db } from "@/lib/data/db";
import { userWatchlist } from "@/lib/data/schema";
import { logError } from "@/lib/utils/log";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export const GET = withRequestContext(
  withResolvedUserId<RouteParams>("watchlist.get")(async (_request: Request, { userId }) => {
    try {
      const rows = await db()
        .select({
          videoId: userWatchlist.videoId,
          createdAt: userWatchlist.createdAt,
        })
        .from(userWatchlist)
        .where(eq(userWatchlist.userId, userId))
        .orderBy(sql`${userWatchlist.createdAt} DESC`);

      return NextResponse.json({
        items: rows.map((row) => ({
          videoId: row.videoId,
          addedAt: row.createdAt,
        })),
      });
    } catch (err) {
      logError("watchlist_fetch_failed", err, { userId });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }),
);
