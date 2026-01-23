import { getLocale } from "next-intl/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/api/auth";
import {
  updateAuthUserCommunityEmails,
  updateAuthUserPublicProfile,
  updateAuthUserName,
} from "@/lib/data/auth";
import { logError, logWarn } from "@/lib/utils/log";
import { containsProfanity } from "@/lib/utils/profanity-filter";
import { runWithRequestContext } from "@/lib/utils/request-context";

const NAME_MAX_LENGTH = 50;

const preferencesSchema = z.object({
  allowCommunityEmails: z.boolean().optional(),
  name: z.string().max(NAME_MAX_LENGTH).nullable().optional(),
  publicProfile: z.boolean().optional(),
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
      const locale = (await getLocale()) as "en" | "cs";

      if (result.data.name !== undefined) {
        const nameValue =
          result.data.name === null || result.data.name.trim() === ""
            ? null
            : result.data.name.trim();

        if (nameValue) {
          if (nameValue.length > NAME_MAX_LENGTH) {
            return respond({ error: "name_too_long" }, { status: 400 });
          }

          if (containsProfanity(nameValue, locale)) {
            logWarn("account.preferences.profanity_detected", {
              locale,
              nameLength: nameValue.length,
              userId: auth.userId,
            });

            return respond({ error: "profanity_detected" }, { status: 400 });
          }
        }
      }

      const updates: Promise<void>[] = [];

      if (result.data.allowCommunityEmails !== undefined) {
        updates.push(
          updateAuthUserCommunityEmails({
            allowCommunityEmails: result.data.allowCommunityEmails,
            userId: auth.userId,
          }),
        );
      }

      if (result.data.publicProfile !== undefined) {
        updates.push(
          updateAuthUserPublicProfile({
            publicProfile: result.data.publicProfile,
            userId: auth.userId,
          }),
        );
      }

      if (result.data.name !== undefined) {
        const nameValue =
          result.data.name === null || result.data.name.trim() === ""
            ? null
            : result.data.name.trim();
        updates.push(
          updateAuthUserName({
            name: nameValue,
            userId: auth.userId,
          }),
        );
      }

      await Promise.all(updates);

      return respond({ ok: true });
    } catch (error) {
      logError("account.preferences.update_failed", error, { userId: auth.userId });

      return respond({ error: "update_failed" }, { status: 500 });
    }
  });
