import type { Recording } from "../../lib/recordings/recordings";
import type { LocationValue } from "../../lib/config/constants";

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

export type RecordingsCatalogLabels = {
  eyebrow: string;
  title: string;
  subtitle: string;
  rows: {
    latest: string;
    prague: string;
    zlin: string;
    topic: string;
    memberPicks: string;
    hot: string;
  };
  view: {
    all: string;
    rows: string;
  };
  search: {
    label: string;
    placeholder: string;
  };
  filters: {
    title: string;
    location: string;
    tag: string;
    episode: string;
    reset: string;
    allLocations: string;
    allTags: string;
    allEpisodes: string;
    prague: string;
    zlin: string;
  };
  empty: string;
  disclaimer: string;
  noteLabel: string;
  epShort: string;
  notRecorded: {
    title: string;
    body: string;
    cta: string;
  };
};

export { normalizeText } from "../../lib/utils/text";
export { formatDate } from "../../lib/utils/locale";

export const UNRECORDED_EPISODES = new Set(["prague-1", "prague-2"]);
export const FEATURED_INTERVAL_MS = 6000;
