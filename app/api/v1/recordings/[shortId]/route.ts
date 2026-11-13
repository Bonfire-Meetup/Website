import { NextResponse } from "next/server";

import { getCatalogRecordings } from "@/lib/recordings/library-filter";

interface RouteParams {
  params: Promise<{ shortId: string }>;
}

/** Returns one recorded talk by its short ID. */
export async function GET(_request: Request, { params }: RouteParams) {
  const { shortId } = await params;
  const recording = getCatalogRecordings().find((item) => item.shortId === shortId);

  if (!recording) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(recording, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
