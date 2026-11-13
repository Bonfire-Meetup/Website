import type { Metadata } from "next";

import { buildMetaPageMetadata } from "@/lib/metadata";
import {
  PHOTO_ALBUM_BASE_URL,
  getPhotoAlbumSummariesOrdered,
} from "@/lib/photos/photo-album-summary";
import { photoAlbumUrlSlug } from "@/lib/photos/photo-albums-resolve";
import { episodes, type EpisodeEntry } from "@/lib/recordings/episodes";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { TimelinePageContent } from "./TimelinePageContent";

const albums = getPhotoAlbumSummariesOrdered();

function getEpisodeEntries(): EpisodeEntry[] {
  const recordings = getAllRecordings();

  return episodes
    .map((episode) => {
      const episodeRecordings = recordings.filter(
        (recording) => recording.episodeId === episode.id,
      );
      const album = albums.find((item) => item.episodeId === episode.id);

      return {
        city: episode.city,
        date: episode.date ?? null,
        id: episode.id,
        number: episode.number,
        photosCount: album?.count ?? 0,
        photosCover: album?.cover,
        photosHref: album ? PAGE_ROUTES.PHOTOS_ALBUM(photoAlbumUrlSlug(album)) : undefined,
        recordingsCount: episodeRecordings.length,
        title: episode.title,
        videosHref: `${PAGE_ROUTES.LIBRARY_BROWSE}?episode=${episode.id}`,
      };
    })
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;

      if (aTime !== bTime) {
        return bTime - aTime;
      }

      if (a.city !== b.city) {
        return a.city.localeCompare(b.city);
      }

      return b.number - a.number;
    });
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("timeline");
}

export default function TimelinePage() {
  return <TimelinePageContent entries={getEpisodeEntries()} photoBaseUrl={PHOTO_ALBUM_BASE_URL} />;
}
