import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { BrowseCatalog } from "@/components/recordings/BrowseCatalog";
import { buildMetaPageMetadata } from "@/lib/metadata";
import { buildLibraryBrowsePayload, parseLibraryShelf } from "@/lib/recordings/library-filter";
import {
  createLibrarySearchParams,
  loadLibraryQueryState,
} from "@/lib/recordings/library-search-params-server";
import { getLibraryShelfOrders } from "@/lib/recordings/library-shelf-orders";

export default async function LibraryBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{
    location?: string;
    tag?: string;
    episode?: string;
    shelf?: string;
    q?: string;
  }>;
}) {
  const tCommon = await getTranslations("common");
  const tFilters = await getTranslations("libraryPage.filters");
  const tRecordings = await getTranslations("recordings");
  const params = await loadLibraryQueryState(searchParams);
  const urlParams = createLibrarySearchParams(params);
  const activeShelf = parseLibraryShelf(params.shelf);
  const { hiddenGemOrder, hotOrder, memberPickOrder } = await getLibraryShelfOrders(activeShelf);

  const payload = await buildLibraryBrowsePayload({
    searchParams: urlParams,
    tCommon,
    tFilters,
    tRecordings,
    memberPickOrder,
    hotOrder,
    hiddenGemOrder,
  });

  return (
    <main className="gradient-bg min-h-screen pt-24">
      <BrowseCatalog initialPayload={payload} />
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("library");
}
