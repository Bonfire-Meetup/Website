import { neon } from "@neondatabase/serverless";
import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { logError } from "@/lib/utils/log";

const sql = neon(process.env.BNF_NEON_DATABASE_URL ?? "");

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, "watchlist.get");
    if (!auth.success) {
      return auth.response;
    }

    const { userId } = auth;

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
    logError("watchlist_fetch_failed", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
