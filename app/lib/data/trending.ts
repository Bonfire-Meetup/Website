import { unstable_cache } from "next/cache";

import { getDatabaseClient } from "@/lib/data/db";

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
  } catch {
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
