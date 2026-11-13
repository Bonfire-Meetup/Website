import { type HeroRecording, Hero } from "./Hero";
import { HERO_VARIANT } from "./hero-variant";
import { HeroTalkSelect } from "./HeroTalkSelect";

export function HeroWrapper({
  images,
  trendingRecordings,
}: {
  images: {
    src: string;
    alt: string;
    fallbackSrc?: string;
    fallbackType?: "image/jpeg" | "image/png";
  }[];
  trendingRecordings?: HeroRecording[];
}) {
  if (HERO_VARIANT === "classic") {
    return <Hero images={images} trendingRecordings={trendingRecordings} />;
  }

  return <HeroTalkSelect images={images} trendingRecordings={trendingRecordings} />;
}
