import { LOCATIONS } from "@/lib/config/constants";
import type { LocationFilter } from "@/lib/recordings/catalog-types";

export interface RecordingEpisodeFacet {
  id: string;
  title: string;
  number: number | null;
  location: typeof LOCATIONS.PRAGUE | typeof LOCATIONS.ZLIN;
}

export interface RecordingFacets {
  tags: string[];
  episodes: RecordingEpisodeFacet[];
  locations: Record<LocationFilter, boolean>;
}

interface DropdownOption {
  label: string;
  value: string;
}

export interface LibraryFilterTranslators {
  tCommon: (key: string, values?: Record<string, string>) => string;
  tFilters: (key: string, values?: Record<string, string>) => string;
  tRecordings: (key: string) => string;
}

export function buildLibraryFilterOptions(
  facets: RecordingFacets,
  { tCommon, tFilters, tRecordings }: LibraryFilterTranslators,
) {
  const tagDropdownOptions: DropdownOption[] = [
    { label: tFilters("allTags"), value: "all" },
    ...facets.tags.map((tag) => ({ label: tag, value: tag })),
  ];
  const episodeDropdownOptions: DropdownOption[] = [
    { label: tFilters("allEpisodes"), value: "all" },
  ];
  const toOption = (episode: RecordingEpisodeFacet): DropdownOption => ({
    label: episode.number
      ? `${tRecordings("epShort")} ${episode.number} - ${episode.title}`
      : episode.title,
    value: episode.id,
  });
  const episodesIn = (location: RecordingEpisodeFacet["location"]) =>
    facets.episodes
      .filter((episode) => episode.location === location)
      .sort((a, b) => (b.number ?? 0) - (a.number ?? 0))
      .map(toOption);
  const episodeDropdownGroups = [
    {
      label: tFilters("prague", { prague: tCommon("prague") }),
      options: episodesIn(LOCATIONS.PRAGUE),
    },
    { label: tFilters("zlin", { zlin: tCommon("zlin") }), options: episodesIn(LOCATIONS.ZLIN) },
  ].filter((group) => group.options.length > 0);

  return { episodeDropdownGroups, episodeDropdownOptions, tagDropdownOptions };
}
