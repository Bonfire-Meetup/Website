import type { Metadata } from "next";

import { HomeContent } from "@/HomeContent";
import { buildMetaPageMetadata } from "@/lib/metadata";
import { getHeroImages } from "@/lib/recordings/data";
import { getTrendingRecordingsSafe } from "@/lib/recordings/trending";

export default async function HomePage() {
  const [heroImages, trendingRecordings] = await Promise.all([
    getHeroImages(""),
    getTrendingRecordingsSafe(6),
  ]);

  return <HomeContent heroImages={heroImages} trendingRecordings={trendingRecordings} />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("home");
}
