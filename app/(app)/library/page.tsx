import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { RecordingsCatalog } from "@/components/recordings/RecordingsCatalog";
import {
  HiddenGemsRailServer,
  HotPicksRailServer,
  MemberPicksRailServer,
} from "@/components/recordings/TrendingRailsServer";
import { TrendingRailSkeleton } from "@/components/shared/Skeletons";
import { getInitialLocale } from "@/lib/i18n/initial";
import { buildLibraryPayload } from "@/lib/recordings/library-filter";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    location?: string;
    tag?: string;
    episode?: string;
    q?: string;
    view?: string;
  }>;
}) {
  const locale = await getInitialLocale();
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tFilters = await getTranslations({ locale, namespace: "libraryPage.filters" });
  const tRows = await getTranslations({ locale, namespace: "libraryPage.rows" });
  const tRecordings = await getTranslations({ locale, namespace: "recordings" });
  const params = await searchParams;
  const urlParams = new URLSearchParams();
  if (params.location) {
    urlParams.set("location", params.location);
  }
  if (params.tag) {
    urlParams.set("tag", params.tag);
  }
  if (params.episode) {
    urlParams.set("episode", params.episode);
  }
  if (params.q) {
    urlParams.set("q", params.q);
  }
  if (params.view) {
    urlParams.set("view", params.view);
  }
  const payload = buildLibraryPayload({
    searchParams: urlParams,
    tCommon,
    tFilters,
    tRows,
    tRecordings,
  });

  const scrollLeftLabel = tCommon("scrollLeft");
  const scrollRightLabel = tCommon("scrollRight");

  return (
    <main className="gradient-bg min-h-screen pt-24">
      <RecordingsCatalog
        initialPayload={payload}
        scrollLeftLabel={scrollLeftLabel}
        scrollRightLabel={scrollRightLabel}
        previousFeaturedLabel={tCommon("previousFeatured")}
        nextFeaturedLabel={tCommon("nextFeatured")}
        trendingSlots={{
          memberPicks: (
            <Suspense key="member-picks" fallback={<TrendingRailSkeleton />}>
              <MemberPicksRailServer
                scrollLeftLabel={scrollLeftLabel}
                scrollRightLabel={scrollRightLabel}
              />
            </Suspense>
          ),
          hotPicks: (
            <Suspense key="hot-picks" fallback={<TrendingRailSkeleton />}>
              <HotPicksRailServer
                scrollLeftLabel={scrollLeftLabel}
                scrollRightLabel={scrollRightLabel}
              />
            </Suspense>
          ),
          hiddenGems: (
            <Suspense key="hidden-gems" fallback={<TrendingRailSkeleton />}>
              <HiddenGemsRailServer
                scrollLeftLabel={scrollLeftLabel}
                scrollRightLabel={scrollRightLabel}
              />
            </Suspense>
          ),
        }}
      />
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getInitialLocale();
  const t = await getTranslations({ locale, namespace: "meta" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };

  return {
    description: t("libraryDescription"),
    openGraph: {
      description: t("libraryDescription"),
      title: t("libraryTitle", commonValues),
      type: "website",
    },
    title: t("libraryTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("libraryDescription"),
      title: t("libraryTitle", commonValues),
    },
  };
}
