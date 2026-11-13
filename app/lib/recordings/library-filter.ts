import { LOCATIONS } from "@/lib/config/constants";
import {
  UNRECORDED_EPISODES,
  type CatalogRecording,
  type LocationFilter,
} from "@/lib/recordings/catalog-types";
import { getRecordingAccessState } from "@/lib/recordings/early-access";
import { getEpisodeById } from "@/lib/recordings/episodes";
import { getShuffledFeaturedOrder } from "@/lib/recordings/library-featured-order";
import {
  buildLibraryFilterOptions,
  type LibraryFilterTranslators,
  type RecordingEpisodeFacet,
  type RecordingFacets,
} from "@/lib/recordings/library-filter-options";
import {
  LIBRARY_SHELVES,
  parseRecordingQuery,
  type LibraryShelf,
  type RecordingQuery,
} from "@/lib/recordings/library-query";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { normalizeText } from "@/lib/utils/text";

export type { LocationFilter };
export {
  LIBRARY_SHELVES,
  parseLibraryShelf,
  parseRecordingQuery,
  type LibraryShelf,
  type RecordingQuery,
} from "@/lib/recordings/library-query";
export interface LibraryBasePayload {
  recordings: CatalogRecording[];
  featuredShortIdOrder: string[];
  activeLocation: LocationFilter;
  activeTag: string;
  activeEpisode: string;
  activeShelf: LibraryShelf;
  searchQuery: string;
  tagDropdownOptions: { label: string; value: string }[];
  episodeDropdownOptions: { label: string; value: string }[];
  episodeDropdownGroups: { label: string; options: { label: string; value: string }[] }[];
  locationAvailability: Record<LocationFilter, boolean>;
}

export interface LibraryRowsPayload extends LibraryBasePayload {
  rows: {
    key: string;
    titleKey: string;
    titleParams?: Record<string, string>;
    items: CatalogRecording[];
  }[];
}

export interface LibraryApiPayload {
  recordings: LibraryBasePayload["recordings"];
  filter: Pick<
    LibraryBasePayload,
    | "activeLocation"
    | "activeTag"
    | "activeEpisode"
    | "activeShelf"
    | "searchQuery"
    | "tagDropdownOptions"
    | "episodeDropdownOptions"
    | "episodeDropdownGroups"
    | "locationAvailability"
  > & { featuredShortIdOrder?: string[] };
}

export type { RecordingFacets };

export interface RecordingShelfOrders {
  memberPickOrder?: string[] | null;
  hotOrder?: string[] | null;
  hiddenGemOrder?: string[] | null;
}

interface SearchableCatalogRecording extends CatalogRecording {
  normalizedDescription: string;
  normalizedEpisode: string;
  normalizedLocation: string;
  normalizedSpeaker: string[];
  normalizedTags: string[];
  normalizedTitle: string;
}

const toSearchable = (recording: CatalogRecording): SearchableCatalogRecording => ({
  ...recording,
  normalizedDescription: normalizeText(recording.description ?? ""),
  normalizedEpisode: normalizeText(recording.episode ?? ""),
  normalizedLocation: normalizeText(recording.location),
  normalizedSpeaker: recording.speaker.map((name) => normalizeText(name)),
  normalizedTags: recording.tags.map((tag) => normalizeText(tag)),
  normalizedTitle: normalizeText(recording.title),
});

const toCatalogRecording = ({
  normalizedDescription: _normalizedDescription,
  normalizedEpisode: _normalizedEpisode,
  normalizedLocation: _normalizedLocation,
  normalizedSpeaker: _normalizedSpeaker,
  normalizedTags: _normalizedTags,
  normalizedTitle: _normalizedTitle,
  ...recording
}: SearchableCatalogRecording): CatalogRecording => recording;

export function getCatalogRecordings(): CatalogRecording[] {
  return getAllRecordings().map((recording) => ({
    access: recording.access,
    date: recording.date,
    description: recording.description,
    episode: recording.episode,
    episodeId: recording.episodeId,
    episodeNumber: recording.episodeNumber,
    featureHeroThumbnail: recording.featureHeroThumbnail,
    location: recording.location,
    shortId: recording.shortId,
    slug: recording.slug,
    speaker: recording.speaker,
    tags: recording.tags,
    thumbnail: recording.thumbnail,
    title: recording.title,
  }));
}

