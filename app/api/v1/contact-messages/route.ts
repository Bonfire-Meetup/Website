import { NextResponse } from "next/server";

import { rejectUnverifiedSubmission } from "@/lib/api/form-protection";
import { getClientHashes } from "@/lib/api/rate-limit";
import { withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import { insertContactSubmission } from "@/lib/data/forms";
import { contactMessageCreateSchema, toFieldErrors } from "@/lib/forms/schemas";
import { logError, logInfo } from "@/lib/utils/log";

const MAX_MESSAGES_PER_HOUR = 5;

/**
 * Sends a message through the contact form.
 *
 * Requires a Cloudflare Turnstile token and the CSRF token from `GET /api/v1/csrf` in the
 * `X-CSRF-Token` header. Invalid fields come back in `fields`, keyed by field name.
 */
export const POST = withRequestContext(
  withRateLimit({
    maxHits: MAX_MESSAGES_PER_HOUR,
    storeKey: "contact-messages",
    windowSeconds: 3600,
  })(async (request: Request) => {
    const body = (await request.json().catch(() => null)) as { website?: unknown } | null;

    if (body?.website) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const parsed = contactMessageCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_request", fields: toFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const { turnstileToken, website: _website, ...message } = parsed.data;
    const rejected = await rejectUnverifiedSubmission(request, "contact", turnstileToken);

    if (rejected) {
      return rejected;
    }

    const { ipHash } = await getClientHashes();

    try {
      await insertContactSubmission({
        ...message,
        email: message.email.toLowerCase(),
        ipHash,
      });
      logInfo("form.contact_submitted", { inquiryType: message.inquiryType, ipHash });

      return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
      logError("form.contact_failed", error, { ipHash });

      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
