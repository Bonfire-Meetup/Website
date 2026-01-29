import { NextResponse, type NextRequest } from "next/server";

import { cleanupExpiredAuthChallenges, cleanupExpiredRefreshTokens } from "@/lib/data/auth";
import { cleanupExpiredPasskeyChallenges } from "@/lib/data/passkey";
import { logError, logInfo, logWarn } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

const { CRON_SECRET } = process.env;

const isAuthorized = (request: NextRequest) => {
  if (!CRON_SECRET) {
    return { ok: false, status: 500, error: "cron_not_configured" };
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return { ok: false, status: 401, error: "unauthorized" };
  }

  return { ok: true as const };
};

export const GET = async (request: NextRequest) =>
  runWithRequestContext(request, async () => {
    const auth = isAuthorized(request);

    if (!auth.ok) {
      if (auth.status === 500) {
        logError("cron.cleanup.missing_secret", new Error("CRON_SECRET not configured"));
      } else {
        logWarn("cron.cleanup.unauthorized");
      }

      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
      await Promise.all([
        cleanupExpiredPasskeyChallenges(),
        cleanupExpiredAuthChallenges(),
        cleanupExpiredRefreshTokens(),
      ]);

      logInfo("cron.cleanup.completed");
      return NextResponse.json({ ok: true });
    } catch (error) {
      logError("cron.cleanup.failed", error);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  });
