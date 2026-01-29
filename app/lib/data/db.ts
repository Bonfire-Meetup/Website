import "server-only";

import { neon } from "@neondatabase/serverless";
import { type ExtractTablesWithRelations } from "drizzle-orm";
import { type NeonHttpQueryResultHKT, drizzle } from "drizzle-orm/neon-http";
import { type PgTransaction } from "drizzle-orm/pg-core";

import { serverEnv } from "@/lib/config/env";
import { logError, logWarn } from "@/lib/utils/log";

import * as schema from "./schema";

export type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;
export type DrizzleTransaction = PgTransaction<
  NeonHttpQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

const clientCache = new Map<string, DrizzleClient>();

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

function getCachedClient(url: string): DrizzleClient {
  const cached = clientCache.get(url);

  if (cached) {
    return cached;
  }

  const neonClient = neon(url);
  const client = drizzle(neonClient, { schema });
  clientCache.set(url, client);

  if (process.env.NODE_ENV === "development") {
    logWarn("db.client_created", { cacheSize: clientCache.size });
  }

  return client;
}

export function db(options?: { required?: true }): DrizzleClient;
export function db(options: { required: false }): DrizzleClient | null;
export function db(options: { required?: boolean } = {}): DrizzleClient | null {
  const required = options.required ?? true;
  const url = serverEnv.BNF_NEON_DATABASE_URL;

  if (!url) {
    if (required) {
      logWarn("db.missing_url", {});
      throw new Error("BNF_NEON_DATABASE_URL is not set");
    }
    return null;
  }

  try {
    return getCachedClient(url);
  } catch (error) {
    logError("db.client_failed", error);
    throw error;
  }
}

export function runTransaction<T>(callback: (tx: DrizzleTransaction) => Promise<T>): Promise<T> {
  const client = db();
  return client.transaction(callback);
}
