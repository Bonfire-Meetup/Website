import episodesData from "../../data/episodes.json";

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

export const episodes = episodesData.episodes as Episode[];

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
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
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
