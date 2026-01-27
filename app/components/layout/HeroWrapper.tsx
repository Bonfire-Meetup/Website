import type { Locale } from "@/lib/i18n/locales";

import { Hero } from "./Hero";

export function HeroWrapper({
  images,
  locale,
}: {
  images: {
    src: string;
    alt: string;
    fallbackSrc?: string;
    fallbackType?: "image/jpeg" | "image/png";
  }[];
  locale?: Locale;
}) {
  return <Hero images={images} locale={locale} />;
}
