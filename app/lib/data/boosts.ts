import { getDatabaseClient } from "@/lib/data/db";
import { logError } from "@/lib/utils/log";

interface BoostStats {
  count: number;
  hasBoosted: boolean;
}
interface BoostMutationResult {
  count: number;
  added?: boolean;
  removed?: boolean;
}

export const getVideoBoostStats = async (
  videoId: string,
  userId?: string | null,
): Promise<BoostStats> => {
  try {
    const sql = getDatabaseClient();
    const [{ count }] =
      (await sql`select count(*)::int as count from video_boosts where video_id = ${videoId}`) as {
        count: number;
      }[];

    if (!userId) {
      return { count, hasBoosted: false };
    }

    const [{ exists }] =
      (await sql`select exists(select 1 from video_boosts where video_id = ${videoId} and user_id = ${userId}) as exists`) as {
        exists: boolean;
      }[];

    return { count, hasBoosted: exists };
  } catch (error) {
    logError("data.boosts.stats_failed", error, { userId: userId ?? null, videoId });
    throw error;
  }
};

export const addVideoBoost = async (
  videoId: string,
  userId: string,
): Promise<BoostMutationResult> => {
  try {
    const sql = getDatabaseClient();
    const inserted =
      (await sql`insert into video_boosts (video_id, user_id) values (${videoId}, ${userId}) on conflict do nothing returning video_id`) as {
        video_id: string;
      }[];
    const [{ count }] =
      (await sql`select count(*)::int as count from video_boosts where video_id = ${videoId}`) as {
        count: number;
      }[];

    return { added: inserted.length > 0, count };
  } catch (error) {
    logError("data.boosts.add_failed", error, { userId, videoId });
    throw error;
  }
};

export const removeVideoBoost = async (
  videoId: string,
  userId: string,
): Promise<BoostMutationResult> => {
  try {
    const sql = getDatabaseClient();
    const removed =
      (await sql`delete from video_boosts where video_id = ${videoId} and user_id = ${userId} returning video_id`) as {
        video_id: string;
      }[];
    const [{ count }] =
      (await sql`select count(*)::int as count from video_boosts where video_id = ${videoId}`) as {
        count: number;
      }[];

    return { count, removed: removed.length > 0 };
  } catch (error) {
    logError("data.boosts.remove_failed", error, { userId, videoId });
    throw error;
  }
};

export const getUserBoosts = async (userId: string) => {
  try {
    const sql = getDatabaseClient();
    const rows = (await sql`
      SELECT video_id, created_at
      FROM video_boosts
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `) as { video_id: string; created_at: Date }[];

    return rows;
  } catch (error) {
    logError("data.boosts.user_fetch_failed", error, { userId });
    throw error;
  }
};
