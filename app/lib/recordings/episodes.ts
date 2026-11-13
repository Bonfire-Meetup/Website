import eventsCalendarData from "../../data/events-calendar.json";

export interface Episode {
  id: string;
  city: "prague" | "zlin";
  number: number;
  title: string;
  date: string | null;
}

export interface EpisodeEntry {
  id: string;
  title: string;
  city: "prague" | "zlin";
  number: number;
  date: string | null;
  recordingsCount: number;
  photosCount: number;
  photosCover?: { src: string; width: number; height: number };
  videosHref: string;
  photosHref?: string;
}

const EVENT_TITLE_PATTERN = /^Bonfire@(?<city>Prague|Zlin) #(?<number>\d+)(?: - (?<name>.+))?$/u;

/** "Bonfire@Prague #9 - Architects of the Unseen" -> "Bonfire@Prague #9". */
export function eventEpisodeLabel(eventTitle: string): string | undefined {
  return eventTitle.match(/^Bonfire@\w+ #\d+/u)?.[0];
}

// An event becomes an episode (timeline, library, photos) once it has its
// Edition name, the part of the title after the dash. Read straight from the
// JSON so this module stays independent of events-calendar.ts.
export const episodes: Episode[] = eventsCalendarData.events.flatMap((event) => {
  const match = EVENT_TITLE_PATTERN.exec(event.title)?.groups;
  if (!match?.name) {
    return [];
  }

  return [
    {
      city: match.city === "Prague" ? ("prague" as const) : ("zlin" as const),
      date: event.date,
      id: event.id,
      number: Number(match.number),
      title: match.name,
    },
  ];
});

const episodeMap = new Map<string, Episode>(episodes.map((episode) => [episode.id, episode]));

export function getEpisodeById(id: string) {
  return episodeMap.get(id);
}

export function formatEpisodeTitle(episode: Episode) {
  const cityLabel = episode.city === "prague" ? "Prague" : "Zlin";

  return `Bonfire@${cityLabel} #${episode.number} - ${episode.title}`;
}

export function formatEpisodeSlug(episode: Episode) {
  return episode.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/(?:^-|-$)+/gu, "");
}

export function buildAlbumSlug(albumId: string, episodeId?: string) {
  if (!episodeId) {
    return albumId;
  }

  const episode = getEpisodeById(episodeId);

  if (!episode) {
    return albumId;
  }

  const slug = formatEpisodeSlug(episode);

  return slug ? `${albumId}-${slug}` : albumId;
}
