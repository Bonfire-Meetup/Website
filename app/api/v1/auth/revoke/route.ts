import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthUserId } from "@/lib/api/auth";
import {
  hashRefreshToken,
  isValidRefreshTokenFormat,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth/jwt";
import {
  getRefreshTokenByHash,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
  revokeRefreshTokenFamily,
} from "@/lib/data/auth";
import { getClientFingerprint, logInfo, logWarn } from "@/lib/utils/log";
import { getRequestId, runWithRequestContext } from "@/lib/utils/request-context";

const revokeSchema = z.object({
  revoke_all: z.boolean().optional().default(false),
  revoke_family: z.boolean().optional().default(false),
});

export const POST = async (request: Request) =>
  runWithRequestContext(request, async () => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

    const clearCookie = `${REFRESH_TOKEN_COOKIE_NAME}=; HttpOnly; Secure; SameSite=strict; Path=/api/v1/auth; Max-Age=0`;

    const { headers } = request;
    const ip =
      headers.get("x-real-ip") || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = headers.get("user-agent");
    const clientFingerprint = getClientFingerprint({ ip, userAgent });
    const requestId = getRequestId();

    let revokeAll = false;
    let revokeFamily = false;

    try {
      const body = await request.json();
      const parsed = revokeSchema.safeParse(body);

      if (parsed.success) {
        revokeAll = parsed.data.revoke_all;
        revokeFamily = parsed.data.revoke_family;
      }
    } catch {
      // Ignore errors during revocation
    }

    const cookieStore = await cookies();
    const refreshTokenFromCookie = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

    if (revokeAll) {
      const auth = await getAuthUserId(request);

      if (auth.status !== "valid" || !auth.userId) {
        logWarn("auth.revoke.unauthorized", {
          ...clientFingerprint,
          reason: auth.status === "none" ? "missing_auth_header" : "invalid_token",
          requestId,
        });

        return respond({ error: "unauthorized" }, { status: 401 });
      }

      await revokeAllUserRefreshTokens(auth.userId);

      logInfo("auth.revoke.all_sessions", {
        ...clientFingerprint,
        userId: auth.userId,
        requestId,
      });

      return NextResponse.json(
        { success: true, revoked: "all" },
        {
          headers: {
            "Set-Cookie": clearCookie,
          },
        },
      );
    }

    const tokenHash =
      refreshTokenFromCookie && isValidRefreshTokenFormat(refreshTokenFromCookie)
        ? hashRefreshToken(refreshTokenFromCookie)
        : null;

    if (tokenHash) {
      const refreshToken = await getRefreshTokenByHash(tokenHash);

      if (refreshToken) {
        if (revokeFamily) {
          await revokeRefreshTokenFamily(refreshToken.token_family_id);

          logInfo("auth.revoke.family", {
            ...clientFingerprint,
            tokenFamilyId: refreshToken.token_family_id,
            requestId,
          });

          return NextResponse.json(
            { success: true, revoked: "family" },
            {
              headers: {
                "Set-Cookie": clearCookie,
              },
            },
          );
        }

        await revokeRefreshToken(tokenHash);

        logInfo("auth.revoke.single", {
          ...clientFingerprint,
          requestId,
        });
      }
    }

    return NextResponse.json(
      { success: true, revoked: "current" },
      {
        headers: {
          "Set-Cookie": clearCookie,
        },
      },
    );
  });
