"use client";

import { reportError as rollbarReportError } from "@/lib/rollbar/client";

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  ts: string;
  level: LogLevel;
  event: string;
  data?: Record<string, unknown>;
}

const isDevelopment = process.env.NODE_ENV === "development";

const normalizeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: isDevelopment ? error.stack : undefined,
    };
  }

  return { message: "unknown_error" };
};

const log = (level: LogLevel, event: string, data?: Record<string, unknown>): void => {
  if (typeof window === "undefined") {
    return;
  }

  const shouldLog = level === "error" || level === "warn" || (level === "info" && isDevelopment);

  if (!shouldLog) {
    return;
  }

  const payload: LogPayload = {
    data,
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

  console.warn(line);
};

export const logInfo = (event: string, data?: Record<string, unknown>): void =>
  log("info", event, data);

export const logWarn = (event: string, data?: Record<string, unknown>): void =>
  log("warn", event, data);

export const logError = (event: string, error: unknown, data?: Record<string, unknown>): void => {
  log("error", event, { ...data, error: normalizeError(error) });
  rollbarReportError(error, { event, ...data });
};
