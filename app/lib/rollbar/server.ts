import Rollbar from "rollbar";

const token = process.env.BNF_ROLLBAR_SERVER_TOKEN;

let instance: Rollbar | null = null;

function getInstance(): Rollbar | null {
  if (typeof window !== "undefined") {
    return null;
  }
  if (!token) {
    return null;
  }
  if (!instance) {
    instance = new Rollbar({
      accessToken: token,
      captureUncaught: true,
      captureUnhandledRejections: true,
      environment: process.env.NODE_ENV ?? "development",
    });
  }
  return instance;
}

export function reportError(error: unknown, extra?: Record<string, unknown>): void {
  const rollbar = getInstance();
  if (!rollbar) {
    return;
  }
  const err = error instanceof Error ? error : new Error(String(error));
  rollbar.error(err, extra);
}
