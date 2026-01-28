import { type NextRequest, NextResponse } from "next/server";

import { DEFAULT_LOCALE, LOCALES_ARRAY, type Locale } from "./app/lib/i18n/locales";

const LOCALE_SET = new Set(LOCALES_ARRAY);

function isLocale(value: string | undefined): value is Locale {
  return Boolean(value) && LOCALE_SET.has(value as Locale);
}

function resolveHeaderLocale(value: string | null): Locale | null {
  if (!value) {
    return null;
  }
  const parts = value.split(",");
  for (const part of parts) {
    const [tag] = part.trim().split(";");
    const base = tag.toLowerCase().split("-")[0];
    if (isLocale(base)) {
      return base;
    }
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    const requestId = request.headers.get("x-bnf-request-id") ?? crypto.randomUUID();
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-bnf-request-id", requestId);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.headers.set("x-bnf-request-id", requestId);
    return response;
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/.well-known") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const [, maybeLocale] = pathname.split("/");

  if (isLocale(maybeLocale)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(`/${maybeLocale}`, "") || "/";
    return NextResponse.redirect(url);
  }

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const headerLocale = resolveHeaderLocale(request.headers.get("accept-language"));
  const locale = isLocale(cookieLocale) ? cookieLocale : (headerLocale ?? DEFAULT_LOCALE);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
