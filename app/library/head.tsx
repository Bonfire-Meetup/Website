import { getAllRecordings } from "../lib/recordings";
import { getProxiedThumbnailUrl } from "../lib/thumbnail";

const FEATURED_PRELOAD_COUNT = 5;

export default function Head() {
  const featuredImages = getAllRecordings()
    .slice(0, FEATURED_PRELOAD_COUNT)
    .map((recording) => {
      if (recording.featureHeroThumbnail) {
        return recording.featureHeroThumbnail.startsWith("/library/featured/")
          ? recording.featureHeroThumbnail
          : getProxiedThumbnailUrl(recording.featureHeroThumbnail);
      }
      return getProxiedThumbnailUrl(recording.thumbnail);
    });

  const uniqueImages = Array.from(new Set(featuredImages));

  return (
    <>
      {uniqueImages.map((src) => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}
    </>
  );
}
