import { NextResponse } from "next/server";
import { z } from "zod";

import { createEmailChallenge } from "@/lib/auth/challenge-request";
import { getAuthFrom, sendEmail } from "@/lib/email/email";
import { renderEmailCodeTemplate } from "@/lib/email/email-templates";
import { verifyTurnstileToken } from "@/lib/forms/turnstile";
import { getRequestLocale } from "@/lib/utils/locale";
import { logWarn } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

const challengeSchema = z.object({
  email: z.string().email(),
  turnstileToken: z.string().min(1),
  type: z.literal("email"),
});

const challengeTtlMs = 10 * 60_000;
const maxAttempts = 5;
const rateLimitWindowMs = 15 * 60_000;
const maxEmailChallenges = 3;
const maxIpChallenges = 10;
const rateLimitStore = new Map<string, number[]>();

export const POST = async (request: Request) =>
  runWithRequestContext(request, async () => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      logWarn("auth.challenge.invalid_request");

      return respond({ ok: true });
    }

    const result = challengeSchema.safeParse(payload);

    if (!result.success) {
      logWarn("auth.challenge.invalid_request");

      return respond({ error: "invalid_request" }, { status: 400 });
    }

    const { turnstileToken } = result.data;

    const isTurnstileValid = await verifyTurnstileToken(turnstileToken);

    if (!isTurnstileValid) {
      logWarn("auth.challenge.captcha_failed");

      return respond({ error: "captcha_failed" }, { status: 400 });
    }

    const locale = getRequestLocale(request.headers);
    const minutes = Math.round(challengeTtlMs / 60_000);
    const resultChallenge = await createEmailChallenge({
      allowSilentFailure: true,
      email: result.data.email,
      logPrefix: "auth.challenge",
      maxAttempts,
      maxEmailChallenges,
      maxIpChallenges,
      rateLimitStore,
      rateLimitWindowMs,
      request,
      sendEmail: async (normalizedEmail, code) => {
        const emailTemplate = await renderEmailCodeTemplate({ code, locale, minutes });
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
      return respond({ ok: true });
    }

    return respond({ challenge_token: resultChallenge.challenge_token, ok: true });
  });
