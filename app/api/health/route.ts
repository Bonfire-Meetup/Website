import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/data/db";

export async function GET() {
  const timestamp = new Date().toISOString();
  const version = process.env.NEXT_PUBLIC_BNF_VERSION || "unknown";

  try {
    await db().select({ one: sql`1` });

    return NextResponse.json({
      status: "ok",
      timestamp,
      version,
      database: "connected",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp,
        version,
        database: "disconnected",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
