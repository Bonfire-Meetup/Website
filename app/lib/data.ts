import path from "path";
import { promises as fs } from "fs";
import { cache } from "react";
import { getAllRecordings } from "./recordings";
import { LOCATIONS, type LocationValue } from "./constants";

type HeroImage = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  fallbackType?: "image/jpeg" | "image/png";
};

export const getHeroImages = cache(async (altText: string): Promise<HeroImage[]> => {
  const heroDir = path.join(process.cwd(), "public", "hero");
  const heroFiles = await fs.readdir(heroDir);
  const entries = new Map<
    string,
    { webp?: string; fallback?: string; fallbackType?: "image/jpeg" | "image/png" }
  >();

  heroFiles.forEach((file) => {
    const match = file.match(/^(.*)\.(png|jpe?g|webp)$/i);
    if (!match) return;
    const base = match[1];
    const ext = match[2].toLowerCase();
    const entry = entries.get(base) ?? {};

    if (ext === "webp") {
      entry.webp = file;
    } else {
      entry.fallback = file;
      entry.fallbackType = ext === "png" ? "image/png" : "image/jpeg";
    }

    entries.set(base, entry);
  });

  return Array.from(entries.keys())
    .sort()
    .map((base) => {
      const entry = entries.get(base);
      if (!entry) return null;
      if (entry.webp) {
        return {
          src: `/hero/${entry.webp}`,
          alt: altText,
          fallbackSrc: entry.fallback ? `/hero/${entry.fallback}` : undefined,
          fallbackType: entry.fallbackType,
        };
      }
      if (entry.fallback) {
        return {
          src: `/hero/${entry.fallback}`,
          alt: altText,
        };
      }
      return null;
    })
    .filter((image): image is HeroImage => Boolean(image));
});

export function getHomepageRecordings() {
  const allRecordings = getAllRecordings();
  const latestRecordings = (location: LocationValue) =>
    allRecordings.filter((recording) => recording.location === location).slice(0, 3);

  return [...latestRecordings(LOCATIONS.PRAGUE), ...latestRecordings(LOCATIONS.ZLIN)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
