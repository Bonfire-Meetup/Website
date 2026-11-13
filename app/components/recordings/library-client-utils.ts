import { useTranslations } from "next-intl";

import { ApiError } from "@/lib/api/errors";
import { getSharedQueryClient } from "@/lib/api/query-client";
import { API_ROUTES } from "@/lib/api/routes";
import type { CatalogRecording } from "@/lib/recordings/catalog-types";
import type { LibraryApiPayload, LocationFilter } from "@/lib/recordings/library-filter";
import {
  buildLibraryFilterOptions,
  type LibraryFilterTranslators,
  type RecordingFacets,
} from "@/lib/recordings/library-filter-options";
import {
  LIBRARY_SHELVES,
  parseRecordingQuery,
  type LibraryShelf,
} from "@/lib/recordings/library-query";
import { createLibrarySearchParams } from "@/lib/recordings/library-search-params-client";

const RECORDINGS_PAGE_LIMIT = 500;
const LIBRARY_CACHE_MS = 30_000;

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

export function useLibraryFilterTranslators(): LibraryFilterTranslators {
  const tCommon = useTranslations("common");
  const tFilters = useTranslations("libraryPage.filters");
  const tRecordings = useTranslations("recordings");

  return { tCommon, tFilters, tRecordings };
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new ApiError("Library request failed", response.status);
  }

  return response.json() as Promise<T>;
}

function cachedJson<T>(url: string) {
  const queryClient = getSharedQueryClient();

  if (!queryClient) {
    return getJson<T>(url);
  }

  return queryClient.fetchQuery({
    queryFn: ({ signal }) => getJson<T>(url, signal),
    queryKey: ["library", url],
    staleTime: LIBRARY_CACHE_MS,
  });
}

export async function fetchLibraryApiPayload(
  params: URLSearchParams,
  signal: AbortSignal,
  translators: LibraryFilterTranslators,
) {
  const query = new URLSearchParams(params);
  query.delete("view");
  let recordings: { items: CatalogRecording[] };
  let facets: RecordingFacets;

  try {
    [recordings, facets] = await Promise.all([
      cachedJson<{ items: CatalogRecording[] }>(
        `${API_ROUTES.RECORDINGS.BASE}?${query.toString()}&limit=${RECORDINGS_PAGE_LIMIT}`,
      ),
      cachedJson<RecordingFacets>(`${API_ROUTES.RECORDINGS.FACETS}?${query.toString()}`),
    ]);
  } catch (error) {
    return { data: null, status: error instanceof ApiError ? (error.status ?? 500) : 500 };
  }

  if (signal.aborted) {
    return { data: null, status: 0 };
  }

  const active = parseRecordingQuery(query);
  const data: LibraryApiPayload = {
    filter: {
      ...buildLibraryFilterOptions(facets, translators),
      activeEpisode: active.episode,
      activeLocation: active.location,
      activeShelf: active.shelf,
      activeTag: active.tag,
      locationAvailability: facets.locations,
      searchQuery: active.q,
    },
    recordings: recordings.items,
  };

  return { data, status: 200 };
}
