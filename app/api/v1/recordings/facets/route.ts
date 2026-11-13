import { NextResponse } from "next/server";

import { withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import { parseRecordingQuery, queryCatalogRecordings } from "@/lib/recordings/library-filter";
import { getLibraryShelfOrders } from "@/lib/recordings/library-shelf-orders";

/**
 * Returns the filter values still available for a recordings query: tags, episodes, and which
 * locations have matching talks.
 *
 * Takes the same filters as `GET /api/v1/recordings`. Each facet ignores its own filter, so
 * picking a tag still lists every other tag that would match.
 */
export const GET = withRequestContext(
  withRateLimit({ maxHits: 60, storeKey: "recordings-facets" })(async (request: Request) => {
    const query = parseRecordingQuery(new URL(request.url).searchParams);
    const orders = await getLibraryShelfOrders(query.shelf);
    const { facets } = queryCatalogRecordings(query, orders);

    return NextResponse.json(facets, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
    });
  }),
);
