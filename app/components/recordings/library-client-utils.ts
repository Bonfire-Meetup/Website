import { API_ROUTES } from "@/lib/api/routes";
import {
  LIBRARY_SHELVES,
  type LibraryApiPayload,
  type LibraryShelf,
  type LocationFilter,
} from "@/lib/recordings/library-filter";
import { createLibrarySearchParams } from "@/lib/recordings/library-search-params-client";

export function buildLibrarySearchParams(
  location: LocationFilter,
  tag: string,
  episode: string,
  search: string,
  shelf: LibraryShelf = LIBRARY_SHELVES.ALL,
) {
  return createLibrarySearchParams({
    episode,
    location,
    q: search.trim(),
    shelf,
    tag,
  });
}

export async function fetchLibraryApiPayload(params: URLSearchParams, signal: AbortSignal) {
  const response = await fetch(`${API_ROUTES.LIBRARY}?${params.toString()}`, { signal });

  if (!response.ok) {
    return {
      data: null,
      status: response.status,
    };
  }

  const data = (await response.json()) as LibraryApiPayload;
  return {
    data,
    status: response.status,
  };
}
