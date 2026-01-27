import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getAuthAttemptsByEmailHash, getAuthUserById } from "@/lib/data/auth";
import { getEmailFingerprint, logError, logWarn } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

export async function GET(request: Request) {
  return runWithRequestContext(request, async () => {
    const auth = await requireAuth(request, "account.attempts");

    if (!auth.success) {
      return auth.response;
    }

    try {
      const user = await getAuthUserById(auth.userId);

      if (!user) {
        logWarn("account.attempts.user_not_found", { userId: auth.userId });

        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }

      const fingerprint = getEmailFingerprint(user.email);

      if (!fingerprint.emailHash) {
        return NextResponse.json({ items: [] });
      }

      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const attempts = await getAuthAttemptsByEmailHash({
        accountCreatedAt: user.created_at,
        emailHash: fingerprint.emailHash,
        limit: 50,
        since,
        userId: auth.userId,
      });
      const items = attempts.map((attempt) => ({
        createdAt: attempt.created_at.toISOString(),
        id: attempt.id,
        method: attempt.method,
        outcome: attempt.outcome,
      }));

      return NextResponse.json({ items });
    } catch (error) {
      logError("account.attempts.failed", error, { userId: auth.userId });

      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  });
}
