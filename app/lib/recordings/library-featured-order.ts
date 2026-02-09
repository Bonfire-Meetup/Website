"use cache";

import { cacheLife } from "next/cache";

import { CACHE_LIFETIMES } from "@/lib/config/cache-lifetimes";

import { LIBRARY_FEATURED_SHORT_IDS } from "./library-featured";

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export async function getShuffledFeaturedOrder(): Promise<string[]> {
  cacheLife({ revalidate: CACHE_LIFETIMES.LIBRARY_FEATURED });
  await Promise.resolve();

  const cacheWindowSeconds = CACHE_LIFETIMES.LIBRARY_FEATURED;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const cacheWindowIndex = Math.floor(nowSeconds / cacheWindowSeconds);

  const arr = [...LIBRARY_FEATURED_SHORT_IDS];
  const count = arr.length;

  const firstIndex = cacheWindowIndex % count;
  const firstItem = arr[firstIndex];

  const remaining = arr.filter((_, i) => i !== firstIndex);
  const seed = cacheWindowIndex * 7919 + 123456789;
  const random = seededRandom(seed);

  for (let i = remaining.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }

  return [firstItem, ...remaining];
}