function shelfMatcher(shelf: LibraryShelf, orders: RecordingShelfOrders) {
  const ordered = {
    [LIBRARY_SHELVES.HIDDEN_GEMS]: orders.hiddenGemOrder,
    [LIBRARY_SHELVES.HOT]: orders.hotOrder,
    [LIBRARY_SHELVES.MEMBER_PICKS]: orders.memberPickOrder,
  } as Partial<Record<LibraryShelf, string[] | null | undefined>>;
  const orderedIds = shelf in ordered ? new Set(ordered[shelf] ?? []) : null;

  return (recording: CatalogRecording) => {
    if (shelf === LIBRARY_SHELVES.ALL) {
      return true;
    }

    if (orderedIds) {
      return orderedIds.has(recording.shortId);
    }

    const accessState = getRecordingAccessState(recording.access);

    return (
      (shelf === LIBRARY_SHELVES.EARLY_ACCESS && accessState.isEarlyAccess) ||
      (shelf === LIBRARY_SHELVES.GUILD_VAULT &&
        accessState.isGuildAccess &&
        accessState.isRestricted &&
        !accessState.isEarlyAccess)
    );
  };
}

function shelfOrder(shelf: LibraryShelf, orders: RecordingShelfOrders) {
  if (shelf === LIBRARY_SHELVES.MEMBER_PICKS) {
    return orders.memberPickOrder;
  }
  if (shelf === LIBRARY_SHELVES.HOT) {
    return orders.hotOrder;
  }
  if (shelf === LIBRARY_SHELVES.HIDDEN_GEMS) {
    return orders.hiddenGemOrder;
  }

  return null;
}

function matchesSearch(recording: SearchableCatalogRecording, normalizedQuery: string) {
  return (
    normalizedQuery.length === 0 ||
    recording.normalizedTitle.includes(normalizedQuery) ||
    recording.normalizedSpeaker.some((name) => name.includes(normalizedQuery)) ||
    recording.normalizedTags.some((tag) => tag.includes(normalizedQuery)) ||
    recording.normalizedLocation.includes(normalizedQuery) ||
    (Boolean(recording.episode) && recording.normalizedEpisode.includes(normalizedQuery)) ||
    (Boolean(recording.description) && recording.normalizedDescription.includes(normalizedQuery))
  );
}

function episodeFacets(recordings: CatalogRecording[]): RecordingEpisodeFacet[] {
  const episodes = new Map<string, RecordingEpisodeFacet>();

  for (const recording of recordings) {
    if (recording.episodeId && !episodes.has(recording.episodeId)) {
      episodes.set(recording.episodeId, {
        id: recording.episodeId,
        location: recording.location,
        number: recording.episodeNumber ?? null,
        title: recording.episode ?? recording.episodeId,
      });
    }
  }

  for (const episodeId of UNRECORDED_EPISODES) {
    const episode = episodes.has(episodeId) ? null : getEpisodeById(episodeId);

    if (episode) {
      episodes.set(episodeId, {
        id: episodeId,
        location: episode.city === "prague" ? LOCATIONS.PRAGUE : LOCATIONS.ZLIN,
        number: episode.number ?? null,
        title: episode.title,
      });
    }
  }

  return [...episodes.values()];
}

