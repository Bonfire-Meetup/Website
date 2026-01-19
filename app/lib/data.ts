import path from "path";
import { promises as fs } from "fs";
import { cache } from "react";
import { getAllRecordings } from "./recordings";
import { LOCATIONS, type LocationValue } from "./constants";

export const getHeroImages = cache(async (altText: string) => {
  const heroDir = path.join(process.cwd(), "public", "hero");
  const heroFiles = await fs.readdir(heroDir);
  return heroFiles
    .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
    .map((file) => ({
      src: `/hero/${file}`,
      alt: altText,
    }));
});

export function getHomepageRecordings() {
  const allRecordings = getAllRecordings();
  const latestRecordings = (location: LocationValue) =>
    allRecordings.filter((recording) => recording.location === location).slice(0, 3);

  return [...latestRecordings(LOCATIONS.PRAGUE), ...latestRecordings(LOCATIONS.ZLIN)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
