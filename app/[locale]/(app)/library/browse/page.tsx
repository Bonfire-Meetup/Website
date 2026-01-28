import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { BrowseCatalog } from "@/components/recordings/BrowseCatalog";
import { buildLibraryBrowsePayload } from "@/lib/recordings/library-filter";

export default async function LibraryBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{
    location?: string;
    tag?: string;
    episode?: string;
    q?: string;
  }>;
}) {
  const tCommon = await getTranslations("common");
  const tFilters = await getTranslations("libraryPage.filters");
  const tRecordings = await getTranslations("recordings");
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

  const payload = buildLibraryBrowsePayload({
    searchParams: urlParams,
    tCommon,
    tFilters,
    tRecordings,
  });

  return (
    <main className="gradient-bg min-h-screen pt-24">
      <BrowseCatalog initialPayload={payload} />
    </main>
  );
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
