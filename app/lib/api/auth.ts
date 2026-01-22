import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { logWarn, logError } from "@/lib/utils/log";

type AuthResult =
  | { success: true; userId: string; payload: { sub?: string } }
  | { success: false; response: NextResponse };

export const requireAuth = async (request: Request, endpoint: string): Promise<AuthResult> => {
  const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
  const unauthorized = () => respond({ error: "unauthorized" }, { status: 401 });

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    logWarn(`${endpoint}.unauthorized`, { reason: "missing_header" });
    return { success: false, response: unauthorized() };
  }

  const token = authHeader.slice("Bearer ".length).trim();
  try {
    const payload = await verifyAccessToken(token);
    const userId = payload.sub;
    if (!userId) {
      logWarn(`${endpoint}.unauthorized`, { reason: "missing_user_id" });
      return { success: false, response: unauthorized() };
    }
    return { success: true, userId, payload };
  } catch (error) {
    logError(`${endpoint}.auth_failed`, error);
    logWarn(`${endpoint}.unauthorized`, { reason: "token_verification_failed" });
    return { success: false, response: unauthorized() };
  }
};
