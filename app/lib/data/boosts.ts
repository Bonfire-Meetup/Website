import { and, count, eq, sql } from "drizzle-orm";

import { BOOST_CONFIG } from "@/lib/config/constants";
import { db } from "@/lib/data/db";
import { appUser, userBoostAllocation, videoBoosts } from "@/lib/data/schema";
import { logError } from "@/lib/utils/log";
import { compressUuid } from "@/lib/utils/uuid-compress";

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
    const countRows = await db()
      .select({ count: count() })
      .from(videoBoosts)
      .where(eq(videoBoosts.videoId, videoId));

    const boostCount = countRows[0]?.count ?? 0;

    if (!userId) {
      return { count: boostCount, hasBoosted: false };
    }

    const existsRows = await db()
      .select({ exists: sql<boolean>`true` })
      .from(videoBoosts)
      .where(and(eq(videoBoosts.videoId, videoId), eq(videoBoosts.userId, userId)))
      .limit(1);

    return { count: boostCount, hasBoosted: existsRows.length > 0 };
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
    const inserted = await db()
      .insert(videoBoosts)
      .values({ videoId, userId })
      .onConflictDoNothing()
      .returning({ videoId: videoBoosts.videoId });

    const countRows = await db()
      .select({ count: count() })
      .from(videoBoosts)
      .where(eq(videoBoosts.videoId, videoId));

    return { added: inserted.length > 0, count: countRows[0]?.count ?? 0 };
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
    const removed = await db()
      .delete(videoBoosts)
      .where(and(eq(videoBoosts.videoId, videoId), eq(videoBoosts.userId, userId)))
      .returning({ videoId: videoBoosts.videoId });

    const countRows = await db()
      .select({ count: count() })
      .from(videoBoosts)
      .where(eq(videoBoosts.videoId, videoId));

    return { count: countRows[0]?.count ?? 0, removed: removed.length > 0 };
  } catch (error) {
    logError("data.boosts.remove_failed", error, { userId, videoId });
    throw error;
  }
};

export const getUserBoosts = async (userId: string) => {
  try {
    const rows = await db()
      .select({
        videoId: videoBoosts.videoId,
        createdAt: videoBoosts.createdAt,
      })
      .from(videoBoosts)
      .where(eq(videoBoosts.userId, userId))
      .orderBy(sql`${videoBoosts.createdAt} DESC`);

    return rows;
  } catch (error) {
    logError("data.boosts.user_fetch_failed", error, { userId });
    throw error;
  }
};

interface BoostAllocation {
  availableBoosts: number;
  lastAllocationDate: string;
}

const formatDateString = (date: Date): string => date.toISOString();

export const getUserBoostAllocation = async (userId: string): Promise<BoostAllocation> => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentDateStr = formatDateString(currentDate);

    const existing = await db()
      .select({
        availableBoosts: userBoostAllocation.availableBoosts,
        lastAllocationDate: userBoostAllocation.lastAllocationDate,
      })
      .from(userBoostAllocation)
      .where(eq(userBoostAllocation.userId, userId));

    if (existing.length === 0) {
      await db().insert(userBoostAllocation).values({
        userId,
        availableBoosts: BOOST_CONFIG.BOOSTS_PER_MONTH,
        lastAllocationDate: currentDateStr,
      });

      return {
        availableBoosts: BOOST_CONFIG.BOOSTS_PER_MONTH,
        lastAllocationDate: currentDateStr,
      };
    }

    const allocation = existing[0];
    const lastAllocationDate = new Date(allocation.lastAllocationDate);
    const lastAllocationMonth = new Date(
      lastAllocationDate.getFullYear(),
      lastAllocationDate.getMonth(),
      1,
    );

    if (allocation.availableBoosts > BOOST_CONFIG.MAX_BOOSTS) {
      await db()
        .update(userBoostAllocation)
        .set({
          availableBoosts: BOOST_CONFIG.MAX_BOOSTS,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userBoostAllocation.userId, userId));

      return {
        availableBoosts: BOOST_CONFIG.MAX_BOOSTS,
        lastAllocationDate: allocation.lastAllocationDate,
      };
    }

    if (lastAllocationMonth < currentMonth) {
      const newAvailableBoosts = Math.min(
        allocation.availableBoosts + BOOST_CONFIG.BOOSTS_PER_MONTH,
        BOOST_CONFIG.MAX_BOOSTS,
      );

      await db()
        .update(userBoostAllocation)
        .set({
          availableBoosts: newAvailableBoosts,
          lastAllocationDate: currentDateStr,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userBoostAllocation.userId, userId));

      return {
        availableBoosts: newAvailableBoosts,
        lastAllocationDate: currentDateStr,
      };
    }

    return {
      availableBoosts: allocation.availableBoosts,
      lastAllocationDate: allocation.lastAllocationDate,
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
    await getUserBoostAllocation(userId);

    const result = await db()
      .update(userBoostAllocation)
      .set({
        availableBoosts: sql`${userBoostAllocation.availableBoosts} - 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(userBoostAllocation.userId, userId),
          sql`${userBoostAllocation.availableBoosts} > 0`,
        ),
      )
      .returning({ availableBoosts: userBoostAllocation.availableBoosts });

    if (result.length > 0) {
      return { success: true, availableBoosts: result[0].availableBoosts };
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
    const result = await db()
      .update(userBoostAllocation)
      .set({
        availableBoosts: sql`LEAST(${userBoostAllocation.availableBoosts} + 1, ${BOOST_CONFIG.MAX_BOOSTS})`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userBoostAllocation.userId, userId))
      .returning({ availableBoosts: userBoostAllocation.availableBoosts });

    return result[0]?.availableBoosts ?? 0;
  } catch (error) {
    logError("data.boosts.refund_failed", error, { userId });
    throw error;
  }
};

export interface BoostedUser {
  publicId: string;
  name: string | null;
}

export const getVideoBoostedUsers = async (
  videoId: string,
): Promise<{
  publicUsers: BoostedUser[];
  privateCount: number;
}> => {
  try {
    const rows = await db()
      .select({
        userId: appUser.id,
        name: appUser.name,
        preferences: appUser.preferences,
      })
      .from(videoBoosts)
      .innerJoin(appUser, eq(videoBoosts.userId, appUser.id))
      .where(eq(videoBoosts.videoId, videoId))
      .orderBy(sql`${videoBoosts.createdAt} DESC`);

    const publicUsers: BoostedUser[] = [];
    let privateCount = 0;

    for (const row of rows) {
      const prefs = (row.preferences || {}) as Record<string, unknown>;
      const isPublic = typeof prefs.publicProfile === "boolean" ? prefs.publicProfile : false;

      if (isPublic) {
        publicUsers.push({
          name: row.name,
          publicId: compressUuid(row.userId),
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
