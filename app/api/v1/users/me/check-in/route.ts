import crypto from "crypto";

import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { isRateLimited } from "@/lib/api/rate-limit";
import { logError, logWarn } from "@/lib/utils/log";
import { getRequestId } from "@/lib/utils/request-context";

const TOKEN_VERSION = "v1";
const TOKEN_TTL_SECONDS = 10 * 60;
const SECRET = process.env.BNF_CHECKIN_SECRET;
const RATE_LIMIT_STORE = "checkin";
const MAX_REQUESTS_PER_MINUTE = 10;

if (!SECRET) {
  logWarn("checkin_secret_not_set", {
    message: "BNF_CHECKIN_SECRET is not set; check-in tokens will fail to generate.",
  });
}

interface CheckInTokenPayload {
  sub: string;
  iat: number;
  exp: number;
  v: string;
}

const base64UrlEncode = (value: string) =>
  Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

const signPayload = (payload: CheckInTokenPayload) => {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", SECRET ?? "")
    .update(encodedPayload)
    .digest("hex");
  return `${TOKEN_VERSION}.${encodedPayload}.${signature}`;
};

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, "check_in.get");
    if (!auth.success) {
      return auth.response;
    }

    const { userId } = auth;

    if (isRateLimited(RATE_LIMIT_STORE, userId, MAX_REQUESTS_PER_MINUTE)) {
      logWarn("check_in.rate_limited", {
        userId,
        maxHits: MAX_REQUESTS_PER_MINUTE,
        requestId: getRequestId(),
        storeKey: RATE_LIMIT_STORE,
      });

      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": MAX_REQUESTS_PER_MINUTE.toString(),
          },
        },
      );
    }

    if (!SECRET) {
      logError("check_in.secret_not_configured", new Error("BNF_CHECKIN_SECRET not set"));
      return NextResponse.json({ error: "Check-in not configured" }, { status: 500 });
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const exp = nowSeconds + TOKEN_TTL_SECONDS;
    const checkInPayload: CheckInTokenPayload = {
      sub: userId,
      iat: nowSeconds,
      exp,
      v: TOKEN_VERSION,
    };

    const signed = signPayload(checkInPayload);

    return NextResponse.json({ token: signed, expiresAt: new Date(exp * 1000).toISOString() });
  } catch (err) {
    logError("check_in.token_generation_failed", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
