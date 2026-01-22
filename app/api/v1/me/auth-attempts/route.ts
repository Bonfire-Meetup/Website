import { NextResponse } from "next/server";
import { getAuthAttemptsByEmailHash, getAuthUserById } from "@/app/lib/data/auth";
import { getEmailFingerprint, logError } from "@/app/lib/utils/log";
import { runWithRequestContext } from "@/app/lib/utils/request-context";
import { requireAuth } from "@/app/lib/api/auth";

export async function GET(request: Request) {
  return runWithRequestContext(request, async () => {
    const auth = await requireAuth(request, "account.attempts");
    if (!auth.success) {
      return auth.response;
    }

    try {
      const user = await getAuthUserById(auth.userId);
      if (!user) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      const fingerprint = getEmailFingerprint(user.email);
      if (!fingerprint.emailHash) {
        return NextResponse.json({ items: [] });
      }
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const attempts = await getAuthAttemptsByEmailHash({
        emailHash: fingerprint.emailHash,
        since,
        limit: 50,
      });
      const items = attempts.map((attempt) => ({
        id: attempt.id,
        outcome: attempt.outcome,
        createdAt: attempt.created_at.toISOString(),
      }));
      return NextResponse.json({ items });
    } catch (error) {
      logError("account.attempts.failed", error);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  });
}
