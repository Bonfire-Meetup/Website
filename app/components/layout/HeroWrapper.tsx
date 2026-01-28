import { Hero } from "./Hero";

export function HeroWrapper({
  images,
}: {
  images: {
    src: string;
    alt: string;
    fallbackSrc?: string;
    fallbackType?: "image/jpeg" | "image/png";
  }[];
}) {
  return <Hero images={images} />;
}
