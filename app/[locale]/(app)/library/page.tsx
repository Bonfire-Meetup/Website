import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RecordingsCatalog } from "@/components/recordings/RecordingsCatalog";
import { buildMetaPageMetadata } from "@/lib/metadata";
import { getHiddenGems } from "@/lib/recordings/hidden-gems";
import { getHotRecordingsSafe } from "@/lib/recordings/hot-picks";
import { buildLibraryRowsPayload } from "@/lib/recordings/library-filter";
import { getMemberPicksSafe } from "@/lib/recordings/member-picks";

export default async function LibraryPage() {
  const tCommon = await getTranslations("common");
  const tFilters = await getTranslations("libraryPage.filters");
  const tRecordings = await getTranslations("recordings");

  const [payload, memberPicks, hotPicks, hiddenGems] = await Promise.all([
    buildLibraryRowsPayload({
      searchParams: new URLSearchParams(),
      tCommon,
      tFilters,
      tRecordings,
    }),
    getMemberPicksSafe(6),
    getHotRecordingsSafe(6),
    getHiddenGems(6),
  ]);

  return (
    <main className="gradient-bg min-h-screen pt-24">
      <RecordingsCatalog
        initialPayload={payload}
        memberPicks={memberPicks}
        hotPicks={hotPicks}
        hiddenGems={hiddenGems}
      />
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("library");
}
