import "server-only";

import { checkBotId } from "botid/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isOriginAllowed } from "@/lib/api/rate-limit";
import { verifyTurnstileToken } from "@/lib/forms/turnstile";
import { logWarn } from "@/lib/utils/log";
import { getRequestId } from "@/lib/utils/request-context";

const CSRF_COOKIE_NAME = "bnf_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

const isCsrfValid = async (request: Request) => {
  const token = request.headers.get(CSRF_HEADER_NAME);
  const cookieValue = (await cookies()).get(CSRF_COOKIE_NAME)?.value;

  return Boolean(token && cookieValue && token === cookieValue);
};

export async function rejectUnverifiedSubmission(
  request: Request,
  formType: string,
  turnstileToken: string,
) {
  const context = { formType, requestId: getRequestId() };

  if (!(await isOriginAllowed())) {
    logWarn("form.invalid_origin", context);
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  if ((await checkBotId()).isBot) {
    logWarn("form.bot_blocked", context);
    return NextResponse.json({ error: "bot_blocked" }, { status: 403 });
  }

  if (!(await isCsrfValid(request))) {
    logWarn("form.csrf_invalid", context);
    return NextResponse.json({ error: "csrf_invalid" }, { status: 403 });
  }

  if (!(await verifyTurnstileToken(turnstileToken))) {
    logWarn("form.captcha_failed", context);
    return NextResponse.json({ error: "captcha_failed" }, { status: 400 });
  }

  return null;
}
