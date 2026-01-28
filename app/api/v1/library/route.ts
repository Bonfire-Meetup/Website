import { getTranslations } from "next-intl/server";
import { NextResponse } from "next/server";

import { getClientHashes, isRateLimited } from "@/lib/api/rate-limit";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { buildLibraryPayload, type LibraryApiPayload } from "@/lib/recordings/library-filter";
import { logWarn } from "@/lib/utils/log";
import { getRequestId, runWithRequestContext } from "@/lib/utils/request-context";

const RATE_LIMIT_STORE = "library";
const MAX_REQUESTS_PER_MINUTE = 60;

export async function GET(request: Request) {
  return runWithRequestContext(request, async () => {
    const { ipHash } = await getClientHashes();

    if (isRateLimited(RATE_LIMIT_STORE, ipHash, MAX_REQUESTS_PER_MINUTE)) {
      logWarn("library.rate_limited", {
        ipHash,
        maxHits: MAX_REQUESTS_PER_MINUTE,
        requestId: getRequestId(),
        storeKey: RATE_LIMIT_STORE,
      });

      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": MAX_REQUESTS_PER_MINUTE.toString(),
          },
        },
      );
    }

    const locale = await getRequestLocale();
    const tCommon = await getTranslations({ locale, namespace: "common" });
    const tFilters = await getTranslations({ locale, namespace: "libraryPage.filters" });
    const tRecordings = await getTranslations({ locale, namespace: "recordings" });
    const { searchParams } = new URL(request.url);
    const apiParams = new URLSearchParams(searchParams);
    apiParams.delete("view");
    const payload = buildLibraryPayload({
      searchParams: apiParams,
      tCommon,
      tFilters,
      tRecordings,
      includeRows: false,
    });

    const response: LibraryApiPayload = {
      recordings: payload.recordings,
      filter: {
        activeLocation: payload.activeLocation,
        activeTag: payload.activeTag,
        activeEpisode: payload.activeEpisode,
        searchQuery: payload.searchQuery,
        tagDropdownOptions: payload.tagDropdownOptions,
        episodeDropdownOptions: payload.episodeDropdownOptions,
        episodeDropdownGroups: payload.episodeDropdownGroups,
        locationAvailability: payload.locationAvailability,
      },
    };

    return NextResponse.json(response);
  });
}
