import { NextResponse } from "next/server";
import { z } from "zod";
import { updateAuthUserCommunityEmails } from "@/lib/data/auth";
import { runWithRequestContext } from "@/lib/utils/request-context";
import { logWarn, logError } from "@/lib/utils/log";
import { requireAuth } from "@/lib/api/auth";

const preferencesSchema = z.object({
  allowCommunityEmails: z.boolean(),
});

export const PATCH = async (request: Request) =>
  runWithRequestContext(request, async () => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

    const auth = await requireAuth(request, "account.preferences");
    if (!auth.success) {
      return auth.response;
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch (error) {
      logError("account.preferences.parse_failed", error);
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    const result = preferencesSchema.safeParse(payload);
    if (!result.success) {
      logWarn("account.preferences.invalid_schema", { errors: result.error.issues });
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    try {
      await updateAuthUserCommunityEmails({
        userId: auth.userId,
        allowCommunityEmails: result.data.allowCommunityEmails,
      });
      return respond({ ok: true });
    } catch (error) {
      logError("account.preferences.update_failed", error, { userId: auth.userId });
      return respond({ error: "update_failed" }, { status: 500 });
    }
  });
