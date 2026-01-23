import { unstable_cache } from "next/cache";

import { getDatabaseClient } from "@/lib/data/db";
import { logError, logWarn } from "@/lib/utils/log";

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

const fetchEngagementCountsUncached = async (): Promise<EngagementCounts> => {
  const sql = getDatabaseClient({ required: false });

  if (!sql) {
    logWarn("data.trending.db_client_unavailable", {
      reason: "database_client_null",
    });

    return { boosts: {}, likes: {} };
  }

  try {
    const [likeRows, boostRows] = (await Promise.all([
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
    ])) as [EngagementRow[], EngagementRow[]];

    return {
      boosts: Object.fromEntries(boostRows.map((row) => [row.video_id, row.count])),
      likes: Object.fromEntries(likeRows.map((row) => [row.video_id, row.count])),
    };
  } catch (error) {
    logError("data.trending.engagement_fetch_failed", error, {
      operation: "fetch_engagement_counts",
    });

    return { boosts: {}, likes: {} };
  }
};

export const fetchEngagementCounts = unstable_cache(
  fetchEngagementCountsUncached,
  ["engagement-counts"],
  {
    // 15 minutes
    revalidate: 900,
  },
);
