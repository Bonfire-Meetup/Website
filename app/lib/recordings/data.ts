import path from "path";
import { promises as fs } from "fs";
import { cache } from "react";
import { getAllRecordings } from "./recordings";
import { LOCATIONS, type LocationValue } from "../config/constants";

type HeroImage = {
  src: string;
  alt: string;
};

export const getHeroImages = cache(async (altText: string): Promise<HeroImage[]> => {
  const heroDir = path.join(process.cwd(), "public", "hero");
  const heroFiles = await fs.readdir(heroDir);
  const webpFiles = heroFiles.filter((file) => file.toLowerCase().endsWith(".webp")).sort();

  return webpFiles.map((file) => ({
    src: `/hero/${file}`,
    alt: altText,
  }));
});

export function getHomepageRecordings() {
  const allRecordings = getAllRecordings();
  const latestRecordings = (location: LocationValue) =>
    allRecordings.filter((recording) => recording.location === location).slice(0, 3);

  const selections = [...latestRecordings(LOCATIONS.PRAGUE), ...latestRecordings(LOCATIONS.ZLIN)];

  for (let i = selections.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [selections[i], selections[j]] = [selections[j], selections[i]];
  }

  return selections;
}
