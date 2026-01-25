import { neon } from "@neondatabase/serverless";
import { NextResponse, type NextRequest } from "next/server";

import { resolveUserId } from "@/lib/api/auth";
import { logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

const sql = neon(process.env.BNF_NEON_DATABASE_URL ?? "");

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
      const rows = await sql`
        select video_id, created_at
        from user_watchlist
        where user_id = ${userId}
        order by created_at desc
      `;

      return NextResponse.json({
        items: rows.map((row) => ({
          videoId: row.video_id,
          addedAt: row.created_at,
        })),
      });
    } catch (err) {
      logError("watchlist_fetch_failed", err, { userId });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
