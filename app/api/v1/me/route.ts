import { NextResponse } from "next/server";
import { getAuthUserById } from "@/app/lib/data/auth";
import { runWithRequestContext } from "@/app/lib/utils/request-context";
import { logError } from "@/app/lib/utils/log";
import { requireAuth } from "@/app/lib/api/auth";

export const GET = async (request: Request) =>
  runWithRequestContext(request, async () => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

    const auth = await requireAuth(request, "account.me");
    if (!auth.success) {
      return auth.response;
    }

    try {
      const user = await getAuthUserById(auth.userId);
      if (!user) {
        return respond({ error: "not_found" }, { status: 404 });
      }
      return respond({
        id: user.id,
        email: user.email,
        createdAt: user.created_at.toISOString(),
        lastLoginAt: user.last_login_at ? user.last_login_at.toISOString() : null,
        allowCommunityEmails: user.allow_community_emails,
      });
    } catch (error) {
      logError("account.me.failed", error);
      return respond({ error: "internal_error" }, { status: 500 });
    }
  });
