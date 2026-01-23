import "server-only";

import { type NeonQueryFunctionInTransaction, neon } from "@neondatabase/serverless";

import { serverEnv } from "@/lib/config/env";
import { logError, logWarn } from "@/lib/utils/log";

const providers = {
  neon: (url: string) => neon<false, false>(url),
};

const clientCache = new Map<string, ReturnType<typeof neon<false, false>>>();

type TransactionCallback = (
  sql: NeonQueryFunctionInTransaction<false, false>,
) => ReturnType<NeonQueryFunctionInTransaction<false, false>>[];

export function runTransaction(callback: TransactionCallback): Promise<unknown[][]> {
  const url = serverEnv.BNF_NEON_DATABASE_URL;

  if (!url) {
    const error = new Error("BNF_NEON_DATABASE_URL is not set");
    logError("db.transaction_failed", error);
    throw error;
  }

  const sql = getCachedClient("neon", url);

  return sql.transaction(callback).catch((error) => {
    logError("db.transaction_failed", error);
    throw error;
  });
}

export type DatabaseProvider = keyof typeof providers;

export type DatabaseClient = ReturnType<typeof neon<false, false>>;

export function getDatabaseErrorDetails(
  error: unknown,
  operation: string,
): Record<string, unknown> {
  const errorDetails: Record<string, unknown> = { operation };

  if (error && typeof error === "object") {
    if ("code" in error) {
      errorDetails.code = error.code;
    }

    const errorObj = error as { message?: unknown; name?: unknown };
    if (errorObj.message !== undefined) {
      const message = String(errorObj.message);
      errorDetails.message = message;

      const errorMessage = message.toLowerCase();
      if (errorMessage.includes("timeout") || errorMessage.includes("connection")) {
        errorDetails.errorType = "connection_error";
      } else if (errorMessage.includes("pool") || errorMessage.includes("exhausted")) {
        errorDetails.errorType = "pool_exhaustion";
      }
    }
    if (errorObj.name !== undefined) {
      errorDetails.name = String(errorObj.name);
    }
  }

  return errorDetails;
}

const getDatabaseProvider = (): DatabaseProvider => {
  const provider = serverEnv.BNF_DB_PROVIDER;

  if (!provider) {
    return "neon";
  }

  if (provider in providers) {
    return provider as DatabaseProvider;
  }

  const error = new Error(`Unsupported database provider: ${provider}`);
  logError("db.client_failed", error, { provider });
  throw error;
};

const getDatabaseUrl = (required: boolean) => {
  const url = serverEnv.BNF_NEON_DATABASE_URL;

  if (!url && required) {
    logWarn("db.missing_url", { provider: getDatabaseProvider() });
    throw new Error("BNF_NEON_DATABASE_URL is not set");
  }

  return url ?? null;
};

function getCachedClient(provider: DatabaseProvider, url: string): DatabaseClient {
  const cacheKey = `${provider}:${url}`;
  const cached = clientCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const client = providers[provider](url);
  clientCache.set(cacheKey, client);

  if (process.env.NODE_ENV === "development") {
    logWarn("db.client_created", { cacheSize: clientCache.size, provider });
  }

  return client;
}

export function getDatabaseClient(options?: {
  required?: true;
  provider?: DatabaseProvider;
}): DatabaseClient;

export function getDatabaseClient(options: {
  required: false;
  provider?: DatabaseProvider;
}): DatabaseClient | null;

export function getDatabaseClient(
  options: { required?: boolean; provider?: DatabaseProvider } = {},
): DatabaseClient | null {
  const required = options.required ?? true;
  const provider = options.provider ?? getDatabaseProvider();
  const url = getDatabaseUrl(required);

  if (!url) {
    return null;
  }

  try {
    return getCachedClient(provider, url);
  } catch (error) {
    logError("db.client_failed", error, { provider });
    throw error;
  }
}
