import { NextResponse } from "next/server";

import { paginate, parsePagination } from "@/lib/api/pagination";
import { withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import { parseRecordingQuery, queryCatalogRecordings } from "@/lib/recordings/library-filter";
import { getLibraryShelfOrders } from "@/lib/recordings/library-shelf-orders";

const PUBLIC_CACHE = "public, s-maxage=30, stale-while-revalidate=120";

/**
 * Lists recorded talks, newest first.
 *
 * Filter with `location` (`prague`, `zlin`), `tag`, `episode`, a free-text `q`, or a `shelf`
 * (`early-access`, `guild-vault`, `member-picks`, `hot`, `hidden-gems`; ranked shelves keep
 * their ranking). Paginate with `limit` (default 50, max 500) and `offset`.
 */
export const GET = withRequestContext(
  withRateLimit({ maxHits: 60, storeKey: "recordings" })(async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const query = parseRecordingQuery(searchParams);
    const orders = await getLibraryShelfOrders(query.shelf);
    const { recordings } = queryCatalogRecordings(query, orders);

    return NextResponse.json(paginate(recordings, parsePagination(searchParams)), {
      headers: { "Cache-Control": PUBLIC_CACHE },
    });
  }),
);
