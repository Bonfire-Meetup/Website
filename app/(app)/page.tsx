import type { Metadata } from "next";

import { HomeContent } from "@/HomeContent";
import { buildMetaPageMetadata } from "@/lib/metadata";
import { getHeroImages } from "@/lib/recordings/data";
import { getTrendingRecordingsSafe } from "@/lib/recordings/trending";

function pickRandomItems<T>(items: T[], limit: number): T[] {
  if (items.length <= limit) {
    return items;
  }

  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }

  return shuffled.slice(0, limit);
}

export default async function HomePage() {
  const [heroImages, trendingRecordings] = await Promise.all([
    getHeroImages(""),
    getTrendingRecordingsSafe(6),
  ]);

  const heroTrendingRecordings = pickRandomItems(trendingRecordings, 3);

  return (
    <HomeContent
      heroImages={heroImages}
      heroTrendingRecordings={heroTrendingRecordings}
      trendingRecordings={trendingRecordings}
    />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("home");
}
