import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getAuthUserId, resolveUserId } from "@/lib/api/auth";
import { db } from "@/lib/data/db";
import { userWatchlist } from "@/lib/data/schema";
import { logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

const videoIdSchema = z.string().min(1).max(100);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; videoId: string }> },
) {
  return runWithRequestContext(request, async () => {
    const { userId: userIdParam, videoId } = await params;

    try {
      const parsed = videoIdSchema.safeParse(videoId);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
      }

      const auth = await getAuthUserId(request);

      if (auth.status === "none" || auth.status === "invalid" || !auth.userId) {
        return NextResponse.json({ inWatchlist: false });
      }

      const userIdResult = await resolveUserId(request, "watchlist.check", userIdParam);
      if (!userIdResult.success) {
        return userIdResult.response;
      }

      const { userId } = userIdResult;

      const rows = await db()
        .select({ id: userWatchlist.id })
        .from(userWatchlist)
        .where(and(eq(userWatchlist.userId, userId), eq(userWatchlist.videoId, videoId)))
        .limit(1);

      return NextResponse.json({ inWatchlist: rows.length > 0 });
    } catch (err) {
      logError("watchlist_check_failed", err, { videoId, userId: userIdParam });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; videoId: string }> },
) {
  return runWithRequestContext(request, async () => {
    const { userId: userIdParam, videoId } = await params;

    try {
      const parsed = videoIdSchema.safeParse(videoId);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
      }

      const userIdResult = await resolveUserId(request, "watchlist.add", userIdParam);
      if (!userIdResult.success) {
        return userIdResult.response;
      }

      const { userId } = userIdResult;

      await db().insert(userWatchlist).values({ userId, videoId }).onConflictDoNothing();

      return NextResponse.json({ added: true, inWatchlist: true });
    } catch (err) {
      logError("watchlist_add_failed", err, { videoId, userId: userIdParam });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; videoId: string }> },
) {
  return runWithRequestContext(request, async () => {
    const { userId: userIdParam, videoId } = await params;

    try {
      const parsed = videoIdSchema.safeParse(videoId);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
      }

      const userIdResult = await resolveUserId(request, "watchlist.remove", userIdParam);
      if (!userIdResult.success) {
        return userIdResult.response;
      }

      const { userId } = userIdResult;

      await db()
        .delete(userWatchlist)
        .where(and(eq(userWatchlist.userId, userId), eq(userWatchlist.videoId, videoId)));

      return NextResponse.json({ removed: true, inWatchlist: false });
    } catch (err) {
      logError("watchlist_remove_failed", err, { videoId, userId: userIdParam });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
