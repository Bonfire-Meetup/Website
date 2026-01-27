import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { RecordingsSectionSkeleton } from "@/components/shared/Skeletons";
import { HomeContent } from "@/HomeContent";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getHeroImages } from "@/lib/recordings/data";
import { getTrendingRecordingsSafe } from "@/lib/recordings/trending";

function HomeContentFallback() {
  return (
    <main id="top" className="relative">
      <section className="relative flex min-h-svh flex-col items-center justify-center bg-neutral-50 px-4 pt-20 pb-20 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-24 w-80 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </section>
      <div className="section-divider mx-auto max-w-4xl" />
      <RecordingsSectionSkeleton />
    </main>
  );
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  const heroImages = await getHeroImages("");
  const trendingRecordings = await getTrendingRecordingsSafe(6);

  return (
    <Suspense fallback={<HomeContentFallback />}>
      <HomeContent
        heroImages={heroImages}
        trendingRecordings={trendingRecordings}
        locale={locale}
      />
    </Suspense>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations({ locale, namespace: "meta" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
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
