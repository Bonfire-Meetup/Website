import { NextResponse } from "next/server";

import {
  RATE_LIMITS,
  withAuth,
  withRequestContext,
  withUserRateLimit,
} from "@/lib/api/route-wrappers";
import { getPasskeysByUserId } from "@/lib/data/passkey";
import { logError } from "@/lib/utils/log";

/** Lists the passkeys registered on your account. */
export const GET = withRequestContext(
  withAuth("passkey.list")(
    withUserRateLimit(
      "account-read",
      RATE_LIMITS.ACCOUNT_READ,
    )(async (_request: Request, { auth }) => {
      const { userId } = auth;

      try {
        const passkeys = await getPasskeysByUserId(userId);

        return NextResponse.json({
          items: passkeys.map((passkey) => ({
            id: passkey.id,
            name: passkey.name,
            deviceType: passkey.deviceType,
            backedUp: passkey.backedUp,
            createdAt: passkey.createdAt,
            lastUsedAt: passkey.lastUsedAt,
          })),
        });
      } catch (error) {
        logError("passkey.list.error", error, { userId });
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
      }
    }),
  ),
);
