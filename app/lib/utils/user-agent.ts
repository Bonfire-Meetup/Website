import { UAParser } from "ua-parser-js";

export const getUserAgentSummary = (userAgent?: string | null): string | null => {
  if (!userAgent) {
    return null;
  }

  const parser = new UAParser(userAgent);
  const { browser, os, device } = parser.getResult();
  const browserName = browser.name ?? null;
  const osName = os.name ?? null;
  const deviceLabel = device.model ?? device.type ?? null;

  const base = browserName && osName ? `${browserName} on ${osName}` : (browserName ?? osName);

  if (!base) {
    return null;
  }

  if (!deviceLabel) {
    return base;
  }

  return `${base} - ${deviceLabel}`;
};
