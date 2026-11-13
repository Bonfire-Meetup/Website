import crypto from "crypto";

import { NextResponse } from "next/server";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { checkInVerifySchema } from "@/lib/api/schemas";
import { USER_ROLES } from "@/lib/config/roles";
import { getAuthUserById } from "@/lib/data/auth";
import { logError } from "@/lib/utils/log";
import { compressUuid } from "@/lib/utils/uuid-compress";

const TOKEN_VERSION = "v1";
const SECRET = process.env.BNF_CHECKIN_SECRET;

interface CheckInTokenPayload {
  sub: string;
  iat: number;
  exp: number;
  v: string;
}

interface VerifyTokenResult {
  valid: boolean;
  expired?: boolean;
  userId?: string;
  error?: string;
}

const base64UrlDecode = (value: string) => {
  let base64 = value.replace(/-/gu, "+").replace(/_/gu, "/");
  const padding = base64.length % 4;
  if (padding) {
    base64 += "=".repeat(4 - padding);
  }
  return Buffer.from(base64, "base64").toString("utf-8");
};

const verifyToken = (token: string): VerifyTokenResult => {
  if (!SECRET) {
    return { valid: false, error: "check_in_not_configured" };
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "invalid_token_format" };
    }

    const [version, encodedPayload, signature] = parts;

    if (version !== TOKEN_VERSION) {
      return { valid: false, error: "unsupported_token_version" };
    }

    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(encodedPayload)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return { valid: false, error: "invalid_signature" };
    }

    const decodedPayload = JSON.parse(base64UrlDecode(encodedPayload)) as CheckInTokenPayload;

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp < nowSeconds) {
      return { expired: true, userId: decodedPayload.sub, valid: false, error: "token_expired" };
    }

    return {
      valid: true,
      userId: decodedPayload.sub,
    };
  } catch (error) {
    logError("check_in.verify_token_failed", error);
    return { valid: false, error: "verification_failed" };
  }
};

/**
 * Verifies a scanned check-in QR token and returns who it belongs to.
 *
 * Expired tickets still return the holder, with `expired: true`.
 */
export const POST = withRequestContext(
  withRole(
    "check_in.verify",
    USER_ROLES.CREW,
  )(async (request: Request) => {
    const parsed = checkInVerifySchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    try {
      const result = verifyToken(parsed.data.token);

      if (!result.valid || !result.userId) {
        if (result.expired && result.userId) {
          const user = await getAuthUserById(result.userId);
          if (!user) {
            return NextResponse.json({ valid: false, error: "user_not_found" }, { status: 404 });
          }

          return NextResponse.json({
            email: user.email,
            expired: true,
            name: user.name,
            publicId: compressUuid(user.id),
            valid: false,
          });
        }

        return NextResponse.json({ error: result.error, valid: false }, { status: 422 });
      }

      const user = await getAuthUserById(result.userId);
      if (!user) {
        return NextResponse.json({ valid: false, error: "user_not_found" }, { status: 404 });
      }

      return NextResponse.json({
        email: user.email,
        name: user.name,
        publicId: compressUuid(user.id),
        valid: true,
      });
    } catch (error) {
      logError("check_in.verify_request_failed", error);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
