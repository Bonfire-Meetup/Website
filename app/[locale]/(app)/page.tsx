import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { HomeContent } from "@/HomeContent";
import { getHeroImages } from "@/lib/recordings/data";
import { getTrendingRecordingsSafe } from "@/lib/recordings/trending";

export default async function HomePage() {
  const [heroImages, trendingRecordings] = await Promise.all([
    getHeroImages(""),
    getTrendingRecordingsSafe(6),
  ]);

  return <HomeContent heroImages={heroImages} trendingRecordings={trendingRecordings} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };

  return {
    description: t("homeDescription", commonValues),
    openGraph: {
      description: t("homeDescription", commonValues),
      title: t("homeTitle", commonValues),
      type: "website",
    },
    title: t("homeTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("homeDescription", commonValues),
      title: t("homeTitle", commonValues),
    },
  };
}
