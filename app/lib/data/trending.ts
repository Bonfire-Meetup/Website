import { getDatabaseClient } from "@/app/lib/db";

type LikeCounts = Record<string, number>;

export const fetchLikeCounts = async (): Promise<LikeCounts> => {
  const sql = getDatabaseClient({ required: false });
  if (!sql) return {};

  try {
    const rows = (await sql`
      SELECT video_id, COUNT(*)::int as count
      FROM video_likes
      GROUP BY video_id
    `) as { video_id: string; count: number }[];

    return Object.fromEntries(rows.map((row) => [row.video_id, row.count]));
  } catch {
    return {};
  }
};
