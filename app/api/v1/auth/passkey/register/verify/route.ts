import { NextResponse } from "next/server";
import { z } from "zod";

import {
  type AuthContext,
  withAuth,
  withRateLimit,
  withRequestContext,
} from "@/lib/api/route-wrappers";
import { encodePublicKey, formatDeviceType, verifyRegistration } from "@/lib/auth/webauthn";
import { getPasskeyChallenge, insertPasskey, markPasskeyChallengeUsed } from "@/lib/data/passkey";
import { logError, logInfo, logWarn } from "@/lib/utils/log";

const RATE_LIMIT_STORE = "passkey.register.verify";
const MAX_REQUESTS_PER_MINUTE = 10;

const requestSchema = z.object({
  response: z.object({
    id: z.string(),
    rawId: z.string(),
    response: z.object({
      clientDataJSON: z.string(),
      attestationObject: z.string(),
      transports: z.array(z.string()).optional(),
      publicKeyAlgorithm: z.number().optional(),
      publicKey: z.string().optional(),
      authenticatorData: z.string().optional(),
    }),
    authenticatorAttachment: z.enum(["platform", "cross-platform"]).optional(),
    clientExtensionResults: z.record(z.string(), z.unknown()),
    type: z.literal("public-key"),
  }),
  challenge: z.string(),
  name: z.string().max(100).optional(),
});

export const POST = withRequestContext(
  withAuth("passkey.register.verify")(
    withRateLimit<AuthContext>({
      maxHits: MAX_REQUESTS_PER_MINUTE,
      keyFn: ({ ctx, ipHash }) => `${ctx.auth.userId}:${ipHash}`,
      onLimit: ({ ctx, ipHash }) => {
        logWarn("passkey.register.verify.rate_limited", {
          ipHash,
          maxHits: MAX_REQUESTS_PER_MINUTE,
          storeKey: RATE_LIMIT_STORE,
          userId: ctx.auth.userId,
        });

        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      },
      storeKey: RATE_LIMIT_STORE,
    })(async (request: Request, { auth }) => {
      const { userId } = auth;

      let payload: unknown;

      try {
        payload = await request.json();
      } catch {
        return NextResponse.json({ error: "invalid_request" }, { status: 400 });
      }

      const result = requestSchema.safeParse(payload);

      if (!result.success) {
        logWarn("passkey.register.invalid_request", { userId, errors: result.error.flatten() });
        return NextResponse.json({ error: "invalid_request" }, { status: 400 });
      }

      const { response, challenge, name } = result.data;

      try {
        const storedChallenge = await getPasskeyChallenge(challenge, "registration");

        if (!storedChallenge) {
          logWarn("passkey.register.challenge_not_found", { userId });
          return NextResponse.json({ error: "challenge_expired" }, { status: 400 });
        }

        if (storedChallenge.userId !== userId) {
          logWarn("passkey.register.challenge_user_mismatch", { userId });
          return NextResponse.json({ error: "invalid_challenge" }, { status: 400 });
        }

        const verification = await verifyRegistration({
          response: response as Parameters<typeof verifyRegistration>[0]["response"],
          expectedChallenge: challenge,
        });

        if (!verification.verified || !verification.registrationInfo) {
          logWarn("passkey.register.verification_failed", { userId });
          return NextResponse.json({ error: "verification_failed" }, { status: 400 });
        }

        const { credential, credentialDeviceType, credentialBackedUp } =
          verification.registrationInfo;

        await markPasskeyChallengeUsed(storedChallenge.id);

        const passkeyId = await insertPasskey({
          userId,
          credentialId: credential.id,
          publicKey: encodePublicKey(credential.publicKey),
          counter: credential.counter,
          deviceType: formatDeviceType(credentialDeviceType),
          backedUp: credentialBackedUp,
          transports: credential.transports,
          name: name ?? null,
        });

        logInfo("passkey.register.success", { userId, passkeyId });

        return NextResponse.json({
          ok: true,
          passkey: {
            id: passkeyId,
            name: name ?? null,
            createdAt: new Date().toISOString(),
          },
        });
      } catch (error) {
        logError("passkey.register.error", error, { userId });
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
      }
    }),
  ),
);
