import { eq, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { resolveUserId } from "@/lib/api/auth";
import { db } from "@/lib/data/db";
import { userWatchlist } from "@/lib/data/schema";
import { logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  return runWithRequestContext(request, async () => {
    const { userId: userIdParam } = await params;
    const userIdResult = await resolveUserId(request, "watchlist.get", userIdParam);

    if (!userIdResult.success) {
      return userIdResult.response;
    }

    const { userId } = userIdResult;

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
  });
}
