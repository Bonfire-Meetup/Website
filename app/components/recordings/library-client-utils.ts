import { API_ROUTES } from "@/lib/api/routes";
import {
  LIBRARY_SHELVES,
  type LibraryApiPayload,
  type LibraryShelf,
  type LocationFilter,
} from "@/lib/recordings/library-filter";

export function buildLibrarySearchParams(
  location: LocationFilter,
  tag: string,
  episode: string,
  search: string,
  shelf: LibraryShelf = LIBRARY_SHELVES.ALL,
) {
  const params = new URLSearchParams();

  if (location !== "all") {
    params.set("location", location);
  }

  if (tag !== "all") {
    params.set("tag", tag);
  }

  if (episode !== "all") {
    params.set("episode", episode);
  }

  if (search.trim()) {
    params.set("q", search.trim());
  }

  if (shelf !== LIBRARY_SHELVES.ALL) {
    params.set("shelf", shelf);
  }

  return params;
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
