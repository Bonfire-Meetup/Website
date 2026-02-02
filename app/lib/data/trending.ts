import { count, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_LIFETIMES } from "@/lib/config/cache-lifetimes";
import { db, getDatabaseErrorDetails } from "@/lib/data/db";
import { videoBoosts, videoLikes } from "@/lib/data/schema";
import { logError, logWarn } from "@/lib/utils/log";
import { isBuildPhase } from "@/lib/utils/runtime";
import { withRetry } from "@/lib/utils/retry";

type LikeCounts = Record<string, number>;
type BoostCounts = Record<string, number>;

export interface EngagementCounts {
  likes: LikeCounts;
  boosts: BoostCounts;
}

interface EngagementRow {
  videoId: string;
  count: number;
}

interface WindowedEngagementRow {
  videoId: string;
  recentCount: number;
  totalCount: number;
}

export interface WindowedEngagementCounts {
  recent: EngagementCounts;
  total: EngagementCounts;
}

export const DEFAULT_ENGAGEMENT_WINDOW_DAYS = 120;

let lastEngagementCounts: EngagementCounts | null = null;
const lastWindowedCounts = new Map<number, WindowedEngagementCounts>();

const isEngagementEmpty = (counts: EngagementCounts) =>
  Object.keys(counts.likes).length === 0 && Object.keys(counts.boosts).length === 0;

const isWindowedEngagementEmpty = (counts: WindowedEngagementCounts) =>
  isEngagementEmpty(counts.recent) && isEngagementEmpty(counts.total);

export async function fetchEngagementCounts(): Promise<EngagementCounts> {
  "use cache";
  cacheTag("engagement-counts");
  cacheLife({ revalidate: CACHE_LIFETIMES.ENGAGEMENT_COUNTS });

  if (isBuildPhase()) {
    if (lastEngagementCounts) {
      return lastEngagementCounts;
    }

    lastEngagementCounts = { boosts: {}, likes: {} };
    return lastEngagementCounts;
  }

  const client = db({ required: false });

  if (!client) {
    logWarn("data.trending.db_client_unavailable", {
      reason: "database_client_null",
    });

    if (lastEngagementCounts) {
      return lastEngagementCounts;
    }

    throw new Error("Database client unavailable and no cached engagement data");
  }

  try {
    const [likeRows, boostRows] = (await withRetry(
      () =>
        Promise.all([
          client
            .select({
              videoId: videoLikes.videoId,
              count: count(),
            })
            .from(videoLikes)
            .groupBy(videoLikes.videoId),
          client
            .select({
              videoId: videoBoosts.videoId,
              count: count(),
            })
            .from(videoBoosts)
            .groupBy(videoBoosts.videoId),
        ]),
      3,
    )) as [EngagementRow[], EngagementRow[]];

    const counts = {
      boosts: Object.fromEntries(boostRows.map((row) => [row.videoId, row.count])),
      likes: Object.fromEntries(likeRows.map((row) => [row.videoId, row.count])),
    };

    if (!isEngagementEmpty(counts) || !lastEngagementCounts) {
      lastEngagementCounts = counts;
    }

    return lastEngagementCounts ?? counts;
  } catch (error) {
    const errorDetails = getDatabaseErrorDetails(error, "fetch_engagement_counts");
    logError("data.trending.engagement_fetch_failed", error, errorDetails);

    if (lastEngagementCounts) {
      return lastEngagementCounts;
    }

    throw error;
  }
}

export async function fetchWindowedEngagementCounts(
  days = DEFAULT_ENGAGEMENT_WINDOW_DAYS,
): Promise<WindowedEngagementCounts> {
  "use cache";
  cacheTag("engagement-counts", `engagement-counts-${days}d`);
  cacheLife({ revalidate: CACHE_LIFETIMES.ENGAGEMENT_COUNTS });

  if (isBuildPhase()) {
    const cached = lastWindowedCounts.get(days);
    if (cached) {
      return cached;
    }

    const empty = { boosts: {}, likes: {} };
    const counts = { recent: empty, total: empty };
    lastWindowedCounts.set(days, counts);
    return counts;
  }

  const client = db({ required: false });

  if (!client) {
    logWarn("data.trending.windowed.db_client_unavailable", {
      reason: "database_client_null",
      days,
    });

    const cached = lastWindowedCounts.get(days);
    if (cached) {
      return cached;
    }

    throw new Error("Database client unavailable and no cached windowed engagement data");
  }

  try {
    const [likeRows, boostRows] = (await withRetry(
      () =>
        Promise.all([
          client
            .select({
              videoId: videoLikes.videoId,
              recentCount:
                sql<number>`COUNT(*) FILTER (WHERE ${videoLikes.createdAt} >= now() - (${days} * interval '1 day'))::int`.as(
                  "recent_count",
                ),
              totalCount: sql<number>`COUNT(*)::int`.as("total_count"),
            })
            .from(videoLikes)
            .groupBy(videoLikes.videoId),
          client
            .select({
              videoId: videoBoosts.videoId,
              recentCount:
                sql<number>`COUNT(*) FILTER (WHERE ${videoBoosts.createdAt} >= now() - (${days} * interval '1 day'))::int`.as(
                  "recent_count",
                ),
              totalCount: sql<number>`COUNT(*)::int`.as("total_count"),
            })
            .from(videoBoosts)
            .groupBy(videoBoosts.videoId),
        ]),
      3,
    )) as [WindowedEngagementRow[], WindowedEngagementRow[]];

    const recent = {
      boosts: Object.fromEntries(boostRows.map((row) => [row.videoId, row.recentCount])),
      likes: Object.fromEntries(likeRows.map((row) => [row.videoId, row.recentCount])),
    };
    const total = {
      boosts: Object.fromEntries(boostRows.map((row) => [row.videoId, row.totalCount])),
      likes: Object.fromEntries(likeRows.map((row) => [row.videoId, row.totalCount])),
    };
    const counts = { recent, total };

    if (!isWindowedEngagementEmpty(counts) || !lastWindowedCounts.get(days)) {
      lastWindowedCounts.set(days, counts);
    }

    return lastWindowedCounts.get(days) ?? counts;
  } catch (error) {
    const errorDetails = getDatabaseErrorDetails(error, "fetch_windowed_engagement_counts");
    logError("data.trending.windowed.engagement_fetch_failed", error, {
      ...errorDetails,
      days,
    });

    const cached = lastWindowedCounts.get(days);
    if (cached) {
      return cached;
    }

    throw error;
  }
}
