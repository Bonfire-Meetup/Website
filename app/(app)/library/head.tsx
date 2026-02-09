import { getFeaturedCandidates } from "@/lib/recordings/library-featured";
import { getShuffledFeaturedOrder } from "@/lib/recordings/library-featured-order";
import { getAllRecordings } from "@/lib/recordings/recordings";

const FEATURED_PRELOAD_COUNT = 5;

export default async function Head() {
  const [featuredOrder, allRecordings] = await Promise.all([
    getShuffledFeaturedOrder(),
    Promise.resolve(getAllRecordings()),
  ]);
  const featuredRecordings = getFeaturedCandidates(
    allRecordings,
    FEATURED_PRELOAD_COUNT,
    featuredOrder,
  );
  const featuredImages = featuredRecordings.map(
    (recording) => recording.featureHeroThumbnail || recording.thumbnail,
  );

  const uniqueImages = Array.from(new Set(featuredImages));

  return (
    <>
      {uniqueImages.map((src) => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}
    </>
  );
}
