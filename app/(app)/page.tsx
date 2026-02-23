import type { Metadata } from "next";

import { HomeContent } from "@/HomeContent";
import { buildMetaPageMetadata } from "@/lib/metadata";
import { getHeroImages } from "@/lib/recordings/data";
import { getTrendingRecordingsSafe } from "@/lib/recordings/trending";

const HERO_TRENDING_LIMIT = 3;
const TRENDING_SECTION_LIMIT = 6;
const TRENDING_FETCH_LIMIT = HERO_TRENDING_LIMIT + TRENDING_SECTION_LIMIT;

function hashSeed(input: string): number {
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function pickSeededItems<T>(items: T[], limit: number, seed: string): T[] {
  if (items.length <= limit) {
    return items;
  }

  const pool = [...items];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = hashSeed(`${seed}-${i}`) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, limit);
}

function pickHeroTrendingRecordings<T>(items: T[], limit: number, seed: string): T[] {
  if (items.length <= limit) {
    return items;
  }

  const [primary, ...secondaryPool] = items;
  const secondary = pickSeededItems(secondaryPool, Math.max(limit - 1, 0), seed);

  return [primary, ...secondary];
}

function getDailySeed(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export default async function HomePage() {
  const [heroImages, trendingRecordings] = await Promise.all([
    getHeroImages(""),
    getTrendingRecordingsSafe(TRENDING_FETCH_LIMIT),
  ]);

  const heroTrendingRecordings = pickHeroTrendingRecordings(
    trendingRecordings,
    HERO_TRENDING_LIMIT,
    getDailySeed(),
  );
  const heroRecordingIds = new Set(heroTrendingRecordings.map((recording) => recording.shortId));
  const nonHeroTrendingRecordings = trendingRecordings.filter(
    (recording) => !heroRecordingIds.has(recording.shortId),
  );

  return (
    <HomeContent
      heroImages={heroImages}
      heroTrendingRecordings={heroTrendingRecordings}
      trendingRecordings={nonHeroTrendingRecordings.slice(0, TRENDING_SECTION_LIMIT)}
    />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("home");
}
