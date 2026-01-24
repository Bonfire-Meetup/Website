import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  hashRefreshToken,
  isValidRefreshTokenFormat,
  REFRESH_TOKEN_COOKIE_NAME,
  verifyAccessToken,
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

    // Parse request body (optional)
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
      // Empty body is fine - just revoke current token
    }

    // Get refresh token from cookie
    const cookieStore = await cookies();
    const refreshTokenFromCookie = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

    // If revoking all sessions, we need to verify the access token
    if (revokeAll) {
      const authHeader = headers.get("authorization");

      if (!authHeader?.startsWith("Bearer ")) {
        logWarn("auth.revoke.unauthorized", {
          ...clientFingerprint,
          reason: "missing_auth_header",
          requestId,
        });

        return respond({ error: "unauthorized" }, { status: 401 });
      }

      const accessToken = authHeader.slice("Bearer ".length).trim();

      try {
        const payload = await verifyAccessToken(accessToken);
        const userId = payload.sub;

        if (!userId) {
          return respond({ error: "unauthorized" }, { status: 401 });
        }

        // Revoke all refresh tokens for this user
        await revokeAllUserRefreshTokens(userId);

        logInfo("auth.revoke.all_sessions", {
          ...clientFingerprint,
          userId,
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
      } catch {
        logWarn("auth.revoke.unauthorized", {
          ...clientFingerprint,
          reason: "invalid_access_token",
          requestId,
        });

        return respond({ error: "unauthorized" }, { status: 401 });
      }
    }

    // Validate token format and hash if present
    const tokenHash =
      refreshTokenFromCookie && isValidRefreshTokenFormat(refreshTokenFromCookie)
        ? hashRefreshToken(refreshTokenFromCookie)
        : null;

    // Revoke current session or token family
    if (tokenHash) {
      const refreshToken = await getRefreshTokenByHash(tokenHash);

      if (refreshToken) {
        if (revokeFamily) {
          // Revoke entire token family (all rotated tokens from this login)
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

        // Just revoke this specific refresh token
        await revokeRefreshToken(tokenHash);

        logInfo("auth.revoke.single", {
          ...clientFingerprint,
          requestId,
        });
      }
    }

    // Always clear the cookie and return success
    // (even if no token was found - user wanted to logout)
    return NextResponse.json(
      { success: true, revoked: "current" },
      {
        headers: {
          "Set-Cookie": clearCookie,
        },
      },
    );
  });
