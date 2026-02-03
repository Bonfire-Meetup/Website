import { NextResponse, type NextRequest } from "next/server";

import { getAuthUserId, requireAuth, requireRole, resolveUserId } from "@/lib/api/auth";
import { getClientHashes, isRateLimited } from "@/lib/api/rate-limit";
import { logWarn } from "@/lib/utils/log";
import { getRequestId, runWithRequestContext } from "@/lib/utils/request-context";

export interface RouteContext {
  params: Promise<Record<string, string> | Record<string, never>>;
}
export type RouteHandler<Ctx = RouteContext, Req extends Request = NextRequest> = (
  request: Req,
  ctx: Ctx,
) => Promise<Response>;

export const withRequestContext =
  <Ctx = RouteContext, Req extends Request = NextRequest>(
    handler: RouteHandler<Ctx, Req>,
  ): RouteHandler<Ctx, Req> =>
  (request: Req, ctx: Ctx) =>
    runWithRequestContext(request, () => handler(request, ctx));

interface RateLimitArgs<Ctx, Req extends Request> {
  request: Req;
  ctx: Ctx;
  ipHash: string;
  uaHash: string;
  key: string;
}

interface RateLimitConfig<Ctx, Req extends Request> {
  storeKey: string;
  maxHits: number;
  windowSeconds?: number;
  keyFn?: (args: Omit<RateLimitArgs<Ctx, Req>, "key">) => string | Promise<string>;
  onLimit?: (args: RateLimitArgs<Ctx, Req>) => Response | Promise<Response>;
}

export const withRateLimit =
  <Ctx = RouteContext, Req extends Request = NextRequest>(config: RateLimitConfig<Ctx, Req>) =>
  (handler: RouteHandler<Ctx, Req>): RouteHandler<Ctx, Req> =>
  async (request: Req, ctx: Ctx) => {
    const { ipHash, uaHash } = await getClientHashes();
    const key = config.keyFn ? await config.keyFn({ request, ctx, ipHash, uaHash }) : ipHash;

    if (isRateLimited(config.storeKey, key, config.maxHits)) {
      if (config.onLimit) {
        return config.onLimit({ request, ctx, ipHash, uaHash, key });
      }

      logWarn("rate_limit.hit", {
        key,
        maxHits: config.maxHits,
        requestId: getRequestId(),
        storeKey: config.storeKey,
      });

      return NextResponse.json(
        { error: "Rate limited" },
        {
          status: 429,
          headers: {
            "Retry-After": String(config.windowSeconds ?? 60),
            "X-RateLimit-Limit": config.maxHits.toString(),
          },
        },
      );
    }

    return handler(request, ctx);
  };

export interface AuthContext {
  auth: {
    userId: string;
    roles: string[];
    payload: { sub?: string; rol?: string[] };
  };
}

export const withAuth =
  <Ctx = RouteContext, Req extends Request = NextRequest>(endpoint: string) =>
  (handler: RouteHandler<Ctx & AuthContext, Req>): RouteHandler<Ctx, Req> =>
  async (request: Req, ctx: Ctx) => {
    const auth = await requireAuth(request, endpoint);
    if (!auth.success) {
      return auth.response;
    }

    const base = (ctx ?? {}) as Record<string, unknown>;
    const nextCtx = { ...base, auth } as Ctx & AuthContext;
    return handler(request, nextCtx);
  };

export const withRole =
  <Ctx = RouteContext, Req extends Request = NextRequest>(endpoint: string, role: string) =>
  (handler: RouteHandler<Ctx & AuthContext, Req>): RouteHandler<Ctx, Req> =>
  async (request: Req, ctx: Ctx) => {
    const auth = await requireRole(request, endpoint, role);
    if (!auth.success) {
      return auth.response;
    }

    const base = (ctx ?? {}) as Record<string, unknown>;
    const nextCtx = { ...base, auth } as Ctx & AuthContext;
    return handler(request, nextCtx);
  };

export interface ResolvedUserContext {
  userId: string;
}

export const withResolvedUserId =
  <Ctx extends { params: Promise<Record<string, string>> }, Req extends Request = NextRequest>(
    endpoint: string,
    paramKey = "userId",
  ) =>
  (handler: RouteHandler<Ctx & ResolvedUserContext, Req>): RouteHandler<Ctx, Req> =>
  async (request: Req, ctx: Ctx) => {
    const params = await ctx.params;
    const userIdParam = params[paramKey];

    const userIdResult = await resolveUserId(request, endpoint, userIdParam);
    if (!userIdResult.success) {
      return userIdResult.response;
    }

    const base = (ctx ?? {}) as Record<string, unknown>;
    const nextCtx = { ...base, userId: userIdResult.userId } as Ctx & ResolvedUserContext;
    return handler(request, nextCtx);
  };

export interface OptionalResolvedUserContext {
  userId: string | null;
}

export const withOptionalResolvedUserId =
  <Ctx extends { params: Promise<Record<string, string>> }, Req extends Request = NextRequest>(
    endpoint: string,
    paramKey = "userId",
  ) =>
  (handler: RouteHandler<Ctx & OptionalResolvedUserContext, Req>): RouteHandler<Ctx, Req> =>
  async (request: Req, ctx: Ctx) => {
    const auth = await getAuthUserId(request);

    if (auth.status !== "valid" || !auth.userId) {
      const base = (ctx ?? {}) as Record<string, unknown>;
      const nextCtx = { ...base, userId: null } as Ctx & OptionalResolvedUserContext;
      return handler(request, nextCtx);
    }

    const params = await ctx.params;
    const userIdParam = params[paramKey];
    const resolvedUserId = userIdParam === "me" ? auth.userId : userIdParam;

    if (resolvedUserId !== auth.userId) {
      logWarn(`${endpoint}.forbidden`, {
        reason: "user_id_mismatch",
        requestedUserId: userIdParam,
        authenticatedUserId: auth.userId,
      });

      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const base = (ctx ?? {}) as Record<string, unknown>;
    const nextCtx = { ...base, userId: resolvedUserId } as Ctx & OptionalResolvedUserContext;
    return handler(request, nextCtx);
  };
