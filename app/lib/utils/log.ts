import crypto from "crypto";

import { serverEnv } from "@/lib/config/env";
import { getRequestId } from "@/lib/utils/request-context";

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  ts: string;
  level: LogLevel;
  event: string;
  data?: Record<string, unknown>;
}

const getLogSalt = () => serverEnv.BNF_LOG_SALT;

const hashValue = (value: string | null | undefined) => {
  const salt = getLogSalt();
  if (!salt || !value) {
    return null;
  }
  return crypto.createHmac("sha256", salt).update(value).digest("hex");
};

const normalizeError = (error: unknown) => {
  if (error instanceof Error) {
    return { message: error.message, name: error.name };
  }
  return { message: "unknown_error" };
};

const log = (level: LogLevel, event: string, data?: Record<string, unknown>) => {
  const requestId = getRequestId();
  const payloadData =
    requestId && (!data || !("requestId" in data)) ? { ...data, requestId } : data;
  const payload: LogPayload = {
    data: payloadData,
    event,
    level,
    ts: new Date().toISOString(),
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  // eslint-disable-next-line no-console
  console.log(line);
};

export const logInfo = (event: string, data?: Record<string, unknown>) => log("info", event, data);
export const logWarn = (event: string, data?: Record<string, unknown>) => log("warn", event, data);
export const logError = (event: string, error: unknown, data?: Record<string, unknown>) =>
  log("error", event, { ...data, error: normalizeError(error) });

export const getEmailFingerprint = (email: string) => {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1] ?? null;
  return {
    emailDomain: domain,
    emailHash: hashValue(normalized),
  };
};

export const getClientFingerprint = (input: { ip?: string | null; userAgent?: string | null }) => ({
  ipHash: hashValue(input.ip ?? null),
  userAgentHash: hashValue(input.userAgent ?? null),
});
