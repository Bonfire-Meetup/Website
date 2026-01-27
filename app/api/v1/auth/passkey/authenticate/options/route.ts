import { NextResponse } from "next/server";

import { getClientHashes, isRateLimited } from "@/lib/api/rate-limit";
import { createAuthenticationOptions, getChallengeTtlMs } from "@/lib/auth/webauthn";
import { insertPasskeyChallenge, maybeCleanupExpiredPasskeyChallenges } from "@/lib/data/passkey";
import { logError, logInfo, logWarn } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

const RATE_LIMIT_STORE = "passkey.authenticate.options";
const MAX_REQUESTS_PER_MINUTE = 15;

export const POST = async (request: Request) =>
  runWithRequestContext(request, async () => {
    try {
      const { ipHash } = await getClientHashes();

      if (isRateLimited(RATE_LIMIT_STORE, ipHash, MAX_REQUESTS_PER_MINUTE)) {
        logWarn("passkey.authenticate.options.rate_limited", {
          ipHash,
          maxHits: MAX_REQUESTS_PER_MINUTE,
          storeKey: RATE_LIMIT_STORE,
        });

        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      }

      const options = await createAuthenticationOptions();

      const expiresAt = new Date(Date.now() + getChallengeTtlMs());
      await insertPasskeyChallenge({
        userId: null,
        challenge: options.challenge,
        type: "authentication",
        expiresAt,
      });

      maybeCleanupExpiredPasskeyChallenges();

      logInfo("passkey.authenticate.options_created");

      return NextResponse.json(options);
    } catch (error) {
      logError("passkey.authenticate.options_failed", error);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  });
