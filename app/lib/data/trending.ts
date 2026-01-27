import { unstable_cache } from "next/cache";

import { getDatabaseClient, getDatabaseErrorDetails } from "@/lib/data/db";
import { logError, logWarn } from "@/lib/utils/log";
import { withRetry } from "@/lib/utils/retry";

type LikeCounts = Record<string, number>;
type BoostCounts = Record<string, number>;

export interface EngagementCounts {
  likes: LikeCounts;
  boosts: BoostCounts;
}

interface EngagementRow {
  video_id: string;
  count: number;
}

interface WindowedEngagementRow {
  video_id: string;
  recent_count: number;
  total_count: number;
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

const fetchEngagementCountsUncached = async (): Promise<EngagementCounts> => {
  const sql = getDatabaseClient({ required: false });

  if (!sql) {
    logWarn("data.trending.db_client_unavailable", {
      reason: "database_client_null",
    });

    return lastEngagementCounts ?? { boosts: {}, likes: {} };
  }

  try {
    const [likeRows, boostRows] = (await withRetry(
      () =>
        Promise.all([
          sql`
            SELECT video_id, COUNT(*)::int as count
            FROM video_likes
            GROUP BY video_id
          `,
          sql`
            SELECT video_id, COUNT(*)::int as count
            FROM video_boosts
            GROUP BY video_id
          `,
        ]),
      1,
    )) as [EngagementRow[], EngagementRow[]];

    const counts = {
      boosts: Object.fromEntries(boostRows.map((row) => [row.video_id, row.count])),
      likes: Object.fromEntries(likeRows.map((row) => [row.video_id, row.count])),
    };

    if (!isEngagementEmpty(counts) || !lastEngagementCounts) {
      lastEngagementCounts = counts;
    }

    return lastEngagementCounts ?? counts;
  } catch (error) {
    const errorDetails = getDatabaseErrorDetails(error, "fetch_engagement_counts");
    logError("data.trending.engagement_fetch_failed", error, errorDetails);

    return lastEngagementCounts ?? { boosts: {}, likes: {} };
  }
};

export const fetchEngagementCounts = unstable_cache(
  fetchEngagementCountsUncached,
  ["engagement-counts"],
  {
    revalidate: 900,
    tags: ["engagement-counts"],
  },
);

const fetchWindowedEngagementCountsUncached = async (
  days: number,
): Promise<WindowedEngagementCounts> => {
  const sql = getDatabaseClient({ required: false });

  if (!sql) {
    logWarn("data.trending.windowed.db_client_unavailable", {
      reason: "database_client_null",
      days,
    });

    return (
      lastWindowedCounts.get(days) ?? {
        recent: { boosts: {}, likes: {} },
        total: { boosts: {}, likes: {} },
      }
    );
  }

  try {
    const [likeRows, boostRows] = (await withRetry(
      () =>
        Promise.all([
          sql`
            SELECT
              video_id,
              COUNT(*) FILTER (WHERE created_at >= now() - (${days} * interval '1 day'))::int as recent_count,
              COUNT(*)::int as total_count
            FROM video_likes
            GROUP BY video_id
          `,
          sql`
            SELECT
              video_id,
              COUNT(*) FILTER (WHERE created_at >= now() - (${days} * interval '1 day'))::int as recent_count,
              COUNT(*)::int as total_count
            FROM video_boosts
            GROUP BY video_id
          `,
        ]),
      1,
    )) as [WindowedEngagementRow[], WindowedEngagementRow[]];

    const recent = {
      boosts: Object.fromEntries(boostRows.map((row) => [row.video_id, row.recent_count])),
      likes: Object.fromEntries(likeRows.map((row) => [row.video_id, row.recent_count])),
    };
    const total = {
      boosts: Object.fromEntries(boostRows.map((row) => [row.video_id, row.total_count])),
      likes: Object.fromEntries(likeRows.map((row) => [row.video_id, row.total_count])),
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

    return (
      lastWindowedCounts.get(days) ?? {
        recent: { boosts: {}, likes: {} },
        total: { boosts: {}, likes: {} },
      }
    );
  }
};

export const fetchWindowedEngagementCounts = (days = DEFAULT_ENGAGEMENT_WINDOW_DAYS) => {
  const cacheKey = `engagement-counts-${days}d`;
  const cachedFn = unstable_cache(() => fetchWindowedEngagementCountsUncached(days), [cacheKey], {
    revalidate: 900,
    tags: ["engagement-counts", cacheKey],
  });

  return cachedFn();
};
