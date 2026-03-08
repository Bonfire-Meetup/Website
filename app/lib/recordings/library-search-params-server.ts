import { createLoader, createSerializer, parseAsString, parseAsStringLiteral } from "nuqs/server";

import { LOCATIONS } from "@/lib/config/constants";

const LIBRARY_LOCATION_VALUES = ["all", LOCATIONS.PRAGUE, LOCATIONS.ZLIN] as const;
const LIBRARY_SHELF_VALUES = [
  "all",
  "early-access",
  "guild-vault",
  "member-picks",
  "hot",
  "hidden-gems",
] as const;

const libraryServerQueryParsers = {
  episode: parseAsString.withDefault("all"),
  location: parseAsStringLiteral(LIBRARY_LOCATION_VALUES).withDefault("all"),
  q: parseAsString.withDefault(""),
  shelf: parseAsStringLiteral(LIBRARY_SHELF_VALUES).withDefault("all"),
  tag: parseAsString.withDefault("all"),
};

export const loadLibraryQueryState = createLoader(libraryServerQueryParsers);

const serializeLibraryQueryState = createSerializer(libraryServerQueryParsers);

export function createLibrarySearchParams(
  state: Partial<{
    episode: string;
    location: (typeof LIBRARY_LOCATION_VALUES)[number];
    q: string;
    shelf: (typeof LIBRARY_SHELF_VALUES)[number];
    tag: string;
  }> = {},
): URLSearchParams {
  return new URLSearchParams(serializeLibraryQueryState(state));
}
