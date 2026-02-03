import { NextResponse } from "next/server";

import { withAuth, withRequestContext } from "@/lib/api/route-wrappers";
import { getAuthAttemptsByEmailHash, getAuthUserById } from "@/lib/data/auth";
import { getEmailFingerprint, logError, logWarn } from "@/lib/utils/log";

export const GET = withRequestContext(
  withAuth("account.attempts")(async (_request: Request, { auth }) => {
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

      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const attempts = await getAuthAttemptsByEmailHash({
        accountCreatedAt: user.createdAt,
        emailHash: fingerprint.emailHash,
        limit: 20,
        since,
        userId: auth.userId,
      });
      const items = attempts.map((attempt) => ({
        createdAt: attempt.createdAt,
        id: attempt.id,
        method: attempt.method,
        outcome: attempt.outcome,
        userAgentSummary: attempt.userAgentSummary,
      }));

      return NextResponse.json({ items });
    } catch (error) {
      logError("account.attempts.failed", error, { userId: auth.userId });

      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
