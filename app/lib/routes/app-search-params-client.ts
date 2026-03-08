import { createSerializer, type inferParserType, parseAsString, parseAsStringLiteral } from "nuqs";

import { LOGIN_REASON } from "@/lib/routes/pages";

const LOGIN_REASON_VALUES = Object.values(LOGIN_REASON);

export const loginQueryParsers = {
  challenge: parseAsString,
  reasonHint: parseAsStringLiteral(LOGIN_REASON_VALUES),
  returnPath: parseAsString,
};

export const contactQueryParsers = {
  type: parseAsString,
};

export const newsletterEditorQueryParsers = {
  resend: parseAsString,
};

export const newsletterUnsubscribeQueryParsers = {
  token: parseAsString,
};

export type LoginQueryState = inferParserType<typeof loginQueryParsers>;

const loginQuerySerializer = createSerializer(loginQueryParsers, {
  urlKeys: { reasonHint: "reason-hint" },
});

export function sanitizeReturnPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return null;
  }

  if (value.includes("://") || value.includes("\\\\")) {
    return null;
  }

  return value;
}

export function createLoginUrl(params: Partial<LoginQueryState> = {}): string {
  return loginQuerySerializer("/login", params);
}
