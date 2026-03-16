import crypto from "crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import { issueAuthTokens } from "@/lib/auth/issue-auth-tokens";
import { verifyAuthentication } from "@/lib/auth/webauthn";
import { getAuthUserById, insertAuthAttempt, touchAuthUserLastLoginAt } from "@/lib/data/auth";
import {
  getPasskeyByCredentialId,
  getPasskeyChallenge,
  markPasskeyChallengeUsed,
  updatePasskeyCounter,
} from "@/lib/data/passkey";
import {
  getClientFingerprint,
  getEmailFingerprint,
  logError,
  logInfo,
  logWarn,
} from "@/lib/utils/log";
import { getRequestId } from "@/lib/utils/request-context";
import { getUserAgentSummary } from "@/lib/utils/user-agent";

const RATE_LIMIT_STORE = "passkey.authenticate.verify";
const MAX_REQUESTS_PER_MINUTE = 10;

const requestSchema = z.object({
  response: z.object({
    id: z.string(),
    rawId: z.string(),
    response: z.object({
      clientDataJSON: z.string(),
      authenticatorData: z.string(),
      signature: z.string(),
      userHandle: z.string().optional(),
    }),
    authenticatorAttachment: z.enum(["platform", "cross-platform"]).optional(),
    clientExtensionResults: z.record(z.string(), z.unknown()),
    type: z.literal("public-key"),
  }),
  challenge: z.string(),
});

const getClientIp = (headers: Headers): string | null => {
  const forwarded = headers.get("x-forwarded-for");
  const ip = headers.get("x-real-ip") || forwarded?.split(",")[0]?.trim() || null;

  return ip === "0.0.0.0" ? null : ip;
};

export const POST = withRequestContext(
  withRateLimit({
    maxHits: MAX_REQUESTS_PER_MINUTE,
    onLimit: ({ ipHash }) => {
      logWarn("passkey.authenticate.verify.rate_limited", {
        ipHash,
        maxHits: MAX_REQUESTS_PER_MINUTE,
        requestId: getRequestId(),
        storeKey: RATE_LIMIT_STORE,
      });

      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    },
    storeKey: RATE_LIMIT_STORE,
  })(async (request: Request) => {
    const { headers } = request;
    const ip = getClientIp(headers);
    const userAgent = headers.get("user-agent");
    const clientFingerprint = getClientFingerprint({ ip, userAgent });
    const userAgentSummary = getUserAgentSummary(userAgent);

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const result = requestSchema.safeParse(payload);

    if (!result.success) {
      logWarn("passkey.authenticate.invalid_request", { errors: result.error.flatten() });
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const { response, challenge } = result.data;

    try {
      const storedChallenge = await getPasskeyChallenge(challenge, "authentication");

      if (!storedChallenge) {
        logWarn("passkey.authenticate.challenge_not_found", clientFingerprint);
        return NextResponse.json({ error: "challenge_expired" }, { status: 400 });
      }

      const passkey = await getPasskeyByCredentialId(response.id);

      if (!passkey) {
        logWarn("passkey.authenticate.passkey_not_found", {
          ...clientFingerprint,
        });
        return NextResponse.json({ error: "verification_failed" }, { status: 400 });
      }

      const user = await getAuthUserById(passkey.userId);

      if (!user) {
        logWarn("passkey.authenticate.user_not_found", {
          ...clientFingerprint,
          passkeyId: passkey.id,
        });
        return NextResponse.json({ error: "verification_failed" }, { status: 400 });
      }

      const verification = await verifyAuthentication({
        response: response as Parameters<typeof verifyAuthentication>[0]["response"],
        expectedChallenge: challenge,
        passkey,
      });

      if (!verification.verified) {
        logWarn("passkey.authenticate.verification_failed", {
          ...clientFingerprint,
          userId: passkey.userId,
        });
        return NextResponse.json({ error: "verification_failed" }, { status: 400 });
      }

      await markPasskeyChallengeUsed(storedChallenge.id);
      await updatePasskeyCounter(passkey.credentialId, verification.authenticationInfo.newCounter);

      const tokenFamilyId = crypto.randomUUID();
      const { accessToken, accessExpiresIn, accessTokenJti, cookieValue, idToken } =
        await issueAuthTokens({
          ip,
          parentId: null,
          tokenFamilyId,
          userAgent,
          userId: passkey.userId,
        });

      await touchAuthUserLastLoginAt(passkey.userId);
      const emailFingerprint = getEmailFingerprint(user.email);
      const requestId = getRequestId();

      if (emailFingerprint.emailHash) {
        await insertAuthAttempt({
          emailDomain: emailFingerprint.emailDomain,
          emailHash: emailFingerprint.emailHash,
          ipHash: clientFingerprint.ipHash ?? undefined,
          method: "passkey",
          outcome: "success",
          requestId,
          userAgentSummary,
          userAgentHash: clientFingerprint.userAgentHash ?? undefined,
          userId: passkey.userId,
        });
      }

      logInfo("passkey.authenticate.success", {
        ...clientFingerprint,
        userId: passkey.userId,
        passkeyId: passkey.id,
        accessTokenJti,
        tokenFamilyId,
      });

      return NextResponse.json(
        {
          access_token: accessToken,
          expires_in: accessExpiresIn,
          id_token: idToken,
          token_type: "Bearer",
        },
        {
          headers: {
            "Set-Cookie": cookieValue,
            "Cache-Control": "no-store",
            Pragma: "no-cache",
          },
        },
      );
    } catch (error) {
      logError("passkey.authenticate.error", error, clientFingerprint);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
