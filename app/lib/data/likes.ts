import { getDatabaseClient } from "@/lib/data/db";

type LikeStats = { count: number; hasLiked: boolean };
type LikeMutationResult = { count: number; added?: boolean; removed?: boolean };

export const getVideoLikeStats = async (
  videoId: string,
  ipHash: string,
  uaHash: string,
): Promise<LikeStats> => {
  const sql = getDatabaseClient();
  const [{ count }] =
    (await sql`select count(*)::int as count from video_likes where video_id = ${videoId}`) as {
      count: number;
    }[];
  const [{ exists }] =
    (await sql`select exists(select 1 from video_likes where video_id = ${videoId} and ip_hash = ${ipHash} and ua_hash = ${uaHash}) as exists`) as {
      exists: boolean;
    }[];
  return { count, hasLiked: exists };
};

export const addVideoLike = async (
  videoId: string,
  ipHash: string,
  uaHash: string,
): Promise<LikeMutationResult> => {
  const sql = getDatabaseClient();
  const inserted =
    (await sql`insert into video_likes (video_id, ip_hash, ua_hash) values (${videoId}, ${ipHash}, ${uaHash}) on conflict do nothing returning video_id`) as {
      video_id: string;
    }[];
  const [{ count }] =
    (await sql`select count(*)::int as count from video_likes where video_id = ${videoId}`) as {
      count: number;
    }[];
  return { count, added: inserted.length > 0 };
};

export const removeVideoLike = async (
  videoId: string,
  ipHash: string,
  uaHash: string,
): Promise<LikeMutationResult> => {
  const sql = getDatabaseClient();
  const removed =
    (await sql`delete from video_likes where video_id = ${videoId} and ip_hash = ${ipHash} and ua_hash = ${uaHash} returning video_id`) as {
      video_id: string;
    }[];
  const [{ count }] =
    (await sql`select count(*)::int as count from video_likes where video_id = ${videoId}`) as {
      count: number;
    }[];
  return { count, removed: removed.length > 0 };
};
