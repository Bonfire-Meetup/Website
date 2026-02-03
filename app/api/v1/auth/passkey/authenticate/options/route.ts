import { NextResponse } from "next/server";

import { withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import { createAuthenticationOptions, getChallengeTtlMs } from "@/lib/auth/webauthn";
import { insertPasskeyChallenge } from "@/lib/data/passkey";
import { logError, logInfo, logWarn } from "@/lib/utils/log";

const RATE_LIMIT_STORE = "passkey.authenticate.options";
const MAX_REQUESTS_PER_MINUTE = 15;

export const POST = withRequestContext(
  withRateLimit({
    maxHits: MAX_REQUESTS_PER_MINUTE,
    onLimit: ({ ipHash }) => {
      logWarn("passkey.authenticate.options.rate_limited", {
        ipHash,
        maxHits: MAX_REQUESTS_PER_MINUTE,
        storeKey: RATE_LIMIT_STORE,
      });

      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    },
    storeKey: RATE_LIMIT_STORE,
  })(async () => {
    try {
      const options = await createAuthenticationOptions();

      const expiresAt = new Date(Date.now() + getChallengeTtlMs());
      await insertPasskeyChallenge({
        userId: null,
        challenge: options.challenge,
        type: "authentication",
        expiresAt,
      });

      logInfo("passkey.authenticate.options_created");

      return NextResponse.json(options);
    } catch (error) {
      logError("passkey.authenticate.options_failed", error);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
