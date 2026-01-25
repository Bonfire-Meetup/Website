import { NextResponse } from "next/server";

import { verifyAccessToken } from "@/lib/auth/jwt";
import { logError, logWarn } from "@/lib/utils/log";

type AuthResult =
  | { success: true; userId: string; roles: string[]; payload: { sub?: string; rol?: string[] } }
  | { success: false; response: NextResponse };

export const requireAuth = async (request: Request, endpoint: string): Promise<AuthResult> => {
  const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
  const unauthorized = () => respond({ error: "unauthorized" }, { status: 401 });

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    logWarn(`${endpoint}.unauthorized`, { reason: "missing_header" });

    return { response: unauthorized(), success: false };
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const payload = await verifyAccessToken(token);
    const userId = payload.sub;

    if (!userId) {
      logWarn(`${endpoint}.unauthorized`, { reason: "missing_user_id" });

      return { response: unauthorized(), success: false };
    }

    return {
      payload,
      success: true,
      userId,
      roles: Array.isArray(payload.rol) ? payload.rol : [],
    };
  } catch (error) {
    logError(`${endpoint}.auth_failed`, error);
    logWarn(`${endpoint}.unauthorized`, { reason: "token_verification_failed" });

    return { response: unauthorized(), success: false };
  }
};

export const getAuthUserId = async (request: Request) => {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { status: "none" as const, userId: null, roles: [] as string[] };
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const payload = await verifyAccessToken(token);

    return {
      status: "valid" as const,
      userId: payload.sub ?? null,
      roles: Array.isArray(payload.rol) ? payload.rol : [],
    };
  } catch {
    return { status: "invalid" as const, userId: null, roles: [] as string[] };
  }
};

export const hasRole = (roles: string[], role: string): boolean => roles.includes(role);

export const hasAnyRole = (roles: string[], requiredRoles: string[]): boolean =>
  requiredRoles.some((role) => roles.includes(role));

export const hasAllRoles = (roles: string[], requiredRoles: string[]): boolean =>
  requiredRoles.every((role) => roles.includes(role));

export const requireRole = async (
  request: Request,
  endpoint: string,
  role: string,
): Promise<AuthResult> => {
  const auth = await requireAuth(request, endpoint);
  if (!auth.success) {
    return auth;
  }

  if (!hasRole(auth.roles, role)) {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
    logWarn(`${endpoint}.forbidden`, { reason: "missing_role", role });
    return { response: respond({ error: "forbidden" }, { status: 403 }), success: false };
  }

  return auth;
};

export const requireAnyRole = async (
  request: Request,
  endpoint: string,
  roles: string[],
): Promise<AuthResult> => {
  const auth = await requireAuth(request, endpoint);
  if (!auth.success) {
    return auth;
  }

  if (!hasAnyRole(auth.roles, roles)) {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
    logWarn(`${endpoint}.forbidden`, { reason: "missing_required_roles", roles });
    return { response: respond({ error: "forbidden" }, { status: 403 }), success: false };
  }

  return auth;
};

export const requireAllRoles = async (
  request: Request,
  endpoint: string,
  roles: string[],
): Promise<AuthResult> => {
  const auth = await requireAuth(request, endpoint);
  if (!auth.success) {
    return auth;
  }

  if (!hasAllRoles(auth.roles, roles)) {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
    logWarn(`${endpoint}.forbidden`, { reason: "missing_all_roles", roles });
    return { response: respond({ error: "forbidden" }, { status: 403 }), success: false };
  }

  return auth;
};

type ResolveUserIdResult =
  | { success: true; userId: string }
  | { success: false; response: NextResponse };

export const resolveUserId = async (
  request: Request,
  endpoint: string,
  userIdParam: string,
): Promise<ResolveUserIdResult> => {
  const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

  const auth = await requireAuth(request, endpoint);
  if (!auth.success) {
    return auth;
  }

  if (userIdParam === "me") {
    return { success: true, userId: auth.userId };
  }

  if (userIdParam !== auth.userId) {
    logWarn(`${endpoint}.forbidden`, {
      reason: "user_id_mismatch",
      requestedUserId: userIdParam,
      authenticatedUserId: auth.userId,
    });
    return { response: respond({ error: "forbidden" }, { status: 403 }), success: false };
  }

  return { success: true, userId: auth.userId };
};
