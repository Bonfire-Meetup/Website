import { getTranslations } from "next-intl/server";
import { NextResponse } from "next/server";

import { withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { buildLibraryBrowsePayload, type LibraryApiPayload } from "@/lib/recordings/library-filter";
import { logWarn } from "@/lib/utils/log";
import { getRequestId } from "@/lib/utils/request-context";

const RATE_LIMIT_STORE = "library";
const MAX_REQUESTS_PER_MINUTE = 60;

export const GET = withRequestContext(
  withRateLimit({
    maxHits: MAX_REQUESTS_PER_MINUTE,
    onLimit: ({ ipHash }) => {
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
    },
    storeKey: RATE_LIMIT_STORE,
  })(async (request: Request) => {
    const locale = await getRequestLocale();
    const tCommon = await getTranslations({ locale, namespace: "common" });
    const tFilters = await getTranslations({ locale, namespace: "libraryPage.filters" });
    const tRecordings = await getTranslations({ locale, namespace: "recordings" });
    const { searchParams } = new URL(request.url);
    const apiParams = new URLSearchParams(searchParams);
    apiParams.delete("view");
    const payload = await buildLibraryBrowsePayload({
      searchParams: apiParams,
      tCommon,
      tFilters,
      tRecordings,
    });

    const response: LibraryApiPayload = {
      recordings: payload.recordings,
      filter: {
        activeLocation: payload.activeLocation,
        activeTag: payload.activeTag,
        activeEpisode: payload.activeEpisode,
        searchQuery: payload.searchQuery,
        featuredShortIdOrder: payload.featuredShortIdOrder,
        tagDropdownOptions: payload.tagDropdownOptions,
        episodeDropdownOptions: payload.episodeDropdownOptions,
        episodeDropdownGroups: payload.episodeDropdownGroups,
        locationAvailability: payload.locationAvailability,
      },
    };

    return NextResponse.json(response);
  }),
);