export function queryCatalogRecordings(
  query: RecordingQuery,
  orders: RecordingShelfOrders = {},
): { recordings: CatalogRecording[]; facets: RecordingFacets } {
  const inLocation = (recording: CatalogRecording) =>
    query.location === "all" || recording.location === query.location;
  const inTag = (recording: CatalogRecording) =>
    query.tag === "all" || recording.tags.includes(query.tag);
  const inEpisode = (recording: CatalogRecording) =>
    query.episode === "all" || recording.episodeId === query.episode;
  const shelfScoped = getCatalogRecordings()
    .filter(shelfMatcher(query.shelf, orders))
    .map(toSearchable);
  const normalizedQuery = normalizeText(query.q.trim());
  const recordings = shelfScoped.filter(
    (recording) =>
      inLocation(recording) &&
      inTag(recording) &&
      inEpisode(recording) &&
      matchesSearch(recording, normalizedQuery),
  );
  const order = shelfOrder(query.shelf, orders);

  if (order?.length) {
    const rankById = new Map(order.map((shortId, index) => [shortId, index]));
    const rank = (shortId: string) => rankById.get(shortId) ?? Number.MAX_SAFE_INTEGER;
    recordings.sort((a, b) => rank(a.shortId) - rank(b.shortId));
  }

  const availableIn = (location: LocationFilter) =>
    shelfScoped.some(
      (recording) => recording.location === location && inTag(recording) && inEpisode(recording),
    );

  return {
    facets: {
      episodes: episodeFacets(shelfScoped.filter((r) => inLocation(r) && inTag(r))),
      locations: {
        all: true,
        [LOCATIONS.PRAGUE]: availableIn(LOCATIONS.PRAGUE),
        [LOCATIONS.ZLIN]: availableIn(LOCATIONS.ZLIN),
      },
      tags: [
        ...new Set(shelfScoped.filter((r) => inLocation(r) && inEpisode(r)).flatMap((r) => r.tags)),
      ].sort((a, b) => a.localeCompare(b)),
    },
    recordings: recordings.map(toCatalogRecording),
  };
}

function buildRows(recordings: CatalogRecording[], query: RecordingQuery) {
  const rows: LibraryRowsPayload["rows"] = [];
  const latest = recordings.slice(0, 12);

  if (latest.length > 0) {
    rows.push({ items: latest, key: "latest", titleKey: "latest" });
  }

  const pragueItems = recordings.filter((r) => r.location === LOCATIONS.PRAGUE);
  const zlinItems = recordings.filter((r) => r.location === LOCATIONS.ZLIN);

  if (query.location !== LOCATIONS.ZLIN && pragueItems.length > 0) {
    rows.push({ items: pragueItems, key: "location-prague", titleKey: "prague" });
  }

  if (query.location !== LOCATIONS.PRAGUE && zlinItems.length > 0) {
    rows.push({ items: zlinItems, key: "location-zlin", titleKey: "zlin" });
  }

  if (query.tag === "all") {
    const counts = new Map<string, number>();
    recordings.forEach((recording) =>
      recording.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
    );

    [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([tag]) => {
        rows.push({
          items: recordings.filter((recording) => recording.tags.includes(tag)),
          key: `tag-${tag}`,
          titleKey: "topic",
          titleParams: { tag },
        });
      });
  }

  return rows;
}

async function buildLibraryPayload({
  searchParams,
  includeRows,
  memberPickOrder,
  hotOrder,
  hiddenGemOrder,
  ...translators
}: LibraryFilterTranslators &
  RecordingShelfOrders & {
    searchParams: URLSearchParams;
    includeRows?: boolean;
  }): Promise<LibraryBasePayload & { rows: LibraryRowsPayload["rows"] }> {
  const featuredShortIdOrder = await getShuffledFeaturedOrder();
  const query = parseRecordingQuery(searchParams);
  const { recordings, facets } = queryCatalogRecordings(query, {
    hiddenGemOrder,
    hotOrder,
    memberPickOrder,
  });
  const hasActiveFilters =
    query.location !== "all" ||
    query.tag !== "all" ||
    query.episode !== "all" ||
    query.q.trim() !== "";

  return {
    ...buildLibraryFilterOptions(facets, translators),
    activeEpisode: query.episode,
    activeLocation: query.location,
    activeShelf: query.shelf,
    activeTag: query.tag,
    featuredShortIdOrder,
    locationAvailability: facets.locations,
    recordings,
    rows: (includeRows ?? !hasActiveFilters) ? buildRows(recordings, query) : [],
    searchQuery: query.q,
  };
}

export async function buildLibraryRowsPayload(
  args: Omit<Parameters<typeof buildLibraryPayload>[0], "includeRows">,
): Promise<LibraryRowsPayload> {
  return await buildLibraryPayload({ ...args, includeRows: true });
}

export async function buildLibraryBrowsePayload(
  args: Omit<Parameters<typeof buildLibraryPayload>[0], "includeRows">,
): Promise<LibraryBasePayload> {
  const { rows: _rows, ...base } = await buildLibraryPayload({ ...args, includeRows: false });

  return base;
}
