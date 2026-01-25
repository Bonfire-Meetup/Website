import crypto from "crypto";

import { BOOST_CONFIG } from "@/lib/config/constants";
import { getDatabaseClient } from "@/lib/data/db";
import { logError } from "@/lib/utils/log";

export { BOOST_CONFIG };

interface BoostStats {
  count: number;
  hasBoosted: boolean;
  availableBoosts?: number;
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

interface BoostAllocation {
  availableBoosts: number;
  lastAllocationDate: Date;
}

export const getUserBoostAllocation = async (userId: string): Promise<BoostAllocation> => {
  try {
    const sql = getDatabaseClient();
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const existing = (await sql`
      SELECT available_boosts, last_allocation_date
      FROM user_boost_allocation
      WHERE user_id = ${userId}
    `) as { available_boosts: number; last_allocation_date: Date }[];

    if (existing.length === 0) {
      await sql`
        INSERT INTO user_boost_allocation (user_id, available_boosts, last_allocation_date)
        VALUES (${userId}, ${BOOST_CONFIG.BOOSTS_PER_MONTH}, ${currentDate})
      `;

      return {
        availableBoosts: BOOST_CONFIG.BOOSTS_PER_MONTH,
        lastAllocationDate: currentDate,
      };
    }

    const allocation = existing[0];
    const lastAllocationDate = new Date(allocation.last_allocation_date);
    const lastAllocationMonth = new Date(
      lastAllocationDate.getFullYear(),
      lastAllocationDate.getMonth(),
      1,
    );

    if (allocation.available_boosts > BOOST_CONFIG.MAX_BOOSTS) {
      await sql`
        UPDATE user_boost_allocation
        SET available_boosts = ${BOOST_CONFIG.MAX_BOOSTS},
            updated_at = now()
        WHERE user_id = ${userId}
      `;

      return {
        availableBoosts: BOOST_CONFIG.MAX_BOOSTS,
        lastAllocationDate: lastAllocationDate,
      };
    }

    if (lastAllocationMonth < currentMonth) {
      const newAvailableBoosts = Math.min(
        allocation.available_boosts + BOOST_CONFIG.BOOSTS_PER_MONTH,
        BOOST_CONFIG.MAX_BOOSTS,
      );

      await sql`
        UPDATE user_boost_allocation
        SET available_boosts = ${newAvailableBoosts},
            last_allocation_date = ${currentDate},
            updated_at = now()
        WHERE user_id = ${userId}
      `;

      return {
        availableBoosts: newAvailableBoosts,
        lastAllocationDate: currentDate,
      };
    }

    return {
      availableBoosts: allocation.available_boosts,
      lastAllocationDate: lastAllocationDate,
    };
  } catch (error) {
    logError("data.boosts.allocation_fetch_failed", error, { userId });
    throw error;
  }
};

export const consumeBoost = async (
  userId: string,
): Promise<{ success: boolean; availableBoosts: number | null }> => {
  try {
    const sql = getDatabaseClient();

    await getUserBoostAllocation(userId);

    const result = (await sql`
      UPDATE user_boost_allocation
      SET available_boosts = available_boosts - 1,
          updated_at = now()
      WHERE user_id = ${userId}
        AND available_boosts > 0
      RETURNING available_boosts
    `) as { available_boosts: number }[];

    if (result.length > 0) {
      return { success: true, availableBoosts: result[0].available_boosts };
    }

    const allocation = await getUserBoostAllocation(userId);
    return { success: false, availableBoosts: allocation.availableBoosts };
  } catch (error) {
    logError("data.boosts.consume_failed", error, { userId });
    throw error;
  }
};

export const refundBoost = async (userId: string): Promise<number> => {
  try {
    const sql = getDatabaseClient();

    const result = (await sql`
      UPDATE user_boost_allocation
      SET available_boosts = LEAST(available_boosts + 1, ${BOOST_CONFIG.MAX_BOOSTS}),
          updated_at = now()
      WHERE user_id = ${userId}
      RETURNING available_boosts
    `) as { available_boosts: number }[];

    return result[0]?.available_boosts ?? 0;
  } catch (error) {
    logError("data.boosts.refund_failed", error, { userId });
    throw error;
  }
};

export interface BoostedUser {
  userId: string;
  name: string | null;
  emailHash: string;
}

export const getVideoBoostedUsers = async (
  videoId: string,
): Promise<{
  publicUsers: BoostedUser[];
  privateCount: number;
}> => {
  try {
    const sql = getDatabaseClient();
    const rows = (await sql`
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        u.preferences
      FROM video_boosts vb
      JOIN app_user u ON vb.user_id = u.id
      WHERE vb.video_id = ${videoId}
      ORDER BY vb.created_at DESC
    `) as {
      user_id: string;
      name: string | null;
      email: string;
      preferences: unknown;
    }[];

    const hashEmail = (email: string): string =>
      crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");

    const publicUsers: BoostedUser[] = [];
    let privateCount = 0;

    for (const row of rows) {
      const prefs = (row.preferences || {}) as Record<string, unknown>;
      const isPublic = typeof prefs.publicProfile === "boolean" ? prefs.publicProfile : false;

      if (isPublic) {
        publicUsers.push({
          emailHash: hashEmail(row.email),
          name: row.name,
          userId: row.user_id,
        });
      } else {
        privateCount++;
      }
    }

    return { privateCount, publicUsers };
  } catch (error) {
    logError("data.boosts.users_fetch_failed", error, { videoId });
    throw error;
  }
};
