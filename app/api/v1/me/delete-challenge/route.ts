import { NextResponse } from "next/server";
import { getAuthUserById } from "@/app/lib/data/auth";
import { renderAccountDeleteTemplate } from "@/app/lib/email/email-templates";
import { sendEmail, getAuthFrom } from "@/app/lib/email/email";
import { runWithRequestContext } from "@/app/lib/utils/request-context";
import { getRequestLocale } from "@/app/lib/utils/locale";
import { createEmailChallenge } from "@/app/lib/auth/challenge-request";
import { requireAuth } from "@/app/lib/api/auth";

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
      request,
      maxAttempts,
      maxEmailChallenges,
      maxIpChallenges,
      rateLimitWindowMs,
      ttlMs: challengeTtlMs,
      rateLimitStore,
      logPrefix: "account.delete",
      sendEmail: async (normalizedEmail, code) => {
        const emailTemplate = await renderAccountDeleteTemplate({ locale, code, minutes });
        await sendEmail({
          to: normalizedEmail,
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          html: emailTemplate.html,
          from: getAuthFrom(),
        });
      },
    });
    if (!resultChallenge.ok) {
      if (resultChallenge.reason === "rate_limited") {
        return respond({ error: "rate_limited" }, { status: 429 });
      }
      const error = resultChallenge.reason === "persist_failed" ? "persist_failed" : "email_failed";
      return respond({ error }, { status: 500 });
    }
    return respond({ ok: true, challenge_token: resultChallenge.challenge_token });
  });
