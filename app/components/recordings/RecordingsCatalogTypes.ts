import type { Recording } from "@/lib/recordings/recordings";
import type { LocationValue } from "@/lib/config/constants";

export type LocationFilter = "all" | LocationValue;

export type CatalogRecording = Pick<
  Recording,
  | "shortId"
  | "slug"
  | "title"
  | "speaker"
  | "date"
  | "thumbnail"
  | "featureHeroThumbnail"
  | "description"
  | "tags"
  | "location"
  | "episodeId"
  | "episode"
  | "episodeNumber"
>;

export type MemberPickRecording = CatalogRecording & { boostCount: number };

export type HotRecording = CatalogRecording & { likeCount: number };

export { normalizeText } from "@/lib/utils/text";
export { formatDate } from "@/lib/utils/locale";

export const UNRECORDED_EPISODES = new Set(["prague-1", "prague-2"]);
export const FEATURED_INTERVAL_MS = 6000;
