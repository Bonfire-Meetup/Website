import { createSerializer, type inferParserType, parseAsString, parseAsStringLiteral } from "nuqs";

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

export const libraryQueryParsers = {
  episode: parseAsString.withDefault("all"),
  location: parseAsStringLiteral(LIBRARY_LOCATION_VALUES).withDefault("all"),
  q: parseAsString.withDefault(""),
  shelf: parseAsStringLiteral(LIBRARY_SHELF_VALUES).withDefault("all"),
  tag: parseAsString.withDefault("all"),
};

export type LibraryQueryState = inferParserType<typeof libraryQueryParsers>;

const serializeLibraryQueryState = createSerializer(libraryQueryParsers);

export function createLibraryUrl(pathname: string, state: Partial<LibraryQueryState> = {}): string {
  return serializeLibraryQueryState(pathname, state);
}

export function createLibrarySearchParams(state: Partial<LibraryQueryState> = {}): URLSearchParams {
  return new URLSearchParams(serializeLibraryQueryState(state));
}
