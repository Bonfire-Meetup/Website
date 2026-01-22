import { neon, type NeonQueryFunctionInTransaction } from "@neondatabase/serverless";
import { serverEnv } from "@/app/lib/config/env";

const providers = {
  neon: (url: string) => neon(url),
};

type TransactionCallback = (
  sql: NeonQueryFunctionInTransaction<false, false>,
) => ReturnType<NeonQueryFunctionInTransaction<false, false>>[];

export async function runTransaction(callback: TransactionCallback): Promise<unknown[][]> {
  const url = serverEnv.BNF_NEON_DATABASE_URL;
  if (!url) throw new Error("BNF_NEON_DATABASE_URL is not set");
  const sql = neon(url);
  return sql.transaction(callback);
}

export type DatabaseProvider = keyof typeof providers;
export type DatabaseClient = ReturnType<(typeof providers)[DatabaseProvider]>;

const getDatabaseProvider = (): DatabaseProvider => {
  const provider = serverEnv.BNF_DB_PROVIDER;
  if (!provider) return "neon";
  if (provider in providers) return provider as DatabaseProvider;
  throw new Error(`Unsupported database provider: ${provider}`);
};

const getDatabaseUrl = (required: boolean) => {
  const url = serverEnv.BNF_NEON_DATABASE_URL;
  if (!url && required) {
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
  if (!url) return null;
  return providers[provider](url);
}
