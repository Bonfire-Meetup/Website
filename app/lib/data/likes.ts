import { and, count, eq, sql } from "drizzle-orm";

import { db } from "@/lib/data/db";
import { videoLikes } from "@/lib/data/schema";
import { logError } from "@/lib/utils/log";

interface LikeStats {
  count: number;
  hasLiked: boolean;
}
interface LikeMutationResult {
  count: number;
  added?: boolean;
  removed?: boolean;
}

export const getVideoLikeStats = async (
  videoId: string,
  ipHash: string,
  uaHash: string,
): Promise<LikeStats> => {
  try {
    const countRows = await db()
      .select({ count: count() })
      .from(videoLikes)
      .where(eq(videoLikes.videoId, videoId));

    const existsRows = await db()
      .select({ exists: sql<boolean>`true` })
      .from(videoLikes)
      .where(
        and(
          eq(videoLikes.videoId, videoId),
          eq(videoLikes.ipHash, ipHash),
          eq(videoLikes.uaHash, uaHash),
        ),
      )
      .limit(1);

    return { count: countRows[0]?.count ?? 0, hasLiked: existsRows.length > 0 };
  } catch (error) {
    logError("data.likes.stats_failed", error, { videoId });
    throw error;
  }
};

export const addVideoLike = async (
  videoId: string,
  ipHash: string,
  uaHash: string,
): Promise<LikeMutationResult> => {
  try {
    const inserted = await db()
      .insert(videoLikes)
      .values({ videoId, ipHash, uaHash })
      .onConflictDoNothing()
      .returning({ videoId: videoLikes.videoId });

    const countRows = await db()
      .select({ count: count() })
      .from(videoLikes)
      .where(eq(videoLikes.videoId, videoId));

    return { added: inserted.length > 0, count: countRows[0]?.count ?? 0 };
  } catch (error) {
    logError("data.likes.add_failed", error, { ipHash, uaHash, videoId });
    throw error;
  }
};

export const removeVideoLike = async (
  videoId: string,
  ipHash: string,
  uaHash: string,
): Promise<LikeMutationResult> => {
  try {
    const removed = await db()
      .delete(videoLikes)
      .where(
        and(
          eq(videoLikes.videoId, videoId),
          eq(videoLikes.ipHash, ipHash),
          eq(videoLikes.uaHash, uaHash),
        ),
      )
      .returning({ videoId: videoLikes.videoId });

    const countRows = await db()
      .select({ count: count() })
      .from(videoLikes)
      .where(eq(videoLikes.videoId, videoId));

    return { count: countRows[0]?.count ?? 0, removed: removed.length > 0 };
  } catch (error) {
    logError("data.likes.remove_failed", error, { ipHash, uaHash, videoId });
    throw error;
  }
};
