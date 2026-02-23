import { type HeroRecording, Hero } from "./Hero";

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
  return <Hero images={images} trendingRecordings={trendingRecordings} />;
}
