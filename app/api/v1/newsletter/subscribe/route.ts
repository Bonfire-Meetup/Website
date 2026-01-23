import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";

import { getClientHashes, isOriginAllowed, isRateLimited } from "@/lib/api/rate-limit";
import {
  newsletterSubscribeRequestSchema,
  newsletterSubscribeResponseSchema,
} from "@/lib/api/schemas";
import { subscribeToNewsletter } from "@/lib/data/newsletter";
import { logError, logWarn } from "@/lib/utils/log";
import { getRequestId, runWithRequestContext } from "@/lib/utils/request-context";

const RATE_LIMIT_STORE = "newsletter";
const MAX_REQUESTS_PER_MINUTE = 3;

export async function POST(request: Request) {
  return runWithRequestContext(request, async () => {
    const originAllowed = await isOriginAllowed();

    if (!originAllowed) {
      logWarn("newsletter.invalid_origin", { requestId: getRequestId() });

      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const verification = await checkBotId();

    if (verification.isBot) {
      logWarn("newsletter.bot_blocked", { requestId: getRequestId() });

      return NextResponse.json({ error: "Bot traffic blocked" }, { status: 403 });
    }

    const { ipHash, uaHash } = await getClientHashes();

    if (isRateLimited(RATE_LIMIT_STORE, ipHash, MAX_REQUESTS_PER_MINUTE)) {
      logWarn("newsletter.rate_limited", {
        ipHash,
        maxHits: MAX_REQUESTS_PER_MINUTE,
        requestId: getRequestId(),
        storeKey: RATE_LIMIT_STORE,
      });

      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    try {
      const body = await request.json();
      const { email } = newsletterSubscribeRequestSchema.parse(body);

      const result = await subscribeToNewsletter(email, ipHash, uaHash);
      const validated = newsletterSubscribeResponseSchema.parse({ subscribed: result.subscribed });

      return NextResponse.json(validated);
    } catch (error) {
      if (error && typeof error === "object" && "issues" in error) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }

      logError("newsletter.subscribe_failed", error);

      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }
  });
}
