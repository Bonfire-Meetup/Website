import { neon } from "@neondatabase/serverless";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireAuth, getAuthUserId } from "@/lib/api/auth";
import { logError } from "@/lib/utils/log";

const sql = neon(process.env.BNF_NEON_DATABASE_URL ?? "");

const videoIdSchema = z.string().min(1).max(100);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  const { videoId } = await params;
  try {
    const parsed = videoIdSchema.safeParse(videoId);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const auth = await getAuthUserId(request);

    if (auth.status === "none" || auth.status === "invalid" || !auth.userId) {
      return NextResponse.json({ inWatchlist: false });
    }

    const rows = await sql`
      select id from user_watchlist
      where user_id = ${auth.userId} and video_id = ${videoId}
      limit 1
    `;

    return NextResponse.json({ inWatchlist: rows.length > 0 });
  } catch (err) {
    logError("watchlist_check_failed", err, { videoId });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  const { videoId } = await params;
  try {
    const parsed = videoIdSchema.safeParse(videoId);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const auth = await requireAuth(request, "watchlist.add");
    if (!auth.success) {
      return auth.response;
    }

    const { userId } = auth;

    await sql`
      insert into user_watchlist (user_id, video_id)
      values (${userId}, ${videoId})
      on conflict (user_id, video_id) do nothing
    `;

    return NextResponse.json({ added: true, inWatchlist: true });
  } catch (err) {
    logError("watchlist_add_failed", err, { videoId });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  const { videoId } = await params;
  try {
    const parsed = videoIdSchema.safeParse(videoId);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const auth = await requireAuth(request, "watchlist.remove");
    if (!auth.success) {
      return auth.response;
    }

    const { userId } = auth;

    await sql`
      delete from user_watchlist
      where user_id = ${userId} and video_id = ${videoId}
    `;

    return NextResponse.json({ removed: true, inWatchlist: false });
  } catch (err) {
    logError("watchlist_remove_failed", err, { videoId });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
