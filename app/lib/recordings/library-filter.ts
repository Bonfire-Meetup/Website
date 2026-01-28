import {
  UNRECORDED_EPISODES,
  type CatalogRecording,
} from "@/components/recordings/RecordingsCatalogTypes";
import { LOCATIONS, type LocationValue } from "@/lib/config/constants";
import { getEpisodeById } from "@/lib/recordings/episodes";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { normalizeText } from "@/lib/utils/text";

export type LocationFilter = "all" | LocationValue;

export interface LibraryBasePayload {
  recordings: CatalogRecording[];
  activeLocation: LocationFilter;
  activeTag: string;
  activeEpisode: string;
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
    | "searchQuery"
    | "tagDropdownOptions"
    | "episodeDropdownOptions"
    | "episodeDropdownGroups"
    | "locationAvailability"
  >;
}

function buildLibraryPayload({
  searchParams,
  tCommon,
  tFilters,
  tRecordings,
  includeRows,
}: {
  searchParams: URLSearchParams;
  tCommon: (key: string, values?: Record<string, string>) => string;
  tFilters: (key: string, values?: Record<string, string>) => string;
  tRecordings: (key: string) => string;
  includeRows?: boolean;
}): LibraryBasePayload & { rows: LibraryRowsPayload["rows"] } {
  const locationParam = searchParams.get("location") ?? "";
  const isPragueLocation = locationParam === LOCATIONS.PRAGUE;
  const isZlinLocation = locationParam === LOCATIONS.ZLIN;
  const isValidLocation = isPragueLocation || isZlinLocation;
  const activeLocation: LocationFilter = isValidLocation && locationParam ? locationParam : "all";
  const activeTag = searchParams.get("tag") ?? "all";
  const activeEpisode = searchParams.get("episode") ?? "all";
  const searchQuery = searchParams.get("q") ?? "";
  const normalizedSearchQuery = normalizeText(searchQuery.trim());

  const recordings = getAllRecordings().map((recording) => ({
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

  const tagOptions = (() => {
    const filteredForTags = recordings.filter(
      (r) =>
        (activeLocation === "all" || r.location === activeLocation) &&
        (activeEpisode === "all" || r.episodeId === activeEpisode),
    );
    const tags = Array.from(new Set(filteredForTags.flatMap((recording) => recording.tags))).sort(
      (a, b) => a.localeCompare(b),
    );

    return ["all", ...tags];
  })();

  const tagDropdownOptions = tagOptions.map((tag) => ({
    label: tag === "all" ? tFilters("allTags") : tag,
    value: tag,
  }));

  const episodeDropdownOptions = [{ label: tFilters("allEpisodes"), value: "all" }];

  const episodeOptions = (() => {
    const filteredForEpisodes = recordings.filter(
      (r) =>
        (activeLocation === "all" || r.location === activeLocation) &&
        (activeTag === "all" || r.tags.includes(activeTag)),
    );
    const map = new Map<
      string,
      { number?: number; location: typeof LOCATIONS.PRAGUE | typeof LOCATIONS.ZLIN; title: string }
    >();
    filteredForEpisodes.forEach((recording) => {
      if (recording.episodeId) {
        const title = recording.episode ?? recording.episodeId;

        if (!map.has(recording.episodeId)) {
          map.set(recording.episodeId, {
            location: recording.location,
            number: recording.episodeNumber,
            title,
          });
        }
      }
    });

    for (const episodeId of UNRECORDED_EPISODES) {
      if (!map.has(episodeId)) {
        const episode = getEpisodeById(episodeId);

        if (episode) {
          map.set(episodeId, {
            location: episode.city === "prague" ? LOCATIONS.PRAGUE : LOCATIONS.ZLIN,
            number: episode.number,
            title: episode.title,
          });
        }
      }
    }

    return Array.from(map.entries()).map(([id, data]) => ({
      label: data.number ? `${tRecordings("epShort")} ${data.number} - ${data.title}` : data.title,
      location: data.location,
      number: data.number || 0,
      value: id,
    }));
  })();

  const groupedEpisodes = (() => {
    const prague = episodeOptions
      .filter((e) => e.location === LOCATIONS.PRAGUE)
      .sort((a, b) => b.number - a.number);
    const zlin = episodeOptions
      .filter((e) => e.location === LOCATIONS.ZLIN)
      .sort((a, b) => b.number - a.number);

    return [
      { label: tFilters("prague", { prague: tCommon("prague") }), options: prague },
      { label: tFilters("zlin", { zlin: tCommon("zlin") }), options: zlin },
    ].filter((group) => group.options.length > 0);
  })();

  const episodeDropdownGroups = groupedEpisodes.map((group) => ({
    label: group.label,
    options: group.options.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  }));

  const locationAvailability = {
    all: true,
    [LOCATIONS.PRAGUE]: recordings.some((recording) => {
      const isLocationMatch = recording.location === LOCATIONS.PRAGUE;
      const isTagMatch = activeTag === "all" || recording.tags.includes(activeTag);
      const isEpisodeMatch = activeEpisode === "all" || recording.episodeId === activeEpisode;

      return isLocationMatch && isTagMatch && isEpisodeMatch;
    }),
    [LOCATIONS.ZLIN]: recordings.some((recording) => {
      const isLocationMatch = recording.location === LOCATIONS.ZLIN;
      const isTagMatch = activeTag === "all" || recording.tags.includes(activeTag);
      const isEpisodeMatch = activeEpisode === "all" || recording.episodeId === activeEpisode;

      return isLocationMatch && isTagMatch && isEpisodeMatch;
    }),
  };

  const filteredRecordings = recordings.filter((recording) => {
    const isLocationMatch = activeLocation === "all" || recording.location === activeLocation;
    const isTagMatch = activeTag === "all" || recording.tags.includes(activeTag);
    const isEpisodeMatch = activeEpisode === "all" || recording.episodeId === activeEpisode;

    const isSearchEmpty = normalizedSearchQuery.length === 0;
    const isTitleMatch = normalizeText(recording.title).includes(normalizedSearchQuery);
    const isSpeakerMatch = recording.speaker.some((name) =>
      normalizeText(name).includes(normalizedSearchQuery),
    );
    const isTagInSearch = recording.tags.some((tag) =>
      normalizeText(tag).includes(normalizedSearchQuery),
    );
    const isLocationInSearch = normalizeText(recording.location).includes(normalizedSearchQuery);
    const hasEpisode = Boolean(recording.episode);
    const isEpisodeInSearch =
      hasEpisode && recording.episode
        ? normalizeText(recording.episode).includes(normalizedSearchQuery)
        : false;
    const hasDescription = Boolean(recording.description);
    const isDescriptionMatch =
      hasDescription && recording.description
        ? normalizeText(recording.description).includes(normalizedSearchQuery)
        : false;

    const isSearchMatch =
      isSearchEmpty ||
      isTitleMatch ||
      isSpeakerMatch ||
      isTagInSearch ||
      isLocationInSearch ||
      isEpisodeInSearch ||
      isDescriptionMatch;

    return isLocationMatch && isTagMatch && isEpisodeMatch && isSearchMatch;
  });

  const isLocationFiltered = activeLocation !== "all";
  const isTagFiltered = activeTag !== "all";
  const isEpisodeFiltered = activeEpisode !== "all";
  const isSearchFiltered = searchQuery.trim() !== "";
  const hasActiveFilters =
    isLocationFiltered || isTagFiltered || isEpisodeFiltered || isSearchFiltered;
  const shouldIncludeRows = includeRows ?? !hasActiveFilters;

  const rows = shouldIncludeRows
    ? (() => {
        const nextRows: LibraryRowsPayload["rows"] = [];
        const latestRecordings = filteredRecordings.slice(0, 12);

        if (latestRecordings.length > 0) {
          nextRows.push({ items: latestRecordings, key: "latest", titleKey: "latest" });
        }

        const pragueItems = filteredRecordings.filter((r) => r.location === LOCATIONS.PRAGUE);
        const zlinItems = filteredRecordings.filter((r) => r.location === LOCATIONS.ZLIN);

        if (activeLocation === "all") {
          if (pragueItems.length > 0) {
            nextRows.push({
              items: pragueItems,
              key: "location-prague",
              titleKey: "prague",
            });
          }

          if (zlinItems.length > 0) {
            nextRows.push({
              items: zlinItems,
              key: "location-zlin",
              titleKey: "zlin",
            });
          }
        } else if (activeLocation === LOCATIONS.PRAGUE && pragueItems.length > 0) {
          nextRows.push({
            items: pragueItems,
            key: "location-prague",
            titleKey: "prague",
          });
        } else if (activeLocation === LOCATIONS.ZLIN && zlinItems.length > 0) {
          nextRows.push({
            items: zlinItems,
            key: "location-zlin",
            titleKey: "zlin",
          });
        }

        if (activeTag === "all") {
          const counts = new Map<string, number>();
          filteredRecordings.forEach((recording) => {
            recording.tags.forEach((tag) => {
              counts.set(tag, (counts.get(tag) ?? 0) + 1);
            });
          });

          const topTags = Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([tag]) => tag);

          topTags.forEach((tag) => {
            const items = filteredRecordings.filter((recording) => recording.tags.includes(tag));
            if (items.length > 0) {
              nextRows.push({
                items,
                key: `tag-${tag}`,
                titleKey: "topic",
                titleParams: { tag },
              });
            }
          });
        }

        return nextRows;
      })()
    : [];

  const basePayload: LibraryBasePayload = {
    recordings: filteredRecordings,
    activeLocation,
    activeTag,
    activeEpisode,
    searchQuery,
    tagDropdownOptions,
    episodeDropdownOptions,
    episodeDropdownGroups,
    locationAvailability,
  };

  return {
    ...basePayload,
    rows,
  };
}

export function buildLibraryRowsPayload(
  args: Omit<Parameters<typeof buildLibraryPayload>[0], "includeRows">,
): LibraryRowsPayload {
  return buildLibraryPayload({ ...args, includeRows: true });
}

export function buildLibraryBrowsePayload(
  args: Omit<Parameters<typeof buildLibraryPayload>[0], "includeRows">,
): LibraryBasePayload {
  const payload = buildLibraryPayload({ ...args, includeRows: false });
  const { rows: _rows, ...base } = payload;
  return base;
}
