import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail, getAuthFrom } from "@/lib/email/email";
import { renderEmailCodeTemplate } from "@/lib/email/email-templates";
import { logWarn } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";
import { getRequestLocale } from "@/lib/utils/locale";
import { verifyTurnstileToken } from "@/lib/forms/turnstile";
import { createEmailChallenge } from "@/lib/auth/challenge-request";

const challengeSchema = z.object({
  email: z.string().email(),
  type: z.literal("email"),
  turnstileToken: z.string().min(1),
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

    const turnstileToken = result.data.turnstileToken;

    const isTurnstileValid = await verifyTurnstileToken(turnstileToken);
    if (!isTurnstileValid) {
      logWarn("auth.challenge.captcha_failed");
      return respond({ error: "captcha_failed" }, { status: 400 });
    }

    const locale = getRequestLocale(request.headers);
    const minutes = Math.round(challengeTtlMs / 60_000);
    const resultChallenge = await createEmailChallenge({
      email: result.data.email,
      request,
      maxAttempts,
      maxEmailChallenges,
      maxIpChallenges,
      rateLimitWindowMs,
      ttlMs: challengeTtlMs,
      rateLimitStore,
      logPrefix: "auth.challenge",
      allowSilentFailure: true,
      sendEmail: async (normalizedEmail, code) => {
        const emailTemplate = await renderEmailCodeTemplate({ locale, code, minutes });
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
      return respond({ ok: true });
    }
    return respond({ ok: true, challenge_token: resultChallenge.challenge_token });
  });
