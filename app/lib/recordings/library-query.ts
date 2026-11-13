import { LOCATIONS } from "@/lib/config/constants";
import type { LocationFilter } from "@/lib/recordings/catalog-types";

export const LIBRARY_SHELVES = {
  ALL: "all",
  EARLY_ACCESS: "early-access",
  GUILD_VAULT: "guild-vault",
  MEMBER_PICKS: "member-picks",
  HOT: "hot",
  HIDDEN_GEMS: "hidden-gems",
} as const;
export type LibraryShelf = (typeof LIBRARY_SHELVES)[keyof typeof LIBRARY_SHELVES];

export function parseLibraryShelf(value: string | null | undefined): LibraryShelf {
  if (
    value === LIBRARY_SHELVES.EARLY_ACCESS ||
    value === LIBRARY_SHELVES.GUILD_VAULT ||
    value === LIBRARY_SHELVES.MEMBER_PICKS ||
    value === LIBRARY_SHELVES.HOT ||
    value === LIBRARY_SHELVES.HIDDEN_GEMS
  ) {
    return value;
  }

  return LIBRARY_SHELVES.ALL;
}

export interface RecordingQuery {
  location: LocationFilter;
  tag: string;
  episode: string;
  shelf: LibraryShelf;
  q: string;
}

export function parseRecordingQuery(searchParams: URLSearchParams): RecordingQuery {
  const location = (searchParams.get("location") ?? "").toLowerCase();
  const matchedLocation = [LOCATIONS.PRAGUE, LOCATIONS.ZLIN].find(
    (value) => value.toLowerCase() === location,
  );

  return {
    episode: searchParams.get("episode") || "all",
    location: matchedLocation ?? "all",
    q: searchParams.get("q") ?? "",
    shelf: parseLibraryShelf(searchParams.get("shelf")),
    tag: searchParams.get("tag") || "all",
  };
}
