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

let lastEngagementCounts: EngagementCounts | null = null;

const isEngagementEmpty = (counts: EngagementCounts) =>
  Object.keys(counts.likes).length === 0 && Object.keys(counts.boosts).length === 0;

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
