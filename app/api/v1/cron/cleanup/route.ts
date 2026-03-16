import { NextResponse, type NextRequest } from "next/server";

import { cleanupExpiredAuthChallenges, cleanupExpiredRefreshTokens } from "@/lib/data/auth";
import { cleanupExpiredPasskeyChallenges } from "@/lib/data/passkey";
import { logError, logInfo, logWarn } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

const { CRON_SECRET } = process.env;

const cleanupTasks = {
  authChallenges: cleanupExpiredAuthChallenges,
  passkeyChallenges: cleanupExpiredPasskeyChallenges,
  refreshTokens: cleanupExpiredRefreshTokens,
} as const;

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
      const taskEntries = Object.entries(cleanupTasks) as [
        keyof typeof cleanupTasks,
        (typeof cleanupTasks)[keyof typeof cleanupTasks],
      ][];
      const settled = await Promise.allSettled(
        taskEntries.map(async ([key, run]) => [key, await run()] as const),
      );

      const tasks: Record<
        keyof typeof cleanupTasks,
        { ok: boolean; deleted: number; error: string | null }
      > = {
        authChallenges: { ok: false, deleted: 0, error: null },
        passkeyChallenges: { ok: false, deleted: 0, error: null },
        refreshTokens: { ok: false, deleted: 0, error: null },
      };

      for (let index = 0; index < settled.length; index += 1) {
        const [key] = taskEntries[index];
        const result = settled[index];

        if (result?.status === "fulfilled") {
          const [, deleted] = result.value;
          tasks[key] = { ok: true, deleted, error: null };
        } else {
          const reason = result?.reason;
          tasks[key] = {
            ok: false,
            deleted: 0,
            error: reason instanceof Error ? reason.message : "unknown_error",
          };
        }
      }

      const succeeded = Object.values(tasks).filter((task) => task.ok).length;
      const failed = Object.values(tasks).length - succeeded;
      const deleted = Object.values(tasks).reduce((sum, task) => sum + task.deleted, 0);
      const summary = {
        deleted,
        failed,
        succeeded,
        tasks,
      };

      if (failed > 0) {
        logWarn("cron.cleanup.completed_with_errors", summary);
        return NextResponse.json({ error: "partial_failure", ok: false, summary }, { status: 500 });
      }

      logInfo("cron.cleanup.completed", summary);
      return NextResponse.json({ ok: true, summary });
    } catch (error) {
      logError("cron.cleanup.failed", error);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  });
