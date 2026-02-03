import { NextResponse } from "next/server";

import {
  type AuthContext,
  withAuth,
  withRateLimit,
  withRequestContext,
} from "@/lib/api/route-wrappers";
import { createRegistrationOptions, getChallengeTtlMs } from "@/lib/auth/webauthn";
import { getAuthUserById } from "@/lib/data/auth";
import { getPasskeysByUserId, insertPasskeyChallenge } from "@/lib/data/passkey";
import { logError, logInfo, logWarn } from "@/lib/utils/log";

const RATE_LIMIT_STORE = "passkey.register.options";
const MAX_REQUESTS_PER_MINUTE = 10;

export const POST = withRequestContext(
  withAuth("passkey.register.options")(
    withRateLimit<AuthContext>({
      maxHits: MAX_REQUESTS_PER_MINUTE,
      keyFn: ({ ctx, ipHash }) => `${ctx.auth.userId}:${ipHash}`,
      onLimit: ({ ctx, ipHash }) => {
        logWarn("passkey.register.options.rate_limited", {
          ipHash,
          maxHits: MAX_REQUESTS_PER_MINUTE,
          storeKey: RATE_LIMIT_STORE,
          userId: ctx.auth.userId,
        });

        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      },
      storeKey: RATE_LIMIT_STORE,
    })(async (_request: Request, { auth }) => {
      const { userId } = auth;

      try {
        const user = await getAuthUserById(userId);

        if (!user) {
          return NextResponse.json({ error: "user_not_found" }, { status: 404 });
        }

        const existingPasskeys = await getPasskeysByUserId(userId);
        const options = await createRegistrationOptions({
          userId,
          userEmail: user.email,
          userName: user.name,
          existingPasskeys,
        });

        const expiresAt = new Date(Date.now() + getChallengeTtlMs());
        await insertPasskeyChallenge({
          userId,
          challenge: options.challenge,
          type: "registration",
          expiresAt,
        });

        logInfo("passkey.register.options_created", { userId });

        return NextResponse.json(options);
      } catch (error) {
        logError("passkey.register.options_failed", error, { userId });
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
      }
    }),
  ),
);
