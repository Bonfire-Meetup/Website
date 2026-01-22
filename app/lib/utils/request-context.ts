import crypto from "crypto";
import { AsyncLocalStorage } from "node:async_hooks";

type RequestContext = {
  requestId: string;
};

const storage = new AsyncLocalStorage<RequestContext>();

export const runWithRequestContext = async <T>(
  request: Request,
  handler: () => Promise<T>,
): Promise<T> => {
  const requestId = request.headers.get("x-bnf-request-id") ?? crypto.randomUUID();
  return storage.run({ requestId }, handler);
};

export const getRequestId = () => storage.getStore()?.requestId ?? null;
