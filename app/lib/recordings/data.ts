import { promises as fs } from "fs";
import path from "path";

import { cache } from "react";

interface HeroImage {
  src: string;
  alt: string;
}

export const getHeroImages = cache(async (altText: string): Promise<HeroImage[]> => {
  const heroDir = path.join(process.cwd(), "public", "hero");
  const heroFiles = await fs.readdir(heroDir);
  const webpFiles = heroFiles.filter((file) => file.toLowerCase().endsWith(".webp")).sort();

  return webpFiles.map((file) => ({
    alt: altText,
    src: `/hero/${file}`,
  }));
});
