import { type NeonQueryFunctionInTransaction, neon } from "@neondatabase/serverless";

import { serverEnv } from "@/lib/config/env";
import { logError, logWarn } from "@/lib/utils/log";

const providers = {
  neon: (url: string) => neon(url),
};

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

  const sql = neon(url);

  return sql.transaction(callback).catch((error) => {
    logError("db.transaction_failed", error);
    throw error;
  });
}

export type DatabaseProvider = keyof typeof providers;

export type DatabaseClient = ReturnType<(typeof providers)[DatabaseProvider]>;

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
    return providers[provider](url);
  } catch (error) {
    logError("db.client_failed", error, { provider });
    throw error;
  }
}
