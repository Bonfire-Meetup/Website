import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { createEmailChallenge } from "@/lib/auth/challenge-request";
import { getAuthUserById } from "@/lib/data/auth";
import { getAuthFrom, sendEmail } from "@/lib/email/email";
import { renderAccountDeleteTemplate } from "@/lib/email/email-templates";
import { getRequestLocale } from "@/lib/utils/locale";
import { runWithRequestContext } from "@/lib/utils/request-context";

const challengeTtlMs = 10 * 60_000;
const maxAttempts = 5;
const rateLimitWindowMs = 15 * 60_000;
const maxEmailChallenges = 2;
const maxIpChallenges = 5;
const rateLimitStore = new Map<string, number[]>();

export const POST = async (request: Request) =>
  runWithRequestContext(request, async () => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

    const auth = await requireAuth(request, "account.delete-challenge");
    if (!auth.success) {
      return auth.response;
    }

    const user = await getAuthUserById(auth.userId);
    if (!user) {
      return respond({ error: "not_found" }, { status: 404 });
    }

    const locale = getRequestLocale(request.headers);
    const minutes = Math.round(challengeTtlMs / 60_000);
    const resultChallenge = await createEmailChallenge({
      email: user.email,
      logPrefix: "account.delete",
      maxAttempts,
      maxEmailChallenges,
      maxIpChallenges,
      rateLimitStore,
      rateLimitWindowMs,
      request,
      sendEmail: async (normalizedEmail, code) => {
        const emailTemplate = await renderAccountDeleteTemplate({ code, locale, minutes });
        await sendEmail({
          from: getAuthFrom(),
          html: emailTemplate.html,
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          to: normalizedEmail,
        });
      },
      ttlMs: challengeTtlMs,
    });
    if (!resultChallenge.ok) {
      if (resultChallenge.reason === "rate_limited") {
        return respond({ error: "rate_limited" }, { status: 429 });
      }
      const error = resultChallenge.reason === "persist_failed" ? "persist_failed" : "email_failed";
      return respond({ error }, { status: 500 });
    }
    return respond({ challenge_token: resultChallenge.challenge_token, ok: true });
  });
