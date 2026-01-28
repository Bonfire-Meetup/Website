import crypto from "crypto";

import { NextResponse, type NextRequest } from "next/server";

import { requireRole } from "@/lib/api/auth";
import { USER_ROLES } from "@/lib/config/roles";
import { getAuthUserById } from "@/lib/data/auth";
import { logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";
import { compressUuid } from "@/lib/utils/uuid-compress";

const TOKEN_VERSION = "v1";
const SECRET = process.env.BNF_CHECKIN_SECRET;

interface CheckInTokenPayload {
  sub: string;
  iat: number;
  exp: number;
  v: string;
}

const base64UrlDecode = (value: string) => {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4;
  if (padding) {
    base64 += "=".repeat(4 - padding);
  }
  return Buffer.from(base64, "base64").toString("utf-8");
};

const verifyToken = (token: string): { valid: boolean; userId?: string; error?: string } => {
  if (!SECRET) {
    return { valid: false, error: "Check-in not configured" };
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format" };
    }

    const [version, encodedPayload, signature] = parts;

    if (version !== TOKEN_VERSION) {
      return { valid: false, error: "Unsupported token version" };
    }

    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(encodedPayload)
      .digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false, error: "Invalid signature" };
    }

    const decodedPayload = JSON.parse(base64UrlDecode(encodedPayload)) as CheckInTokenPayload;

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp < nowSeconds) {
      return { valid: false, error: "Token expired" };
    }

    return {
      valid: true,
      userId: decodedPayload.sub,
    };
  } catch (error) {
    logError("check_in.verify_token_failed", error);
    return { valid: false, error: "Failed to verify token" };
  }
};

export async function POST(request: NextRequest) {
  return runWithRequestContext(request, async () => {
    const auth = await requireRole(request, "check_in.verify", USER_ROLES.CREW);

    if (!auth.success) {
      return auth.response;
    }

    try {
      const body = await request.json();
      const { token } = body;

      if (!token || typeof token !== "string") {
        return NextResponse.json({ error: "Token required" }, { status: 400 });
      }

      const result = verifyToken(token);

      if (!result.valid || !result.userId) {
        return NextResponse.json(result);
      }

      const user = await getAuthUserById(result.userId);
      if (!user) {
        return NextResponse.json({ valid: false, error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        publicId: compressUuid(user.id),
        name: user.name,
        valid: true,
      });
    } catch (error) {
      logError("check_in.verify_request_failed", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
