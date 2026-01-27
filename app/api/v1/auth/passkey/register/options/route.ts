import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getClientHashes, isRateLimited } from "@/lib/api/rate-limit";
import { createRegistrationOptions, getChallengeTtlMs } from "@/lib/auth/webauthn";
import { getAuthUserById } from "@/lib/data/auth";
import { getPasskeysByUserId, insertPasskeyChallenge } from "@/lib/data/passkey";
import { logError, logInfo, logWarn } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

const RATE_LIMIT_STORE = "passkey.register.options";
const MAX_REQUESTS_PER_MINUTE = 10;

export const POST = async (request: Request) =>
  runWithRequestContext(request, async () => {
    const authResult = await requireAuth(request, "passkey.register.options");

    if (!authResult.success) {
      return authResult.response;
    }

    const { userId } = authResult;

    const { ipHash } = await getClientHashes();

    if (isRateLimited(RATE_LIMIT_STORE, `${userId}:${ipHash}`, MAX_REQUESTS_PER_MINUTE)) {
      logWarn("passkey.register.options.rate_limited", {
        ipHash,
        maxHits: MAX_REQUESTS_PER_MINUTE,
        storeKey: RATE_LIMIT_STORE,
        userId,
      });

      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

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
  });
